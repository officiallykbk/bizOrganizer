export type PaymentStatus = 'Pending' | 'Paid' | 'Refunded';
export type DeliveryStatus = 'Scheduled' | 'Delivered' | 'Cancelled' | 'Delayed';

export interface IntermediateStop {
  location: string;
  estimated_arrival: string;
  notes?: string;
}

export interface CargoJob {
  id: string;
  shipper_name: string;
  payment_status: PaymentStatus;
  delivery_status: DeliveryStatus;
  pickup_location: string;
  dropoff_location: string;
  intermediate_stops: IntermediateStop[];
  pickup_date: string;
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  agreed_price: number;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface EditHistoryItem {
  id: string;
  job_id: string;
  field: string;
  old_value: any;
  new_value: any;
  changed_at: string;
  changed_by: string;
}

export interface JobStats {
  total: number;
  active: number;
  delivered: number;
  cancelled: number;
  delayed: number;
  totalRevenue: number;
  pendingRevenue: number;
  avgDeliveryTime: number;
  paidJobsCount: number;
  pendingJobsCount: number;
  refundedJobsCount: number;
  avgAgreedPrice: number;
  onTimeDeliveryRate: number;
  
  // Time-based metrics
  currentTime: string;
  currentSeason: string;
  currentQuarter: string;
  currentMonth: string;
  currentDayOfWeek: string;
  isBusinessHours: boolean;
  timeOfDay: string;
  jobsToday: number;
  jobsThisWeek: number;
  jobsThisMonth: number;
  revenueThisMonth: number;
  upcomingDeliveries: number;
  overdueDeliveries: number;
  seasonalTrends: {
    month: string;
    jobCount: number;
    revenue: number;
  }[];
}