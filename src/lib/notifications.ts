import { differenceInDays, differenceInHours, parseISO } from 'date-fns';
import { CargoJob } from '../types/job';
import { useNotificationStore } from '../store/notificationStore';

export const checkUpcomingJobs = (jobs: CargoJob[]) => {
  const { preferences, permissionGranted } = useNotificationStore.getState();
  
  if (!preferences.enabled || !permissionGranted) {
    return;
  }

  jobs.forEach(job => {
    const estimatedDelivery = parseISO(job.estimated_delivery_date);
    const now = new Date();
    const daysUntilDelivery = differenceInDays(estimatedDelivery, now);
    const hoursUntilDelivery = differenceInHours(estimatedDelivery, now);

    if (preferences.sevenDayNotice && daysUntilDelivery === 7) {
      showNotification({
        title: '7-Day Delivery Notice',
        body: `Upcoming delivery for ${job.shipper_name} due in 7 days`,
        job
      });
    }

    if (preferences.twentyFourHourNotice && hoursUntilDelivery === 24) {
      showNotification({
        title: '24-Hour Delivery Notice',
        body: `Urgent: Delivery for ${job.shipper_name} due tomorrow`,
        job
      });
    }
  });
};

interface NotificationOptions {
  title: string;
  body: string;
  job: CargoJob;
}

const showNotification = ({ title, body, job }: NotificationOptions) => {
  const { preferences } = useNotificationStore.getState();

  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return;
  }

  // Play notification sound if enabled
  if (preferences.sound !== 'none') {
    playNotificationSound(preferences.sound);
  }

  // Show notification based on preferred style
  switch (preferences.style) {
    case 'banner':
      new Notification(title, {
        body,
        icon: '/vite.svg',
        tag: `job-${job.id}`,
        requireInteraction: true
      });
      break;

    case 'alert':
      alert(`${title}\n\n${body}`);
      break;

    case 'badge':
      // Update app badge (if supported)
      if ('setAppBadge' in navigator) {
        navigator.setAppBadge(1);
      }
      break;
  }
};

const playNotificationSound = (sound: string) => {
  const audio = new Audio();
  switch (sound) {
    case 'bell':
      audio.src = 'https://assets.mixkit.co/active_storage/sfx/2912/2912-preview.mp3';
      break;
    case 'chime':
      audio.src = 'https://assets.mixkit.co/active_storage/sfx/2913/2913-preview.mp3';
      break;
    default:
      audio.src = 'https://assets.mixkit.co/active_storage/sfx/2911/2911-preview.mp3';
  }
  audio.play().catch(console.error);
};