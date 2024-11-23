import { useAuth } from '../contexts/AuthContext';
import { useEffect, useMemo } from 'react';

export default function Home() {
  const { token, logout } = useAuth();

  // Get user info from token when needed
  const userInfo = useMemo(() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        username: payload.username,
        email: payload.email
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      window.location.href = '/login';
    }
  }, [token]);

  const handleLogout = () => {
    logout();
  };

  if (!userInfo) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gray-100">
      <nav className="bg-white shadow w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, {userInfo.username}
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600">Welcome to your dashboard. More features coming soon!</p>
        </div>
      </main>
    </div>
  );
}