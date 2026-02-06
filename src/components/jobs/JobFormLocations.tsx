import React from 'react';
import { US_STATES } from '../../lib/constants';

interface JobFormLocationsProps {
  formData: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const JobFormLocations: React.FC<JobFormLocationsProps> = ({
  formData,
  handleChange
}) => {
  return (
    <>
      <div>
        <label htmlFor="pickup_location" className="block text-sm font-medium text-gray-700 mb-1">
          Pickup Location*
        </label>
        <select
          id="pickup_location"
          name="pickup_location"
          value={formData.pickup_location}
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
    </>
  );
};

export default JobFormLocations;