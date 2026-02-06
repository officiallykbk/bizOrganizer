import React, { useState, useEffect } from 'react';
import { useJobStore } from '../../store/jobStore';
import { calculateJobStats } from '../../lib/utils';
import StatCards from '../dashboard/StatCards';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  PointElement, 
  LineElement
);

// Get stored preferences or set defaults
const getStoredPreferences = () => {
  const stored = localStorage.getItem('stats-preferences');
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    timeRange: 'month',
    customRange: {
      start: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd')
    }
  };
};

const StatsOverview: React.FC = () => {
  const { jobs } = useJobStore();
  const [preferences, setPreferences] = useState(getStoredPreferences());
  const [filteredJobs, setFilteredJobs] = useState(jobs);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('stats-preferences', JSON.stringify(preferences));
  }, [preferences]);
  
  // Filter jobs based on date range
  useEffect(() => {
    let start: Date;
    let end: Date;
    
    if (preferences.timeRange === 'custom') {
      start = new Date(preferences.customRange.start);
      end = new Date(preferences.customRange.end);
    } else {
      const today = new Date();
      switch (preferences.timeRange) {
        case 'week':
          start = subDays(today, 7);
          end = today;
          break;
        case 'month':
          start = startOfMonth(today);
          end = endOfMonth(today);
          break;
        case 'year':
          start = new Date(today.getFullYear(), 0, 1);
          end = new Date(today.getFullYear(), 11, 31);
          break;
        default:
          start = startOfMonth(today);
          end = endOfMonth(today);
      }
    }
    
    const filtered = jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      return jobDate >= start && jobDate <= end;
    });
    
    setFilteredJobs(filtered);
  }, [jobs, preferences]);
  
  const stats = calculateJobStats(filteredJobs);
  
  // Calculate status distribution
  const statusData = {
    labels: ['Scheduled', 'Delayed', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [
        filteredJobs.filter(j => j.delivery_status === 'Scheduled').length,
        filteredJobs.filter(j => j.delivery_status === 'Delayed').length,
        filteredJobs.filter(j => j.delivery_status === 'Delivered').length,
        filteredJobs.filter(j => j.delivery_status === 'Cancelled').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.7)', // blue - Scheduled
        'rgba(239, 68, 68, 0.7)',  // red - Delayed
        'rgba(16, 185, 129, 0.7)', // green - Delivered
        'rgba(107, 114, 128, 0.7)' // gray - Cancelled
      ]
    }]
  };
  
  // Calculate seasonal trends data
  const seasonalData = {
    labels: stats.seasonalTrends.map(trend => trend.month),
    datasets: [{
      label: 'Jobs',
      data: stats.seasonalTrends.map(trend => trend.jobCount),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      yAxisID: 'y'
    }, {
      label: 'Revenue',
      data: stats.seasonalTrends.map(trend => trend.revenue),
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      yAxisID: 'y1'
    }]
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4 items-center">
            <select
              value={preferences.timeRange}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                timeRange: e.target.value
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            
            {preferences.timeRange === 'custom' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={preferences.customRange.start}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    customRange: {
                      ...prev.customRange,
                      start: e.target.value
                    }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <span>to</span>
                <input
                  type="date"
                  value={preferences.customRange.end}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    customRange: {
                      ...prev.customRange,
                      end: e.target.value
                    }
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
          </div>
          
          <div className="text-sm text-gray-600">
            Current Time: {stats.timeOfDay} • {stats.currentSeason} • {stats.isBusinessHours ? 'Business Hours' : 'After Hours'}
          </div>
        </div>
      </div>
      
      <StatCards stats={stats} />
      
      {/* Time-based metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Jobs This Week</h3>
          <p className="text-2xl font-semibold text-blue-700">{stats.jobsThisWeek}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Jobs This Month</h3>
          <p className="text-2xl font-semibold text-green-700">{stats.jobsThisMonth}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Overdue Deliveries</h3>
          <p className="text-2xl font-semibold text-red-700">{stats.overdueDeliveries}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Job Value</h3>
          <p className="text-2xl font-semibold text-purple-700">${stats.avgAgreedPrice.toFixed(0)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Status Distribution</h3>
          <div className="h-64">
            <Doughnut 
              data={statusData}
              options={{
                plugins: {
                  legend: {
                    position: 'right'
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Seasonal Trends (6 Months)</h3>
          <div className="h-64">
            <Line 
              data={seasonalData}
              options={{
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `${value} jobs`
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: (value) => `$${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;