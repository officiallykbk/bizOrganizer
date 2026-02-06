import React, { useState, useRef } from 'react';
import { Upload, X, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import ReceiptViewerModal from '../ui/ReceiptViewerModal';

interface ReceiptUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({ value, onChange, disabled }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      onChange(filePath);
      addToast('Receipt uploaded successfully', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      addToast(error.message || 'Failed to upload receipt', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleView = async () => {
    if (!value) return;

    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(value, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        setSignedUrl(data.signedUrl);
        setIsViewerOpen(true);
      }
    } catch (error: any) {
      console.error('View error:', error);
      addToast(error.message || 'Failed to load receipt', 'error');
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      const { error } = await supabase.storage
        .from('receipts')
        .remove([value]);

      if (error) throw error;

      onChange(null);
      addToast('Receipt removed successfully', 'success');
    } catch (error: any) {
      console.error('Remove error:', error);
      addToast(error.message || 'Failed to remove receipt', 'error');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Receipt Photo
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Remove
          </button>
        )}
      </div>

      {value ? (
        <div className="relative rounded-lg border border-gray-300 p-2">
          <div className="relative group">
            <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Receipt uploaded</p>
                <button
                  type="button"
                  onClick={handleView}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className={`w-full border-2 border-dashed rounded-lg p-4 text-center hover:border-gray-400 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="flex flex-col items-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
                  <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload receipt photo
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </>
              )}
            </div>
          </button>
        </div>
      )}

      {isViewerOpen && signedUrl && (
        <ReceiptViewerModal
          imageUrl={signedUrl}
          onClose={() => {
            setIsViewerOpen(false);
            setSignedUrl(null);
          }}
        />
      )}
    </div>
  );
};

export default ReceiptUpload;