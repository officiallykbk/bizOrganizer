import React from 'react';
import { Lightbulb, TrendingUp, DollarSign, Users } from 'lucide-react';

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ 
  onSuggestionClick, 
  disabled = false 
}) => {
  const suggestions = [
    {
      icon: <TrendingUp size={16} />,
      text: "Show me my business performance this month",
      query: "What's my business performance this month? Show me key metrics and trends."
    },
    {
      icon: <DollarSign size={16} />,
      text: "Analyze my revenue and profitability",
      query: "Analyze my revenue trends and profitability. What are the key insights?"
    },
    {
      icon: <Users size={16} />,
      text: "Who are my top customers?",
      query: "Who are my top customers by revenue? Show me customer analysis."
    },
    {
      icon: <Lightbulb size={16} />,
      text: "Give me business improvement suggestions",
      query: "Based on my current data, what suggestions do you have to improve my business?"
    }
  ];

  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.query)}
            disabled={disabled}
            className="flex items-center gap-2 p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-blue-600 flex-shrink-0">
              {suggestion.icon}
            </div>
            <span className="text-gray-700">{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;