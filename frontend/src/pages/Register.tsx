import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Register() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/register', { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          name, 
          email, 
          password,
          confirmPassword
        }),
        credentials: 'include',
      });
      
      const data = await response.json();
    
      if (response.ok && data.success) { 
        // redirect to login page with a success message
        navigate('/login', { 
          state: { 
            message: data.message 
          }
        });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-[#0a66c2] fill-current">
            <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
          </svg>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900">
                Join LinkedIn
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Make the most of your professional life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    required
                    className="w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    required
                    className="w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    required
                    className="w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    required
                    className="w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    className="w-full"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0a66c2] hover:bg-[#004182] text-white rounded-full h-12 text-base font-medium"
                >
                  Agree & Join
                </Button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      or
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-base">
                    Already on LinkedIn?{' '}
                    <a href="/login" className="text-[#0a66c2] hover:underline font-medium">
                      Sign in
                    </a>
                  </p>
                </div>

                <div className="mt-6 text-center text-xs text-gray-600">
                  <p>
                    By clicking Agree & Join, you agree to LinkedIn's{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">User Agreement</a>,{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">Privacy Policy</a>, and{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">Cookie Policy</a>.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <footer className="mt-8 text-center">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-gray-600">
              <a href="#" className="hover:text-[#0a66c2] hover:underline">About</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Accessibility</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">User Agreement</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Privacy Policy</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Cookie Policy</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Copyright Policy</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Brand Policy</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Guest Controls</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Community Guidelines</a>
              <a href="#" className="hover:text-[#0a66c2] hover:underline">Language</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}