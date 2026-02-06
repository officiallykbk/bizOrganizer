import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useJobStore } from '../../store/jobStore';
import { formatDate } from '../../lib/utils';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary';
}

const ExportButton: React.FC<ExportButtonProps> = ({ variant = 'primary' }) => {
  const { jobs } = useJobStore();
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportClick = () => {
    setIsExporting(true);
    
    try {
      // Convert jobs to CSV format
      const headers = [
        'ID',
        'Shipper Name',
        'Payment Status',
        'Delivery Status',
        'Pickup Location',
        'Dropoff Location',
        'Pickup Date',
        'Est. Delivery Date',
        'Actual Delivery Date',
        'Price',
        'Notes',
        'Created At'
      ];
      
      const csvRows = [
        headers.join(','),
        ...jobs.map(job => [
          job.id,
          `"${job.shipper_name.replace(/"/g, '""')}"`, // Escape quotes in text fields
          job.payment_status,
          job.delivery_status,
          job.pickup_location,
          job.dropoff_location,
          formatDate(job.pickup_date),
          formatDate(job.estimated_delivery_date),
          job.actual_delivery_date ? formatDate(job.actual_delivery_date) : '',
          job.agreed_price,
          `"${(job.notes || '').replace(/"/g, '""')}"`,
          formatDate(job.created_at)
        ].join(','))
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `cargo-jobs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <button
      onClick={handleExportClick}
      disabled={isExporting || jobs.length === 0}
      className={`flex items-center ${
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 px-4 py-2'
          : 'border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5'
      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        (isExporting || jobs.length === 0) ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <Download size={variant === 'primary' ? 18 : 16} className={variant === 'primary' ? 'mr-2' : 'mr-1.5'} />
      <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
    </button>
  );
};

export default ExportButton;