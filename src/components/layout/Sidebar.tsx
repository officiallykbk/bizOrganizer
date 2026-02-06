import React, { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, BarChart3, Package, Settings, MessageSquare, FileText, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Jobs', href: '/jobs', icon: Package },
    { name: 'Statistics', href: '/statistics', icon: FileText },
    { name: 'AI Guide', href: '/ai-guide', icon: MessageSquare },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  return (
    <div
      ref={sidebarRef}
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <Link to="/dashboard" className="flex items-center space-x-3 text-white">
            <Truck size={28} />
            <span className="text-xl font-semibold">Cargo Tracker</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon 
                  className={`mr-3 flex-shrink-0 h-5 w-5 ${
                    isActive(item.href) ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;