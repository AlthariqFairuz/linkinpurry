import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthCheck } from '../hooks/useAuthCheck';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import NotFound from '@/pages/NotFound';
import Profile from '../pages/Profile';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <Navigate to="/home" /> : children;
}

function PublicRoute({ children }) {
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Guest Routes */}
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />

        {/* Register Route */}
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />

        {/* Profile Route */}
        <Route path="/profile/:id" element={
          <PublicRoute>
            <Profile />
          </PublicRoute>
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
            <Login />
          </GuestRoute>
        } />

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}