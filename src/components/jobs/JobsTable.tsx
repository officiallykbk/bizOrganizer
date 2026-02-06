import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard as Edit, ChevronDown, ChevronUp, Clock, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { CargoJob } from '../../types/job';
import { useJobStore } from '../../store/jobStore';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import { DELIVERY_STATUSES } from '../../lib/constants';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import EditHistoryModal from './EditHistoryModal';
import ReceiptViewerModal from '../ui/ReceiptViewerModal';

const JobsTable: React.FC = () => {
  const { jobs, isLoading, selectJob, fetchJobs } = useJobStore();
  // jobs may be `null` while loading or if the store hasn't initialized —
  // normalize to an empty array to avoid runtime `null` errors.
  const safeJobs = jobs ?? [];
  const { addToast } = useToast();
  const [filteredJobs, setFilteredJobs] = useState<CargoJob[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof CargoJob>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [historyJobId, setHistoryJobId] = useState<string | null>(null);
  const [receiptViewerUrl, setReceiptViewerUrl] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);
  
  useEffect(() => {
    let result = [...safeJobs];
    
    if (statusFilter) {
      result = result.filter(job => job.delivery_status === statusFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.shipper_name.toLowerCase().includes(query) || 
        job.id.toLowerCase().includes(query)
      );
    }
    
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue.includes('-') && bValue.includes('-')) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setFilteredJobs(result);
  }, [jobs, statusFilter, searchQuery, sortField, sortDirection]);
  
  const handleSort = (field: keyof CargoJob) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleEdit = (job: CargoJob) => {
    selectJob(job);
    // Scroll to top of page to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const formElement = document.getElementById('job-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleViewHistory = (jobId: string) => {
    setHistoryJobId(jobId);
  };
  
  const closeHistoryModal = () => {
    setHistoryJobId(null);
  };

  const handleViewReceipt = async (receiptPath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('receipts')
        .createSignedUrl(receiptPath, 3600);

      if (error) throw error;
      if (data?.signedUrl) {
        setReceiptViewerUrl(data.signedUrl);
      }
    } catch (error: any) {
      console.error('View receipt error:', error);
      addToast(error.message || 'Failed to load receipt', 'error');
    }
  };
  
  const SortIcon = ({ field }: { field: keyof CargoJob }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };
  
  if (isLoading && safeJobs.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-10 h-10 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Cargo Jobs</h2>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {DELIVERY_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipper..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <SortIcon field="created_at" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('shipper_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Shipper</span>
                  <SortIcon field="shipper_name" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('agreed_price')}
              >
                <div className="flex items-center space-x-1">
                  <span>Price</span>
                  <SortIcon field="agreed_price" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('pickup_location')}
              >
                <div className="flex items-center space-x-1">
                  <span>Route</span>
                  <SortIcon field="pickup_location" />
                </div>
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('delivery_status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="delivery_status" />
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-sm text-gray-500">
                  No jobs found. {statusFilter || searchQuery ? 'Try changing your filters.' : ''}
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.shipper_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(job.agreed_price)}
                      </span>
                      <span className={`text-xs ${
                        job.payment_status === 'Paid' 
                          ? 'text-green-600' 
                          : job.payment_status === 'Overdue'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}>
                        {job.payment_status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {job.pickup_location} → {job.dropoff_location}
                    {job.intermediate_stops && job.intermediate_stops.length > 0 && (
                      <span className="ml-1 text-xs text-gray-400">
                        (+{job.intermediate_stops.length})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.delivery_status)}`}>
                      {job.delivery_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {job.receipt_url && (
                        <button
                          onClick={() => handleViewReceipt(job.receipt_url!)}
                          className="text-green-600 hover:text-green-900"
                          title="View Receipt"
                        >
                          <ImageIcon size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleViewHistory(job.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="View History"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(job)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="py-3 px-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
          Showing {filteredJobs.length} of {safeJobs.length} jobs
        </div>
      </div>
      
      {historyJobId && (
        <EditHistoryModal jobId={historyJobId} onClose={closeHistoryModal} />
      )}

      {receiptViewerUrl && (
        <ReceiptViewerModal
          imageUrl={receiptViewerUrl}
          onClose={() => setReceiptViewerUrl(null)}
        />
      )}
    </div>
  );
};

export default JobsTable;