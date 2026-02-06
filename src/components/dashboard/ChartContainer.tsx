import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { CargoJob } from '../../types/job';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface ChartContainerProps {
  jobs: CargoJob[];
}

const ChartContainer: React.FC<ChartContainerProps> = ({ jobs }) => {
  // Prepare data for status distribution chart
  const statusCounts = {
    Scheduled: 0,
    Delayed: 0,
    Delivered: 0,
    Cancelled: 0
  };
  
  jobs.forEach(job => {
    if (job.delivery_status in statusCounts) {
      statusCounts[job.delivery_status as keyof typeof statusCounts]++;
    }
  });
  
  const statusData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)', // blue - Scheduled
          'rgba(239, 68, 68, 0.7)',  // red - Delayed
          'rgba(16, 185, 129, 0.7)', // green - Delivered
          'rgba(107, 114, 128, 0.7)' // gray - Cancelled
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare data for monthly revenue chart
  const monthlyRevenue: Record<string, number> = {};
  
  // Get last 6 months
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthlyRevenue[monthKey] = 0;
  }
  
  // Sum up revenue by month
  jobs.forEach(job => {
    const jobDate = new Date(job.created_at);
    const monthKey = jobDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    if (monthKey in monthlyRevenue) {
      monthlyRevenue[monthKey] += job.agreed_price;
    }
  });
  
  const revenueData = {
    labels: Object.keys(monthlyRevenue),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(monthlyRevenue),
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // green
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Revenue'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: number) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Status Distribution</h3>
        <div className="h-64">
          <Pie data={statusData} />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        <div className="h-64">
          <Bar data={revenueData} options={revenueOptions as any} />
        </div>
      </div>
    </div>
  );
};

export default ChartContainer;