import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import JobForm from '../components/jobs/JobForm';
import JobsTable from '../components/jobs/JobsTable';
import { useJobStore } from '../store/jobStore';

const Jobs: React.FC = () => {
  const { selectedJob } = useJobStore();
  const [showForm, setShowForm] = React.useState(false);
  
  // Show form automatically when a job is selected for editing
  useEffect(() => {
    if (selectedJob) {
      setShowForm(true);
      // Scroll to form
      const formElement = document.getElementById('job-form-section');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedJob]);
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Cargo Jobs</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Hide Form' : 'Add New Job'}
        </button>
      </div>
      
      <div className="space-y-8">
        {showForm && (
          <section id="job-form-section">
            <JobForm 
              onSuccess={() => {
                setShowForm(false);
              }} 
            />
          </section>
        )}
        
        <section>
          <JobsTable />
        </section>
      </div>
    </Layout>
  );
};

export default Jobs;