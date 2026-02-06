import React from 'react';
import { useJobStore } from '../../store/jobStore';
import { calculateJobStats } from '../../lib/utils';

interface AIBusinessContextProps {
  children: React.ReactNode;
}

export const useBusinessContext = () => {
  const { jobs } = useJobStore();
  const stats = calculateJobStats(jobs);
  
  return {
    jobs,
    stats,
    businessData: {
      totalJobs: stats.total,
      activeJobs: stats.active,
      deliveredJobs: stats.delivered,
      cancelledJobs: stats.cancelled,
      delayedJobs: stats.delayed,
      totalRevenue: stats.totalRevenue,
      pendingRevenue: stats.pendingRevenue,
      avgDeliveryTime: stats.avgDeliveryTime,
      collectionRate: ((stats.totalRevenue - stats.pendingRevenue) / stats.totalRevenue) * 100 || 0
    }
  };
};

const AIBusinessContext: React.FC<AIBusinessContextProps> = ({ children }) => {
  return <>{children}</>;
};

export default AIBusinessContext;