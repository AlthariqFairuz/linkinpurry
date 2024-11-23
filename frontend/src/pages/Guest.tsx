import { Link } from 'react-router-dom';

export default function Guest() {
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center">
    <div className="w-full h-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to Our Platform
          </h1>
          <div className="space-x-4">
            <Link
              to="/login"
              className="inline-block px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-block px-6 py-3 text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}