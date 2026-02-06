import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ReceiptViewerModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({ imageUrl, onClose }) => {
  const [zoom, setZoom] = React.useState(1);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] m-4 flex flex-col">
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={20} className="text-gray-700" />
            </button>
            <span className="px-3 text-sm font-medium text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={20} className="text-gray-700" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-colors"
            title="Close (Esc)"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt="Receipt"
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.2s ease-in-out',
            }}
            className="max-w-full h-auto rounded-lg shadow-2xl"
          />
        </div>

        <div className="text-center py-3 text-white/80 text-sm">
          Click outside or press ESC to close
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewerModal;
