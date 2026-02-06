import React from 'react';
import { ArrowDown } from 'lucide-react';

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToBottom: React.FC<ScrollToBottomProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-8 w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center z-10"
      aria-label="Scroll to bottom"
    >
      <ArrowDown size={20} />
    </button>
  );
};

export default ScrollToBottom;