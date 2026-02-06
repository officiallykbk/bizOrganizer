import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { useJobStore } from '../../store/jobStore';
import { checkUpcomingJobs } from '../../lib/notifications';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, signOut } = useAuthStore();
  const { jobs } = useJobStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Check for notifications every minute
  useEffect(() => {
    checkUpcomingJobs(jobs);
    const interval = setInterval(() => {
      checkUpcomingJobs(jobs);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [jobs]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      addToast('Successfully signed out', 'success');
      navigate('/signin');
    } catch (error) {
      addToast('Failed to sign out', 'error');
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 lg:px-6 z-10">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex justify-start items-center">
          <button
            onClick={onToggleSidebar}
            type="button"
            className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <Menu size={24} className={`transform transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          
          <form onSubmit={handleSearch} className="hidden md:block ml-2">
            <div className="relative">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search jobs..."
              />
            </div>
          </form>
        </div>
        
        <div className="flex items-center">
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <Bell size={20} />
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {jobs.filter(job => 
                      job.delivery_status !== 'Delivered' && 
                      job.delivery_status !== 'Cancelled'
                    ).map(job => (
                      <div key={job.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{job.shipper_name}</p>
                            <p className="text-sm text-gray-600">Due: {job.estimated_delivery_date}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Status: {job.delivery_status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50">
                    <button
                      onClick={() => navigate('/settings')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Manage Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center ml-3">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white">
                    <User size={18} />
                  </div>
                </button>
                
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-3">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {user?.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        Logistics Manager
                      </p>
                    </div>
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;