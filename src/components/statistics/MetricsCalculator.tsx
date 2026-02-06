import { useMemo } from 'react';
import { CargoJob } from '../../types/job';
import { calculateJobStats } from '../../lib/utils';

export const useFinancialMetrics = (jobs: CargoJob[]) => {
  return useMemo(() => {
    const stats = calculateJobStats(jobs);
    
    const totalCost = jobs.reduce((sum, job) => {
      // Estimate cost as 70% of revenue for demo purposes
      const estimatedCost = job.agreed_price * 0.7;
      return sum + estimatedCost;
    }, 0);
    
    const grossProfit = stats.totalRevenue - totalCost;
    const grossMargin = (grossProfit / stats.totalRevenue) * 100;
    const avgRevenuePerJob = stats.totalRevenue / stats.total || 0;
    
    return {
      ...stats,
      totalCost,
      grossProfit,
      grossMargin,
      avgRevenuePerJob,
      collectionRate: ((stats.totalRevenue - stats.pendingRevenue) / stats.totalRevenue) * 100 || 0
    };
  }, [jobs]);
};

export const useChartData = (jobs: CargoJob[]) => {
  return useMemo(() => {
    // Revenue trend data
    const revenueData = {
      labels: jobs.map(job => new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Revenue',
        data: jobs.map(job => job.agreed_price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true
      }]
    };

    // Payment status breakdown
    const paymentData = {
      labels: ['Paid', 'Pending', 'Refunded'],
      datasets: [{
        data: [
          jobs.filter(job => job.payment_status === 'Paid').reduce((sum, job) => sum + job.agreed_price, 0),
          jobs.filter(job => job.payment_status === 'Pending').reduce((sum, job) => sum + job.agreed_price, 0),
          jobs.filter(job => job.payment_status === 'Refunded').reduce((sum, job) => sum + job.agreed_price, 0)
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // green - Paid
          'rgba(245, 158, 11, 0.7)', // amber - Pending
          'rgba(239, 68, 68, 0.7)'   // red - Refunded
        ]
      }]
    };

    return { revenueData, paymentData };
  }, [jobs]);
};