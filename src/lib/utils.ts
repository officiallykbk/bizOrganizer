import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, parse } from "date-fns";
import { CargoJob, JobStats } from "../types/job";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    if (dateStr.includes('T')) {
      return format(parseISO(dateStr), 'dd/MM/yyyy');
    }
    return format(parse(dateStr, 'dd/MM/yyyy', new Date()), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Invalid date format', error);
    return 'Invalid Date';
  }
}

export function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    if (dateStr.includes('T')) {
      return format(parseISO(dateStr), 'yyyy-MM-dd');
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      return format(parsedDate, 'yyyy-MM-dd');
    }
    return dateStr;
  } catch (error) {
    console.error('Invalid date format', error);
    return '';
  }
}

export function parseFormDate(dateStr: string): string {
  try {
    if (!dateStr || dateStr.trim() === '') {
      throw new Error('Date string is empty');
    }

    // If it's already in ISO format (YYYY-MM-DD), return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid ISO date');
      }
      return dateStr;
    }

    // If it contains T (full ISO timestamp), extract date part
    if (dateStr.includes('T')) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid ISO date');
      }
      return format(date, 'yyyy-MM-dd');
    }

    // If in DD/MM/YYYY format, convert to YYYY-MM-DD for PostgreSQL
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
      return format(parsedDate, 'yyyy-MM-dd');
    }

    throw new Error('Date must be in YYYY-MM-DD or DD/MM/YYYY format');
  } catch (error) {
    console.error('Invalid date format', error);
    throw new Error(`Invalid date format: ${dateStr}`);
  }
}

export function formatDateForDB(dateStr: string): string {
  return parseFormDate(dateStr);
}

export function getStatusColor(status: string): string {
  const statusColors = {
    // Delivery statuses
    'Scheduled': 'bg-blue-100 text-blue-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-gray-100 text-gray-800',
    'Delayed': 'bg-red-100 text-red-800',
    // Payment statuses
    'Pending': 'bg-amber-100 text-amber-800',
    'Paid': 'bg-green-100 text-green-800',
    'Refunded': 'bg-purple-100 text-purple-800'
  };
  
  return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';
}

export function calculateJobStats(jobs: CargoJob[]): JobStats {
  const currentDate = new Date();
  const seasonalInfo = getSeasonalInfo(currentDate);
  
  const total = jobs.length;
  const delivered = jobs.filter(job => job.delivery_status === 'Delivered').length;
  const active = jobs.filter(job => job.delivery_status === 'Scheduled').length;
  const cancelled = jobs.filter(job => job.delivery_status === 'Cancelled').length;
  const delayed = jobs.filter(job => job.delivery_status === 'Delayed').length;
  
  const totalRevenue = jobs.reduce((sum, job) => sum + job.agreed_price, 0);
  const pendingRevenue = jobs
    .filter(job => job.payment_status === 'Pending')
    .reduce((sum, job) => sum + job.agreed_price, 0);
  
  // Calculate enhanced metrics
  const paidJobsCount = jobs.filter(job => job.payment_status === 'Paid').length;
  const pendingJobsCount = jobs.filter(job => job.payment_status === 'Pending').length;
  const refundedJobsCount = jobs.filter(job => job.payment_status === 'Refunded').length;
  const avgAgreedPrice = total > 0 ? totalRevenue / total : 0;
  
  // Calculate on-time delivery rate
  const deliveredJobsWithEstimates = jobs.filter(job => 
    job.delivery_status === 'Delivered' && 
    job.actual_delivery_date && 
    job.estimated_delivery_date
  );
  
  let onTimeDeliveries = 0;
  if (deliveredJobsWithEstimates.length > 0) {
    onTimeDeliveries = deliveredJobsWithEstimates.filter(job => {
      try {
        const actualDate = parse(job.actual_delivery_date!, 'dd/MM/yyyy', new Date());
        const estimatedDate = parse(job.estimated_delivery_date, 'dd/MM/yyyy', new Date());
        return actualDate <= estimatedDate;
      } catch (e) {
        return false;
      }
    }).length;
  }
  
  const onTimeDeliveryRate = deliveredJobsWithEstimates.length > 0 
    ? (onTimeDeliveries / deliveredJobsWithEstimates.length) * 100 
    : 0;
  
  // Calculate average delivery time for completed jobs
  const completedJobs = jobs.filter(job => job.delivery_status === 'Delivered' && job.actual_delivery_date);
  let avgDeliveryTime = 0;
  
  if (completedJobs.length > 0) {
    const totalDays = completedJobs.reduce((sum, job) => {
      const pickupDate = parse(job.pickup_date, 'dd/MM/yyyy', new Date());
      const deliveryDate = parse(job.actual_delivery_date!, 'dd/MM/yyyy', new Date());
      const days = Math.floor((deliveryDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    avgDeliveryTime = Math.round(totalDays / completedJobs.length);
  }
  
  // Calculate time-based metrics
  const timeMetrics = calculateTimeBasedMetrics(jobs, currentDate);
  
  return {
    total,
    active,
    delivered,
    cancelled,
    delayed,
    totalRevenue,
    pendingRevenue,
    avgDeliveryTime,
    paidJobsCount,
    pendingJobsCount,
    refundedJobsCount,
    avgAgreedPrice,
    onTimeDeliveryRate,
    currentTime: currentDate.toISOString(),
    currentSeason: seasonalInfo.season,
    currentQuarter: seasonalInfo.quarter,
    currentMonth: seasonalInfo.monthName,
    currentDayOfWeek: seasonalInfo.dayOfWeek,
    isBusinessHours: seasonalInfo.isBusinessHours,
    timeOfDay: seasonalInfo.timeOfDay,
    jobsToday: timeMetrics.jobsToday,
    jobsThisWeek: timeMetrics.jobsThisWeek,
    jobsThisMonth: timeMetrics.jobsThisMonth,
    revenueThisMonth: timeMetrics.revenueThisMonth,
    upcomingDeliveries: timeMetrics.upcomingDeliveries,
    overdueDeliveries: timeMetrics.overdueDeliveries,
    seasonalTrends: timeMetrics.seasonalTrends
  };
}

export function storeLocalData(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing data locally:', error);
  }
}

export function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error retrieving local data:', error);
    return defaultValue;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper function to get seasonal information
function getSeasonalInfo(date: Date) {
  const month = date.getMonth() + 1;
  const hours = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  let season = '';
  if (month >= 3 && month <= 5) season = 'Spring';
  else if (month >= 6 && month <= 8) season = 'Summer';
  else if (month >= 9 && month <= 11) season = 'Fall';
  else season = 'Winter';
  
  let timeOfDay = '';
  if (hours >= 5 && hours < 12) timeOfDay = 'Morning';
  else if (hours >= 12 && hours < 17) timeOfDay = 'Afternoon';
  else if (hours >= 17 && hours < 21) timeOfDay = 'Evening';
  else timeOfDay = 'Night';
  
  const isBusinessHours = (day >= 1 && day <= 5) && (hours >= 9 && hours < 17); // Mon-Fri, 9AM-5PM
  
  const quarter = `Q${Math.floor((month - 1) / 3) + 1}`;
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return {
    season,
    timeOfDay,
    isBusinessHours,
    quarter,
    monthName: months[date.getMonth()],
    dayOfWeek: daysOfWeek[day]
  };
}

// Helper function to calculate time-based metrics
function calculateTimeBasedMetrics(jobs: CargoJob[], currentDate: Date) {
  const oneDayAgo = new Date(currentDate);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const oneWeekAgo = new Date(currentDate);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const oneMonthAgo = new Date(currentDate);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // Jobs today
  const jobsToday = jobs.filter(job => {
    try {
      const jobDate = new Date(job.created_at);
      return jobDate.toDateString() === currentDate.toDateString();
    } catch {
      return false;
    }
  }).length;
  
  // Jobs this week
  const jobsThisWeek = jobs.filter(job => {
    try {
      const jobDate = new Date(job.created_at);
      return jobDate >= oneWeekAgo && jobDate <= currentDate;
    } catch {
      return false;
    }
  }).length;
  
  // Jobs this month
  const jobsThisMonth = jobs.filter(job => {
    try {
      const jobDate = new Date(job.created_at);
      return jobDate.getMonth() === currentDate.getMonth() && 
             jobDate.getFullYear() === currentDate.getFullYear();
    } catch {
      return false;
    }
  }).length;
  
  // Revenue this month
  const revenueThisMonth = jobs.filter(job => {
    try {
      const jobDate = new Date(job.created_at);
      return jobDate.getMonth() === currentDate.getMonth() && 
             jobDate.getFullYear() === currentDate.getFullYear();
    } catch {
      return false;
    }
  }).reduce((sum, job) => sum + job.agreed_price, 0);
  
  // Upcoming deliveries (scheduled for today or future)
  const upcomingDeliveries = jobs.filter(job => {
    try {
      if (job.delivery_status !== 'Scheduled') return false;
      const deliveryDate = parse(job.estimated_delivery_date, 'dd/MM/yyyy', new Date());
      return deliveryDate >= currentDate;
    } catch {
      return false;
    }
  }).length;
  
  // Overdue deliveries (estimated delivery date passed but still scheduled)
  const overdueDeliveries = jobs.filter(job => {
    try {
      if (job.delivery_status !== 'Scheduled') return false;
      const deliveryDate = parse(job.estimated_delivery_date, 'dd/MM/yyyy', new Date());
      return deliveryDate < currentDate;
    } catch {
      return false;
    }
  }).length;
  
  // Seasonal trends (last 6 months)
  const seasonalTrends = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(currentDate);
    monthDate.setMonth(monthDate.getMonth() - i);
    
    const monthJobs = jobs.filter(job => {
      try {
        const jobDate = new Date(job.created_at);
        return jobDate.getMonth() === monthDate.getMonth() && 
               jobDate.getFullYear() === monthDate.getFullYear();
      } catch {
        return false;
      }
    });
    
    seasonalTrends.push({
      month: monthDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
      jobCount: monthJobs.length,
      revenue: monthJobs.reduce((sum, job) => sum + job.agreed_price, 0)
    });
  }
  
  return {
    jobsToday,
    jobsThisWeek,
    jobsThisMonth,
    revenueThisMonth,
    upcomingDeliveries,
    overdueDeliveries,
    seasonalTrends
  };
}