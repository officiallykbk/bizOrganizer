import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useJobStore } from '../../store/jobStore';
import { useToast } from '../../context/ToastContext';
import { CargoJob, IntermediateStop } from '../../types/job';
import { formatDateForInput, parseFormDate } from '../../lib/utils';
import { validateJobPayload } from '../../utils/validateJob';
import { US_STATES } from '../../lib/constants';
import ShipperCombobox from './ShipperCombobox';
import ReceiptUpload from './ReceiptUpload';
import JobFormControls from './JobFormControls';
import JobFormLocations from './JobFormLocations';
import JobFormDates from './JobFormDates';
import IntermediateStopsManager from './IntermediateStopsManager';

interface JobFormProps {
  onSuccess?: () => void;
}

const today = format(new Date(), 'yyyy-MM-dd');
const nextWeek = format(new Date(new Date().setDate(new Date().getDate() + 7)), 'yyyy-MM-dd');

const emptyJob: Omit<CargoJob, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
  shipper_name: '',
  payment_status: 'Pending',
  delivery_status: 'Scheduled', // Default status for new jobs
  pickup_location: '',
  dropoff_location: '',
  intermediate_stops: [],
  pickup_date: today,
  estimated_delivery_date: nextWeek,
  actual_delivery_date: null,
  agreed_price: 0,
  notes: '',
  receipt_url: ''
};

const JobForm: React.FC<JobFormProps> = ({ onSuccess }) => {
  const { addJob, updateJob, selectedJob, selectJob } = useJobStore();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<any>(emptyJob);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stopLocation, setStopLocation] = useState('');
  const [stopArrival, setStopArrival] = useState('');
  const [stopNotes, setStopNotes] = useState('');
  
  useEffect(() => {
    if (selectedJob) {
      setFormData({
        ...selectedJob,
        pickup_date: formatDateForInput(selectedJob.pickup_date),
        estimated_delivery_date: formatDateForInput(selectedJob.estimated_delivery_date),
        actual_delivery_date: selectedJob.actual_delivery_date ? formatDateForInput(selectedJob.actual_delivery_date) : null
      });
      setIsEditing(true);
    } else {
      setFormData(emptyJob);
      setIsEditing(false);
    }
  }, [selectedJob]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'actual_delivery_date') {
      setFormData({
        ...formData,
        [name]: value || null
      });
      return;
    }

    // Handle delivery status changes
    if (name === 'delivery_status') {
      let newPaymentStatus = formData.payment_status;

      // If changing to Cancelled, set payment status to Refunded
      if (value === 'Cancelled') {
        newPaymentStatus = 'Refunded';
      }

      setFormData({
        ...formData,
        [name]: value,
        payment_status: newPaymentStatus
      });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseFloat(value) : value
    });
  };
  
  const handleShipperChange = (value: string) => {
    setFormData({
      ...formData,
      shipper_name: value
    });
  };
  
  const handleAddStop = () => {
    if (!stopLocation || !stopArrival) {
      addToast('Stop location and estimated arrival are required', 'warning');
      return;
    }
    
    const newStop: IntermediateStop = {
      location: stopLocation,
      estimated_arrival: parseFormDate(stopArrival),
      notes: stopNotes
    };
    
    setFormData({
      ...formData,
      intermediate_stops: [...formData.intermediate_stops, newStop]
    });
    
    setStopLocation('');
    setStopArrival('');
    setStopNotes('');
  };
  
  const handleRemoveStop = (index: number) => {
    const updatedStops = [...formData.intermediate_stops];
    updatedStops.splice(index, 1);
    
    setFormData({
      ...formData,
      intermediate_stops: updatedStops
    });
  };
  
  const resetForm = () => {
    setFormData(emptyJob);
    setIsEditing(false);
    selectJob(null);
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic required checks
    if (!formData.shipper_name || !formData.pickup_location || !formData.dropoff_location) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    // Validate against shared contract
    const contractPayload = {
      booking_date: formData.pickup_date,
      amount: formData.agreed_price,
      currency: (formData.currency as string) || undefined,
      status: formData.delivery_status,
      payment_status: formData.payment_status,
      delivered_at: formData.actual_delivery_date || undefined,
      customer_id: formData.shipper_name,
      receipt_urls: formData.receipt_url ? [formData.receipt_url] : undefined,
      notes: formData.notes,
      location_id: formData.dropoff_location
    };

    const { valid, errors, sanitized } = validateJobPayload(contractPayload);
    if (!valid) {
      addToast(errors.join('; '), 'error');
      return;
    }

    // Validate date ordering (pickup < estimated)
    try {
      const pickupDate = new Date(sanitized.booking_date);
      const estimatedDate = new Date(parseFormDate(formData.estimated_delivery_date));

      if (pickupDate >= estimatedDate) {
        addToast('Estimated delivery date must be after pickup date', 'error');
        return;
      }

      if (formData.actual_delivery_date) {
        const actualDate = new Date(formData.actual_delivery_date);
        if (actualDate < pickupDate) {
          addToast('Actual delivery date cannot be before pickup date', 'error');
          return;
        }
      }
    } catch (error) {
      addToast('Invalid date format', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const jobData = {
        ...formData,
        agreed_price: sanitized.amount,
        pickup_date: sanitized.booking_date,
        estimated_delivery_date: parseFormDate(formData.estimated_delivery_date),
        actual_delivery_date: formData.actual_delivery_date ? parseFormDate(formData.actual_delivery_date) : null,
        intermediate_stops: formData.intermediate_stops.map((stop: IntermediateStop) => ({
          ...stop,
          estimated_arrival: parseFormDate(stop.estimated_arrival)
        })),
        delivery_status: sanitized.status,
        payment_status: sanitized.payment_status,
        receipt_url: sanitized.receipt_urls ? sanitized.receipt_urls[0] : (formData.receipt_url || '')
      };
      
      if (isEditing && selectedJob) {
        // Merge with selected job but ensure we have all required fields
        const updatedJobData = {
          ...selectedJob,
          ...jobData,
          id: selectedJob.id,
          created_at: selectedJob.created_at,
          created_by: selectedJob.created_by
        };
        await updateJob(updatedJobData);
        addToast('Job updated successfully', 'success');
      } else {
        await addJob(jobData);
        addToast('Job added successfully', 'success');
      }
      
      resetForm();
    } catch (error) {
      console.error('Form submission error:', error);
      addToast(error instanceof Error ? error.message : 'Error saving job', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Job' : 'Add New Job'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <ShipperCombobox
            value={formData.shipper_name}
            onChange={handleShipperChange}
            disabled={isSubmitting}
          />
        </div>

        <JobFormControls
          formData={formData}
          handleChange={handleChange}
          isEditing={isEditing}
          selectedJob={selectedJob}
        />
        
        <JobFormLocations
          formData={formData}
          handleChange={handleChange}
        />
        
        <JobFormDates
          formData={formData}
          handleChange={handleChange}
        />
        
        <div>
          <label htmlFor="dropoff_location" className="block text-sm font-medium text-gray-700 mb-1">
            Dropoff Location*
          </label>
          <select
            id="dropoff_location"
            name="dropoff_location"
            value={formData.dropoff_location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select State</option>
            {US_STATES.map(state => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>

        {/* <div className="mb-6">
          <IntermediateStopsManager
            stops={formData.intermediate_stops}
            onAddStopClick={handleAddStop}
            onRemoveStop={handleRemoveStop}
            stopLocation={stopLocation}
            setStopLocation={setStopLocation}
            stopArrival={stopArrival}
            setStopArrival={setStopArrival}
            stopNotes={stopNotes}
            setStopNotes={setStopNotes}
          />
        </div> */}
        
        <div className="mb-6">
          <ReceiptUpload
            value={formData.receipt_url}
            onChange={(url) => setFormData({ ...formData, receipt_url: url })}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes about this job..."
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;