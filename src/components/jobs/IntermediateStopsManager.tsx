import React from 'react';
import { X, Plus } from 'lucide-react';
import { US_STATES } from '../../lib/constants';
import { IntermediateStop } from '../../types/job';

interface IntermediateStopsManagerProps {
  stops: IntermediateStop[];
  onAddStop: (stop: IntermediateStop) => void;
  onRemoveStop: (index: number) => void;
  stopLocation: string;
  setStopLocation: (location: string) => void;
  stopArrival: string;
  setStopArrival: (arrival: string) => void;
  stopNotes: string;
  setStopNotes: (notes: string) => void;
  onAddStopClick: () => void;
}

const IntermediateStopsManager: React.FC<IntermediateStopsManagerProps> = ({
  stops,
  onRemoveStop,
  stopLocation,
  setStopLocation,
  stopArrival,
  setStopArrival,
  stopNotes,
  setStopNotes,
  onAddStopClick
}) => {
  return (
    <div className="mt-6 mb-4">
      <h3 className="text-lg font-medium text-gray-700 mb-2">Intermediate Stops</h3>
      
      {stops.length > 0 && (
        <div className="mb-4 border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estimated Arrival
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stops.map((stop: IntermediateStop, index: number) => (
                <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {stop.location}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {stop.estimated_arrival}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {stop.notes || '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                    <button
                      type="button"
                      onClick={() => onRemoveStop(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-md">
        <div>
          <label htmlFor="stopLocation" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            id="stopLocation"
            value={stopLocation}
            onChange={(e) => setStopLocation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="stopArrival" className="block text-sm font-medium text-gray-700 mb-1">
            Estimated Arrival (DD/MM/YYYY)
          </label>
          <input
            id="stopArrival"
            type="text"
            pattern="\d{2}/\d{2}/\d{4}"
            placeholder="DD/MM/YYYY"
            value={stopArrival}
            onChange={(e) => setStopArrival(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="stopNotes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <input
            id="stopNotes"
            type="text"
            value={stopNotes}
            onChange={(e) => setStopNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-end">
          <button
            type="button"
            onClick={onAddStopClick}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md border border-gray-300 hover:bg-gray-200 flex items-center"
          >
            <Plus size={18} className="mr-1" />
            Add Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntermediateStopsManager;