import React from 'react';
import { PackageCheck, Truck as TruckIcon, Ban, Clock, DollarSign, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { JobStats } from '../../types/job';
import { formatCurrency } from '../../lib/utils';

interface StatCardsProps {
  stats: JobStats;
}

const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Jobs',
      value: stats.total.toString(),
      icon: <TruckIcon className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Jobs Today',
      value: stats.jobsToday.toString(),
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Delivered',
      value: stats.delivered.toString(),
      icon: <PackageCheck className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Upcoming Deliveries',
      value: stats.upcomingDeliveries.toString(),
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Revenue This Month',
      value: formatCurrency(stats.revenueThisMonth),
      icon: <DollarSign className="h-8 w-8 text-emerald-500" />,
      color: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
    {
      title: 'On-Time Delivery',
      value: `${stats.onTimeDeliveryRate.toFixed(1)}%`,
      icon: <TrendingUp className="h-8 w-8 text-indigo-500" />,
      color: 'bg-indigo-50',
      textColor: 'text-indigo-700'
    },
    {
      title: 'Overdue Deliveries',
      value: stats.overdueDeliveries.toString(),
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      color: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Collection Rate',
      value: `${((stats.totalRevenue - stats.pendingRevenue) / (stats.totalRevenue || 1) * 100).toFixed(1)}%`,
      icon: <DollarSign className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow p-6 flex items-center"
        >
          <div className={`p-3 rounded-full ${card.color} mr-4`}>
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className={`text-2xl font-semibold ${card.textColor}`}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCards;