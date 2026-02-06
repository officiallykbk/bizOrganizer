import React from 'react';
import { Wifi, WifiOff, RefreshCcw } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  onRetry 
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <Wifi size={16} />
        <span>AI Assistant Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
      <div className="flex items-center gap-2">
        <WifiOff size={16} />
        <span>AI service unavailable - using local data</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium"
        >
          <RefreshCcw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;