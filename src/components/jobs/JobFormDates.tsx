import React from 'react';

interface JobFormDatesProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const JobFormDates: React.FC<JobFormDatesProps> = ({
  formData,
  handleChange
}) => {
  return (
    <>
      <div>
        <label htmlFor="pickup_date" className="block text-sm font-medium text-gray-700 mb-1">
          Pickup Date*
        </label>
        <input
          id="pickup_date"
          name="pickup_date"
          type="date"
          value={formData.pickup_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="estimated_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Delivery Date*
        </label>
        <input
          id="estimated_delivery_date"
          name="estimated_delivery_date"
          type="date"
          value={formData.estimated_delivery_date}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="actual_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
          Actual Delivery Date (Optional)
        </label>
        <input
          id="actual_delivery_date"
          name="actual_delivery_date"
          type="date"
          value={formData.actual_delivery_date || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </>
  );
};

export default JobFormDates;