import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthCheck } from '../hooks/useAuthCheck';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import NotFound from '@/pages/NotFound';
import Profile from '../pages/Profile';
import DetailProfile from '../pages/DetailProfile';
import Network from '@/pages/Network';
import Loading from '@/components/ui/loading';
import ChatInterface from '@/pages/Chat';

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthCheck();
  
  if (isLoading) {
    return <Loading isLoading={isLoading} />;
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
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path='/profile/:id' element={
          <PublicRoute>
            <DetailProfile />
          </PublicRoute>
        }/>

        {/* Protected Routes */}
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/network" element={
          <PrivateRoute>
            <Network />
          </PrivateRoute>
        } />

        {/* Root Route */}
        <Route path="/" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />

        {/* Chat Route */}
        <Route path="/chat" element={
          <PrivateRoute>
            <ChatInterface />
          </PrivateRoute>
        } />

        <Route path="/chat/:userId" element={
          <PrivateRoute>
            <ChatInterface />
          </PrivateRoute>
        } />

        {/* Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}