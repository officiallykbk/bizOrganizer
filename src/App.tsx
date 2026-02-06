import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { useAuthStore } from './store/authStore';
import { setupOfflineSupport } from './lib/supabase';
import SplashScreen from './components/ui/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import SignIn from './components/auth/SignIn';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Statistics from './pages/Statistics';
import AiGuide from './pages/AiGuide';
import Settings from './pages/Settings';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        setupOfflineSupport();

        const rehydrate = useAuthStore.persist?.rehydrate;
        if (rehydrate) {
          await rehydrate();
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('App initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <SplashScreen />
      ) : (
        <BrowserRouter>
          <ToastProvider>
            <ErrorBoundary>
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/ai-guide" element={<AiGuide />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ErrorBoundary>
          </ToastProvider>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;