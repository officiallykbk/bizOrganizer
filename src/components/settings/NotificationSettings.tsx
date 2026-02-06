import React, { useEffect } from 'react';
import { Bell, Volume2, Layout } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

const NotificationSettings: React.FC = () => {
  const { preferences, permissionGranted, updatePreferences, checkPermission, requestPermission } = useNotificationStore();

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const handlePermissionRequest = async () => {
    await requestPermission();
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Notification Preferences
        </h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Enable Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.enabled}
                onChange={(e) => updatePreferences({ enabled: e.target.checked })}
                className="sr-only peer"
                disabled={!permissionGranted}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {!permissionGranted && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-md">
              <p className="text-sm">
                Notification permissions are required. 
                <button
                  onClick={handlePermissionRequest}
                  className="ml-2 underline hover:text-amber-900"
                >
                  Enable Notifications
                </button>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">7-Day Advance Notice</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sevenDayNotice}
                  onChange={(e) => updatePreferences({ sevenDayNotice: e.target.checked })}
                  className="sr-only peer"
                  disabled={!preferences.enabled}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">24-Hour Advance Notice</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.twentyFourHourNotice}
                  onChange={(e) => updatePreferences({ twentyFourHourNotice: e.target.checked })}
                  className="sr-only peer"
                  disabled={!preferences.enabled}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Notification Sound</span>
              </div>
              <select
                value={preferences.sound}
                onChange={(e) => updatePreferences({ sound: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!preferences.enabled}
              >
                <option value="default">Default</option>
                <option value="bell">Bell</option>
                <option value="chime">Chime</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Layout className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Display Style</span>
              </div>
              <select
                value={preferences.style}
                onChange={(e) => updatePreferences({ style: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!preferences.enabled}
              >
                <option value="banner">Banner</option>
                <option value="alert">Alert</option>
                <option value="badge">Badge</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;