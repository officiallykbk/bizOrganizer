import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationStyle = 'banner' | 'alert' | 'badge';
export type NotificationSound = 'default' | 'bell' | 'chime' | 'none';

interface NotificationPreferences {
  enabled: boolean;
  sevenDayNotice: boolean;
  twentyFourHourNotice: boolean;
  style: NotificationStyle;
  sound: NotificationSound;
}

interface NotificationState {
  preferences: NotificationPreferences;
  permissionGranted: boolean;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  checkPermission: () => Promise<void>;
  requestPermission: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      preferences: {
        enabled: true,
        sevenDayNotice: true,
        twentyFourHourNotice: true,
        style: 'banner',
        sound: 'default'
      },
      permissionGranted: false,

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            ...newPreferences
          }
        }));
      },

      checkPermission: async () => {
        if (!('Notification' in window)) {
          set({ permissionGranted: false });
          return;
        }

        const permission = await Notification.permission;
        set({ permissionGranted: permission === 'granted' });
      },

      requestPermission: async () => {
        if (!('Notification' in window)) {
          return;
        }

        try {
          const permission = await Notification.requestPermission();
          set({ permissionGranted: permission === 'granted' });
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          set({ permissionGranted: false });
        }
      }
    }),
    {
      name: 'cargo-notifications',
      skipHydration: true
    }
  )
);