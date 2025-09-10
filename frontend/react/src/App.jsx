import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Subject from './Pages/Subject';
import { useContext } from 'react';
import { UserContext } from './Context/userContext';
import UserProvider from './Context/userContext';

// Loading component for better UX
const LoadingSpinner = () => (
  <div className="w-full h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#730FFF]"></div>
      <p className="text-gray-600">Authenticating...</p>
    </div>
  </div>
);

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/subject" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  )
}

const Root = () => {
  const { user, loading } = useContext(UserContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
}

// Protected route component - requires authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public route component - redirects authenticated users
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default App