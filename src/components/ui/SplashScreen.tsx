import React from 'react';
import { Truck } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 mx-auto shadow-2xl">
            <Truck className="w-14 h-14 text-blue-600" />
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-1 bg-white/20 rounded-full">
                <div className="w-12 h-full bg-white rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
              </div>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Cargo Tracker</h1>
        <p className="text-blue-100">Professional Logistics Management</p>
      </div>
    </div>
  );
};

export default SplashScreen;