import React, { useState, useMemo } from 'react';
import { useJobStore } from '../../store/jobStore';
import { Line, Bar } from 'react-chartjs-2';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useFinancialMetrics, useChartData } from './MetricsCalculator';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subQuarters,
  subYears
} from 'date-fns';

const FinancialMetrics: React.FC = () => {
  const { jobs } = useJobStore();
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [period, setPeriod] = useState<'current' | 'previous'>('current');
  
  const dateRanges = {
    month: {
      current: {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
      },
      previous: {
        start: startOfMonth(subMonths(new Date(), 1)),
        end: endOfMonth(subMonths(new Date(), 1))
      }
    },
    quarter: {
      current: {
        start: startOfQuarter(new Date()),
        end: endOfQuarter(new Date())
      },
      previous: {
        start: startOfQuarter(subQuarters(new Date(), 1)),
        end: endOfQuarter(subQuarters(new Date(), 1))
      }
    },
    year: {
      current: {
        start: startOfYear(new Date()),
        end: endOfYear(new Date())
      },
      previous: {
        start: startOfYear(subYears(new Date(), 1)),
        end: endOfYear(subYears(new Date(), 1))
      }
    }
  };
  
  const filteredJobs = useMemo(() => {
    const range = dateRanges[dateRange][period];
    return jobs.filter(job => {
      const jobDate = new Date(job.created_at);
      return jobDate >= range.start && jobDate <= range.end;
    });
  }, [jobs, dateRange, period]);
  
  const metrics = useFinancialMetrics(filteredJobs);
  const { revenueData, paymentData } = useChartData(filteredJobs);
  
  const revenueOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Revenue Trend'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value.toLocaleString()}`
        }
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="current">Current</option>
              <option value="previous">Previous</option>
            </select>
          </div>
          
          <button
            onClick={() => {
              // Export financial data
              const data = {
                period: `${period} ${dateRange}`,
                revenue: metrics.totalRevenue,
                costs: metrics.totalCost,
                profit: metrics.grossProfit,
                margin: metrics.grossMargin,
                pending: metrics.pendingRevenue,
                jobs: metrics.total
              };
              
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `financial-metrics-${format(new Date(), 'yyyy-MM-dd')}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download size={16} />
            Export Metrics
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Gross Revenue</h3>
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            ${metrics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {filteredJobs.length} total jobs
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Gross Profit</h3>
            {metrics.grossMargin >= 0 ? (
              <TrendingUp className="text-green-500" size={20} />
            ) : (
              <TrendingDown className="text-red-500" size={20} />
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            ${metrics.grossProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {metrics.grossMargin.toFixed(1)}% margin
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Avg. Revenue/Job</h3>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            ${metrics.avgRevenuePerJob.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Per completed job
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Collection Rate</h3>
            {metrics.collectionRate >= 90 ? (
              <TrendingUp className="text-green-500" size={20} />
            ) : (
              <TrendingDown className="text-amber-500" size={20} />
            )}
          </div>
          <p className="text-2xl font-semibold text-gray-900 mt-2">
            {metrics.collectionRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            ${metrics.pendingRevenue.toLocaleString()} pending
          </p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <Line data={revenueData} options={revenueOptions as any} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Status</h3>
          <div className="h-80">
            <Bar
              data={paymentData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value: number) => `$${value.toLocaleString()}`
                    }
                  }
                }
              } as any}
            />
          </div>
        </div>
      </div>
      
      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Detailed Financial Metrics
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                        Metric
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Value
                      </th>
                      <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        Total Revenue
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-gray-900">
                        ${metrics.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-green-600">
                        +{((metrics.totalRevenue / (metrics.totalRevenue || 1)) * 100 - 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        Operating Costs
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-gray-900">
                        ${metrics.totalCost.toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-red-600">
                        +{((metrics.totalCost / (metrics.totalRevenue || 1)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        Gross Profit
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-gray-900">
                        ${metrics.grossProfit.toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-green-600">
                        {metrics.grossMargin.toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        Pending Payments
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-gray-900">
                        ${metrics.pendingRevenue.toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-amber-600">
                        {((metrics.pendingRevenue / (metrics.totalRevenue || 1)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        Average Job Value
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-gray-900">
                        ${metrics.avgRevenuePerJob.toLocaleString()}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-blue-600">
                        {filteredJobs.length} jobs
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialMetrics;