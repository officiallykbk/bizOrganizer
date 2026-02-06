import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { useJobStore } from '../../store/jobStore';
import { CargoJob, EditHistoryItem } from '../../types/job';

interface EditHistoryModalProps {
  jobId: string;
  onClose: () => void;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ jobId, onClose }) => {
  const { jobs, editHistory, fetchJobHistory, isLoading } = useJobStore();
  const [job, setJob] = useState<CargoJob | null>(null);
  
  useEffect(() => {
    fetchJobHistory(jobId);
    const foundJob = jobs.find(j => j.id === jobId);
    if (foundJob) {
      setJob(foundJob);
    }
  }, [jobId, fetchJobHistory, jobs]);
  
  // Format change values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
  };
  
  // Get field friendly name
  const getFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      'shipper_name': 'Shipper Name',
      'payment_status': 'Payment Status',
      'delivery_status': 'Delivery Status',
      'pickup_location': 'Pickup Location',
      'dropoff_location': 'Dropoff Location',
      'intermediate_stops': 'Intermediate Stops',
      'pickup_date': 'Pickup Date',
      'estimated_delivery_date': 'Est. Delivery Date',
      'actual_delivery_date': 'Actual Delivery Date',
      'agreed_price': 'Agreed Price',
      'notes': 'Notes'
    };
    
    return fieldNames[field] || field;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit History
            {job && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                {job.shipper_name} (ID: {job.id.substring(0, 8)}...)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : editHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No edit history found for this job.
            </div>
          ) : (
            <div className="space-y-6">
              {editHistory.map((item) => (
                <div key={item.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{getFieldName(item.field)}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          changed on {formatDate(item.changed_at)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        by {item.changed_by}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Before</h4>
                      <div className="rounded bg-gray-50 p-2 break-words whitespace-pre-wrap">
                        {formatValue(item.old_value)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">After</h4>
                      <div className="rounded bg-blue-50 p-2 break-words whitespace-pre-wrap">
                        {formatValue(item.new_value)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditHistoryModal;