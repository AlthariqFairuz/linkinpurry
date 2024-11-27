import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardDescription, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { Navbar } from '@/components/ui/navbar';
import { useToast } from '@/hooks/use-toast';
import ValidationError from '@/types/ValidationError';

export default function Register() {
  const [username, setUsername] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          fullName,
          email,
          password,
          confirmPassword
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      
      if (data.success) {

        toast({
          title: "Success",
          description: data.message || "Registration successful! Please login.",
          variant: "success",
        });
        
        // Clear form
        setUsername('');
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirect to login page
        navigate('/login');

      } else {
        // Handle errors - check if it's validation errors or general error
        if (data.body && Array.isArray(data.body) && data.body.length > 0) {
          // Convert validation errors array to object
          const newErrors = data.body.reduce((acc: { [key: string]: string }, error: ValidationError) => {
            acc[error.field] = error.message;
            return acc;
          }, {});
          
          setErrors(newErrors);
          
          toast({
            title: "Validation Error",
            description: data.body[0].message,
            variant: "destructive",
          });
        } 
        else {
          // Handle general error message
          console.error(errors);
          const errorMessage = data.message || 'Registration failed';
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          setErrors({ general: errorMessage });
        }
      }
    } catch (err) {
      console.error('Registration error:', err);
      toast({
        title: "Error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      setErrors({ 
        general: 'An error occurred during registration. Please try again.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-16">
      {/* Navigation */}
      <Navbar />  

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-md mx-auto">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl md:text-3xl font-semibold text-gray-900">
                Join LinkedInPurry
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Make the most of your professional life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    className="w-full"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    Already on LinkedInPurry?{' '}
                    <a href="/login" className="text-[#0a66c2] hover:underline font-medium">
                      Sign in
                    </a>
                  </p>
                </div>

                <div className="mt-6 text-center text-xs text-gray-600">
                  <p>
                    By clicking Agree & Join, you agree to LinkedInPurry's{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">User Agreement</a>,{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">Privacy Policy</a>, and{' '}
                    <a href="#" className="text-[#0a66c2] hover:underline">Cookie Policy</a>.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <Footer />    
        </div>
      </div>
    </div>
  );
}