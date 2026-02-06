import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, type === 'error' ? 8000 : 5000); // Keep error messages longer
  };

  const removeToast = (id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-md px-4 py-3 shadow-md transform transition-all duration-500 ease-in-out ${
              toast.type === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' :
              toast.type === 'error' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' :
              toast.type === 'warning' ? 'bg-amber-100 text-amber-800 border-l-4 border-amber-500' :
              'bg-blue-100 text-blue-800 border-l-4 border-blue-500'
            }`}
            style={{ minWidth: '300px' }}
          >
            <div className="flex justify-between items-center">
              <p>{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};