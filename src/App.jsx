import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StudyGroups from './pages/StudyGroups';
import GroupDetails from './pages/GroupDetails';
import CreateGroup from './pages/CreateGroup';
import StudySession from './pages/StudySession';
import SubmitActivity from './pages/SubmitActivity';
import VerificationResults from './pages/VerificationResults';
import Rewards from './pages/Rewards';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SplashScreen from './components/SplashScreen';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider } from './context/Web3Context';
import { ToastProvider } from './context/ToastContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-emerald-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();

  // Only show splash on initial load of the root path
  useEffect(() => {
    if (location.pathname !== '/') {
      setShowSplash(false);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      {/* Public Routes (No Layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Landing Page is public */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="groups" element={<StudyGroups />} />
        <Route path="groups/:id" element={<GroupDetails />} />
        <Route path="create-group" element={<CreateGroup />} />
        <Route path="session/:groupAddress" element={<StudySession />} />
        <Route path="submit" element={<SubmitActivity />} />
        <Route path="verification" element={<VerificationResults />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<div className="p-20 text-center">Page not found</div>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;
