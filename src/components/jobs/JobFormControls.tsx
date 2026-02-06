import React from 'react';
import { PAYMENT_STATUSES, DELIVERY_STATUSES } from '../../lib/constants';

interface JobFormControlsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isEditing: boolean;
  selectedJob: any;
}

const JobFormControls: React.FC<JobFormControlsProps> = ({
  formData,
  handleChange,
  isEditing,
  selectedJob
}) => {
  // Filter available delivery statuses based on editing state and current status
  const getAvailableDeliveryStatuses = () => {
    if (!isEditing) {
      // New job - only allow Scheduled
      return DELIVERY_STATUSES.filter(status => status.value === 'Scheduled');
    }

    // Editing existing job
    if (selectedJob?.delivery_status === 'Delivered' || selectedJob?.delivery_status === 'Cancelled') {
      // No changes allowed if already Delivered or Cancelled
      return DELIVERY_STATUSES.filter(status => status.value === selectedJob.delivery_status);
    }

    // Show all statuses except "Delayed" which is system-managed
    return DELIVERY_STATUSES.filter(status => 
      status.value === 'Scheduled' || 
      status.value === 'Delivered' || 
      status.value === 'Cancelled' ||
      (status.value === 'Delayed' && selectedJob?.delivery_status === 'Delayed')
    );
  };

  // Filter available payment statuses based on editing state
  const getAvailablePaymentStatuses = () => {
    if (!isEditing) {
      // New job - only allow Pending or Paid
      return PAYMENT_STATUSES.filter(status => 
        status.value === 'Pending' || status.value === 'Paid'
      );
    }

    // If delivery status is Cancelled, only show Refunded payment status
    if (formData.delivery_status === 'Cancelled') {
      return PAYMENT_STATUSES.filter(status => status.value === 'Refunded');
    }

    // Show all payment statuses in edit mode
    return PAYMENT_STATUSES;
  };

  const availableDeliveryStatuses = getAvailableDeliveryStatuses();
  const availablePaymentStatuses = getAvailablePaymentStatuses();

  return (
    <>
      <div>
        <label htmlFor="agreed_price" className="block text-sm font-medium text-gray-700 mb-1">
          Agreed Price ($)*
        </label>
        <input
          id="agreed_price"
          name="agreed_price"
          type="number"
          min="0"
          max="1000000"
          step="0.01"
          value={formData.agreed_price}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      
      <div>
        <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-1">
          Payment Status*
        </label>
        <select
          id="payment_status"
          name="payment_status"
          value={formData.payment_status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={formData.delivery_status === 'Cancelled'}
        >
          {availablePaymentStatuses.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        {!isEditing && (
          <p className="mt-1 text-sm text-gray-500">
            Only Pending or Paid status allowed for new jobs
          </p>
        )}
        {formData.delivery_status === 'Cancelled' && (
          <p className="mt-1 text-sm text-gray-500">
            Payment status is automatically set to Refunded for cancelled jobs
          </p>
        )}
      </div>
      
      <div>
        <label htmlFor="delivery_status" className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Status*
        </label>
        <select
          id="delivery_status"
          name="delivery_status"
          value={formData.delivery_status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={
            !isEditing || // Disabled for new jobs
            selectedJob?.delivery_status === 'Delivered' || // Disabled if already delivered
            selectedJob?.delivery_status === 'Cancelled' || // Disabled if cancelled
            (selectedJob?.delivery_status === 'Delayed' && formData.delivery_status === 'Delayed') // Disabled if delayed (system-set)
          }
        >
          {availableDeliveryStatuses.map(status => (
            <option 
              key={status.value} 
              value={status.value}
              disabled={status.value === 'Delayed'} // Delayed is system-set
            >
              {status.label}
            </option>
          ))}
        </select>
        {!isEditing && (
          <p className="mt-1 text-sm text-gray-500">
            New jobs are automatically set to "Scheduled" status
          </p>
        )}
        {isEditing && (selectedJob?.delivery_status === 'Delivered' || selectedJob?.delivery_status === 'Cancelled') && (
          <p className="mt-1 text-sm text-gray-500">
            Status cannot be changed after being marked as {selectedJob.delivery_status}
          </p>
        )}
      </div>
    </>
  );
};

export default JobFormControls;