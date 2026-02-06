
import { supabase } from '../../lib/supabase';

type ChatHistoryItem = { role: string; content: string };

/**
 * AIService
 * - sendMessage(message, history, onChunk?)
 *    - message: user message string
 *    - history: chat history array
 *    - onChunk: optional callback receiving incremental text chunks (string)
 *
 * Returns: full concatenated response string (Promise<string>)
 *
 * This implementation:
 * - Uses Supabase session token for auth if available
 * - Handles streaming ReadableStream responses robustly
 * - Parses SSE "data:" lines, newline-delimited JSON, raw JSON, and plain text
 * - Safely extracts text from common Gemini shapes:
 *    - { delta: { content: { parts: [{ text: "..." }] } } }
 *    - { candidates: [{ content: { parts: [{ text: "..." }] } }] }
 *    - { text: "..." } or { response: "..." }
 * - Falls back to pretty-printed JSON instead of [object Object]
 */
export class AIService {
  private static readonly API_URL =
    'https://ggryjtvgaqjprfgkqgaa.supabase.co/functions/v1/dynamic-action';

  private static safeExtractTextFromObject(obj: any): string {
    if (!obj) return '';

    // streaming delta (common)
    if (obj.delta?.content?.parts?.length) {
      return obj.delta.content.parts.map((p: any) => p.text || '').join('');
    }

    // full response candidates
    if (obj.candidates?.length) {
      // join all candidate parts text (usually index 0 is primary)
      try {
        const candidateParts =
          obj.candidates[0]?.content?.parts ??
          obj.candidates.map((c: any) => c?.content?.parts || []).flat();
        if (candidateParts && candidateParts.length) {
          return candidateParts.map((p: any) => p.text || '').join('');
        }
      } catch (e) {
        // ignore and continue
      }
    }

    // plain shapes
    if (typeof obj.text === 'string') return obj.text;
    if (typeof obj.response === 'string') return obj.response;
    if (typeof obj.answer === 'string') return obj.answer;

    // Some backends might include "content" directly
    if (obj.content?.parts?.length) {
      return obj.content.parts.map((p: any) => p.text || '').join('');
    }

    // Best-effort: search recursively for the first string leaf
    const queue = [obj];
    while (queue.length) {
      const current = queue.shift();
      if (typeof current === 'string') return current;
      if (Array.isArray(current)) {
        for (const item of current) queue.push(item);
      } else if (current && typeof current === 'object') {
        for (const k of Object.keys(current)) queue.push(current[k]);
      }
    }

    // Fallback: pretty-print JSON rather than [object Object]
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  static async sendMessage(
    message: string,
    chatHistory: ChatHistoryItem[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // attach session token if available
    const { data: { session } = {} as any } = await supabase.auth.getSession();
    const token = session?.access_token;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    // backend expects { message, history } (keeps compatibility with your edge function)
    const payload = { message, history: chatHistory };

    const res = await fetch(this.API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const errMsg = text || `AI endpoint returned status ${res.status}`;
      console.error('AIService.sendMessage error:', res.status, errMsg);
      throw new Error(errMsg);
    }

    // If there's no body/stream, attempt to parse JSON / text
    if (!res.body) {
      try {
        const json = await res.json();
        const extracted = AIService.safeExtractTextFromObject(json);
        return extracted || JSON.stringify(json);
      } catch {
        const txt = await res.text().catch(() => '');
        return txt;
      }
    }

    // STREAM READING: robust parser that handles:
    // - SSE (lines starting with "data:")
    // - newline-delimited JSON
    // - plain text
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let done = false;
    let buffer = '';
    let finalText = '';

    try {
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = !!readerDone;
        if (value) {
          // decode chunk (may be partial)
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Normalize common separators to newline so we can split safely
          // (SSE uses '\n\n' between events; some streams send '\r\n')
          // We'll split on newline and carefully preserve leftover partial line in buffer.
          const lines = buffer.split(/\r?\n/);
          // Keep last (possibly partial) line in buffer
          buffer = lines.pop() || '';

          for (let rawLine of lines) {
            rawLine = rawLine.trim();
            if (!rawLine) continue;

            // If line starts with "data:", extract after it
            let payloadText = rawLine;
            if (rawLine.startsWith('data:')) {
              payloadText = rawLine.replace(/^data:\s*/i, '');
            }

            // If the server uses a sentinel
            if (payloadText === '[DONE]' || payloadText === 'DONE') {
              // ignore sentinel but we continue reading until done
              continue;
            }

            // Attempt to parse payloadText as JSON; if fails, treat as plain text
            let parsed: any = null;
            let emitted = '';

            // Try JSON parse first
            try {
              parsed = JSON.parse(payloadText);
            } catch {
              parsed = null;
            }

            if (parsed) {
              emitted = AIService.safeExtractTextFromObject(parsed);
            } else {
              // Not JSON — it's raw text chunk. Append as-is.
              emitted = payloadText;
            }

            if (emitted) {
              finalText += emitted;
              if (onChunk) {
                try { onChunk(emitted); } catch (e) { console.warn('onChunk handler failed', e); }
              }
            }
          }
        }
      }

      // After stream ends, attempt to process any leftover buffer
      const leftover = buffer.trim();
      if (leftover) {
        let emittedLeft = '';
        if (leftover.startsWith('data:')) {
          const after = leftover.replace(/^data:\s*/i, '');
          try {
            const parsedLeft = JSON.parse(after);
            emittedLeft = AIService.safeExtractTextFromObject(parsedLeft);
          } catch {
            emittedLeft = after;
          }
        } else {
          try {
            const parsedLeft = JSON.parse(leftover);
            emittedLeft = AIService.safeExtractTextFromObject(parsedLeft);
          } catch {
            emittedLeft = leftover;
          }
        }

        if (emittedLeft) {
          finalText += emittedLeft;
          if (onChunk) {
            try { onChunk(emittedLeft); } catch (e) { console.warn('onChunk handler failed', e); }
          }
        }
      }

      return finalText;
    } catch (streamErr) {
      console.error('AIService: error reading stream, will attempt fallback read', streamErr);
      // fallback: attempt to read as full text
      try {
        // Note: response body already read partially; but we'll attempt res.clone() earlier in future if needed.
        const text = await res.text();
        // attempt to parse JSON if it looks like JSON
        try {
          const parsed = JSON.parse(text);
          const extracted = AIService.safeExtractTextFromObject(parsed);
          if (extracted) return extracted;
        } catch {
          // not JSON
        }
        return text;
      } catch (fallbackErr) {
        throw new Error('Failed to read streaming response and fallback failed.');
      }
    } finally {
      try { reader.releaseLock(); } catch {}
    }
  }

  // preserve fallback generator
  static generateFallbackResponse(message: string, stats: any): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('performance') || lowerMessage.includes('metrics')) {
      return `Based on your local data:\n\n• You have ${stats.total} total jobs\n• ${stats.delivered} delivered (${((stats.delivered / stats.total) * 100 || 0).toFixed(1)}% completion rate)\n• Total revenue: $${stats.totalRevenue.toLocaleString()}\n• Pending revenue: $${stats.pendingRevenue.toLocaleString()}\n• Average delivery time: ${stats.avgDeliveryTime} days\n\nThe AI service is currently unavailable. Please try again later for more detailed insights.`;
    }

    if (lowerMessage.includes('revenue') || lowerMessage.includes('money') || lowerMessage.includes('profit')) {
      return `Revenue Analysis (Local Data):\n\n• Total Revenue: $${stats.totalRevenue.toLocaleString()}\n• Pending Payments: $${stats.pendingRevenue.toLocaleString()}\n• Collection Rate: ${(((stats.totalRevenue - stats.pendingRevenue) / stats.totalRevenue) * 100 || 0).toFixed(1)}%\n\nFor detailed financial analysis, please try again when the AI service is available.`;
    }

    return `I'm currently running on local data only. Here's what I can tell you:\n\n• Total Jobs: ${stats.total}\n• Active Jobs: ${stats.active}\n• Delivered Jobs: ${stats.delivered}\n• Total Revenue: $${stats.totalRevenue.toLocaleString()}\n\nThe AI service is temporarily unavailable. Please try again later for more intelligent insights and recommendations.`;
  }
}
