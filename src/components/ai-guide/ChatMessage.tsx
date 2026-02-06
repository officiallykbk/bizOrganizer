import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: {
    text: string;
    isUser: boolean;
    timestamp: Date;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${
        message.isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Avatar */}
      {!message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-md ${
          message.isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-gray-100 text-gray-900 rounded-bl-none"
        }`}
      >
        {/* ✅ Markdown with proper styling */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className="text-xl font-bold mb-2 mt-3" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg font-bold mb-2 mt-2" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold mb-1 mt-2" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic" {...props} />
            ),
            code: ({ node, inline, className, children, ...props }) => (
              <code
                className={`${
                  inline
                    ? message.isUser
                      ? "bg-blue-700 px-1.5 py-0.5 rounded text-xs font-mono"
                      : "bg-gray-200 px-1.5 py-0.5 rounded text-xs font-mono"
                    : "block bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-xs font-mono my-2"
                }`}
                {...props}
              >
                {children}
              </code>
            ),
            pre: ({ node, ...props }) => (
              <pre className="my-2" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-gray-300 pl-3 italic my-2" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className={`underline ${message.isUser ? "text-blue-200" : "text-blue-600"} hover:opacity-80`}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-2">
                <table className="min-w-full divide-y divide-gray-200 text-xs" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gray-50" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="divide-y divide-gray-200" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-2 py-1 text-left font-semibold" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-2 py-1" {...props} />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>

        <div className="text-[10px] text-gray-500 mt-1 text-right">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </motion.div>
  );
};

export default ChatMessage;
