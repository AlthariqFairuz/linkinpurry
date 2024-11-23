import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Guest from '../pages/Guest';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/guest" />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/home" /> : children;
}

export default function AppRoutes() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Guest Routes */}
        <Route path="/guest" element={
          <GuestRoute>
            <Guest />
          </GuestRoute>
        } />
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />

        {/* Protected Routes */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />

        {/* Root Route */}
        <Route path="/" element={
          <GuestRoute>
            <Guest />
          </GuestRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}