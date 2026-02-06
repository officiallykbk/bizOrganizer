import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../context/ToastContext';
import { Truck } from 'lucide-react';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, user, error, loading, clearError } = useAuthStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // Clear any existing errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!email || !password) {
      addToast('Please enter both email and password', 'warning');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await signIn(email, password);
      addToast('Successfully signed in', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      addToast(err.message || 'Invalid login credentials', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state while checking session
  if (loading && !isSubmitting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-full">
            <Truck size={36} className="text-blue-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
          Cargo Tracker
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign in to access your dashboard
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2 px-4 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Professional Cargo Management System</p>
          <p className="mt-1">Secure access for authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;