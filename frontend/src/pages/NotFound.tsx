import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { HomeIcon } from 'lucide-react';
import Navigation from '@/components/ui/navigation';
import Footer from '@/components/ui/footer';
import { useAuthCheck } from '@/hooks/useAuthCheck';
import { Navbar } from '@/components/ui/navbar';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthCheck();

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Navigation */}
      {isAuthenticated? <Navbar /> : <Navigation />}
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-xl mx-auto text-center">
          {/* Error Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page not found
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we can't find the page you're looking for. The page might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/home')}
              className="bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full h-12 px-8 text-base font-medium flex items-center justify-center gap-2"
            >
              <HomeIcon className="w-5 h-5" />
              Return Home
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/5 rounded-full h-12 px-8 text-base font-medium"
            >
              Go Back
            </Button>
          </div>

          {/* Help Text */}
          <p className="mt-8 text-sm text-gray-600">
            If you think this is a mistake, please{' '}
            <a href="#" className="text-[#0a66c2] hover:underline font-medium">
              contact support
            </a>.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />    
    </div>
  );
}