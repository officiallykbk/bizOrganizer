// Lightweight validator and normalizer for job payloads for cargo-web.
// Keep identical to the mobile validator to ensure parity between apps.

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  sanitized?: any;
};

const STATUS_VALUES = ['Scheduled', 'Delivered', 'Cancelled', 'Delayed'];
const PAYMENT_VALUES = ['Pending', 'Paid', 'Refunded'];

function isISODateString(v: any) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function toISODateString(input: any): string | null {
  if (!input) return null;
  if (isISODateString(input)) return input;
  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    const d = String(input.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Fallback: try Date parsing
  const parsed = new Date(String(input));
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getUTCFullYear();
    const m = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const d = String(parsed.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return null;
}

function isISODateTimeString(v: any) {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(v);
}

function toISODateTimeUTC(date = new Date()): string {
  return new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function parseAmount(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number(value.toFixed(2));
  if (typeof value === 'string') {
    // remove commas and trim
    const normalized = value.replace(/,/g, '').trim();
    const n = Number(normalized);
    if (!Number.isNaN(n)) return Number(n.toFixed(2));
  }
  return null;
}

export function validateJobPayload(payload: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};

  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['payload must be an object'] };
  }

  // booking_date required, normalized to YYYY-MM-DD
  const bookingDate = toISODateString(payload.booking_date);
  if (!bookingDate) errors.push('booking_date required and must parse to YYYY-MM-DD');
  else sanitized.booking_date = bookingDate;

  // amount / agreed_price required
  const amountRaw = payload.amount ?? payload.agreed_price;
  const amount = parseAmount(amountRaw);
  if (amount === null) errors.push('amount or agreed_price required and must be numeric');
  else sanitized.amount = amount;

  // currency optional but normalized
  if (payload.currency) sanitized.currency = String(payload.currency).toUpperCase();

  // status
  if (!payload.status || typeof payload.status !== 'string') {
    errors.push('status is required');
  } else if (!STATUS_VALUES.includes(payload.status)) {
    errors.push(`status must be one of: ${STATUS_VALUES.join(', ')}`);
  } else sanitized.status = payload.status;

  // payment_status
  if (!payload.payment_status || typeof payload.payment_status !== 'string') {
    errors.push('payment_status is required');
  } else if (!PAYMENT_VALUES.includes(payload.payment_status)) {
    errors.push(`payment_status must be one of: ${PAYMENT_VALUES.join(', ')}`);
  } else sanitized.payment_status = payload.payment_status;

  // delivered_at handling: if status is Delivered and delivered_at missing, set now
  if (sanitized.status === 'Delivered') {
    if (payload.delivered_at) {
      const dt = payload.delivered_at;
      if (isISODateTimeString(dt)) sanitized.delivered_at = dt;
      else {
        // try parsing
        const parsed = new Date(String(dt));
        if (!Number.isNaN(parsed.getTime())) sanitized.delivered_at = toISODateTimeUTC(parsed);
        else sanitized.delivered_at = toISODateTimeUTC();
      }
    } else {
      sanitized.delivered_at = toISODateTimeUTC();
    }
  } else if (payload.delivered_at) {
    // if provided but status not Delivered, still accept ISO datetime but warn
    const dt = payload.delivered_at;
    if (isISODateTimeString(dt)) sanitized.delivered_at = dt;
    else {
      const parsed = new Date(String(dt));
      if (!Number.isNaN(parsed.getTime())) sanitized.delivered_at = toISODateTimeUTC(parsed);
      else errors.push('delivered_at, if provided, must be a valid datetime');
    }
  }

  // customer_id
  if (payload.customer_id) sanitized.customer_id = String(payload.customer_id);

  // receipt_urls: array of strings
  if (payload.receipt_urls) {
    if (!Array.isArray(payload.receipt_urls)) errors.push('receipt_urls must be an array of urls');
    else sanitized.receipt_urls = payload.receipt_urls.map((u: any) => String(u));
  }

  // notes
  if (payload.notes) sanitized.notes = String(payload.notes).slice(0, 2000);

  // location_id optional
  if (payload.location_id) sanitized.location_id = String(payload.location_id);

  // Ensure clients are not sending server-managed fields
  if ('created_at' in payload) errors.push('created_at must not be set by client');
  if ('updated_at' in payload) errors.push('updated_at must not be set by client');

  const valid = errors.length === 0;
  return { valid, errors, sanitized };
}

export function normalizeBookingDate(input: any): string | null {
  return toISODateString(input);
}
