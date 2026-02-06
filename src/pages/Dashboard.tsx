import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import Layout from '../components/layout/Layout';
import StatCards from '../components/dashboard/StatCards';
import RecentJobsList from '../components/dashboard/RecentJobsList';
import ChartContainer from '../components/dashboard/ChartContainer';
import ExportButton from '../components/data/ExportButton';
import { useJobStore } from '../store/jobStore';
import { calculateJobStats } from '../lib/utils';

const Dashboard: React.FC = () => {
  const { jobs, fetchJobs, isLoading } = useJobStore();
  const navigate = useNavigate();
  const stats = calculateJobStats(jobs);
  const [showActions, setShowActions] = useState(false);
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const handleAddJobClick = () => {
    navigate('/jobs');
  };
  
  if (isLoading && jobs.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>
      
      <div className="space-y-6">
        <StatCards stats={stats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartContainer jobs={jobs} />
          </div>
          <div>
            <RecentJobsList jobs={jobs} />
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end space-y-4">
        {showActions && (
          <div className="flex flex-col space-y-2 mb-2 animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
                Export Data
              </span>
              <button
                onClick={() => {}}
                className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center"
              >
                <Download size={24} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm">
                Add New Job
              </span>
              <button
                onClick={handleAddJobClick}
                className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-14 h-14 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 flex items-center justify-center"
        >
          {showActions ? (
            <span className="text-2xl font-bold">×</span>
          ) : (
            <Plus size={24} />
          )}
        </button>
      </div>
    </Layout>
  );
};

export default Dashboard;