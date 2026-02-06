import React from 'react';
import Layout from '../components/layout/Layout';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../context/ToastContext';
import ExportButton from '../components/data/ExportButton';
import NotificationSettings from '../components/settings/NotificationSettings';

const Settings: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { addToast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Successfully signed out', 'success');
    } catch (error) {
      addToast('Failed to sign out', 'error');
    }
  };
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
                <p className="text-gray-900">Administrator</p>
              </div>
            </div>
          </div>
        </div>
        
        <NotificationSettings />
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-3">
                  Export all your data as a CSV file for backup or analysis.
                </p>
                <ExportButton variant="secondary" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Authentication</h2>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;