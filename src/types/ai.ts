export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  response: string;
  context?: {
    totalJobs: number;
    totalRevenue: number;
    currentTime: string;
    timeOfDay: string;
    isBusinessHours: boolean;
    jobsToday: number;
    upcomingDeliveries: number;
    timestamp: string;
  };
}

export interface AIError {
  error: string;
  message?: string;
}