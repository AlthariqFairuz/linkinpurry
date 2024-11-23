import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const { user, token, logout } = useAuth();  // Add token to destructuring

  // Debug useEffect
  useEffect(() => {
    if (token) {
      try {
        // Decode and log the token parts
        const [header, payload, signature] = token.split('.');
        
        console.log('Token parts:', {
          header: JSON.parse(atob(header)),
          payload: JSON.parse(atob(payload)),
          signature: signature
        });

        // Log decoded user info
        const decodedUser = JSON.parse(atob(payload));
        console.log('Decoded user:', decodedUser);
        
        // Log expiration info
        const expirationDate = new Date(decodedUser.exp * 1000);
        console.log('Token expires:', expirationDate.toLocaleString());
        
        // Check if token is expired
        const isExpired = Date.now() >= decodedUser.exp * 1000;
        console.log('Token is expired:', isExpired);

      } catch (error) {
        console.error('Error decoding token:', error);
      }
    } else {
      console.log('No token found');
    }

    // Log current user state
    console.log('Current user state:', user);
  }, [token, user]);

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Welcome, {user?.username}
                {/* Add debug info in development */}
                {process.env.NODE_ENV === 'development' && (
                  <span className="ml-2 text-xs text-gray-500">
                    (ID: {user?.id})
                  </span>
                )}
              </h1>
            </div>
            <div className="flex items-center">
              {/* Add debug button in development */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => {
                    console.log('Current auth state:', {
                      user,
                      token,
                      decodedToken: token ? JSON.parse(atob(token.split('.')[1])) : null
                    });
                  }}
                  className="mr-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Debug Auth
                </button>
              )}
              <button
                onClick={logout}
                className="ml-4 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
          <p className="text-gray-600">Welcome to your dashboard. More features coming soon!</p>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h3>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify({ user, tokenExists: !!token }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}