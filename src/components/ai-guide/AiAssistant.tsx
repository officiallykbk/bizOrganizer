import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { AIService } from "./AIService";
import { useBusinessContext } from "./AIBusinessContext";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ConnectionStatus from "./ConnectionStatus";
import QuickSuggestions from "./QuickSuggestions";
import ScrollToBottom from "./ScrollToBottom";
import { motion } from "framer-motion";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();
  const businessContext = useBusinessContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text,
      }));

      const response = await AIService.sendMessage(text, chatHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsConnected(true);
    } catch (error) {
      console.error("Error sending message:", error);
      addToast("Failed to send message to AI assistant", "error");
      setIsConnected(false);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "⚠️ Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

return (
  <div className="flex flex-col h-[90vh] max-h-screen bg-white rounded-lg shadow-lg overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-800">
          AI Business Assistant
        </h2>
      </div>
      <ConnectionStatus isConnected={isConnected} />
    </div>

    {/* Chat Scrollable Section */}
    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4" id="chat-scroll-area">
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center mt-12 space-y-3"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome to your AI Business Advisor 👋
          </h2>
          <p className="text-gray-500 text-sm max-w-md">
            Ready to get insights, predictions, and smart recommendations for
            your business? Choose a question to begin.
          </p>

          <div className="w-full max-w-2xl mt-6">
            <QuickSuggestions onSuggestionClick={handleQuickSuggestion} />
          </div>
        </motion.div>
      )}

      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-center space-x-2 text-gray-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>AI is typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* Input fixed at bottom */}
    <div className="border-t border-gray-200 bg-white p-4 flex-shrink-0">
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>

    <ScrollToBottom show={messages.length > 5} onClick={scrollToBottom} />
  </div>
);


};

export default AiAssistant;
