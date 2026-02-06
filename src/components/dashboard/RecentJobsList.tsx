import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Truck } from 'lucide-react';
import { CargoJob } from '../../types/job';
import { formatDate, getStatusColor } from '../../lib/utils';

interface RecentJobsListProps {
  jobs: CargoJob[];
}

const RecentJobsList: React.FC<RecentJobsListProps> = ({ jobs }) => {
  const navigate = useNavigate();
  
  const recentJobs = jobs.slice(0, 5);
  
  const handleViewAll = () => {
    navigate('/jobs');
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Recent Jobs</h2>
        <button
          onClick={handleViewAll}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          View All <ArrowRight size={16} className="ml-1" />
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {recentJobs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No jobs found.
          </div>
        ) : (
          recentJobs.map((job) => (
            <div key={job.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="p-2 bg-blue-50 rounded-full mr-3">
                  <Truck className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.shipper_name}</h3>
                      <p className="text-sm text-gray-500">
                        {job.pickup_location} → {job.dropoff_location}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.delivery_status)}`}>
                        {job.delivery_status}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {formatDate(job.pickup_date)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentJobsList;