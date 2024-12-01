import { Users, MessageSquare, Menu, Search, Home, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@radix-ui/react-toast';
import { Card } from './card';
import { ProfilePicture } from './profilephoto';
import debounce from 'lodash/debounce';
import { isLoggedIn } from '@/api/isLoggedIn';
import { SearchResult } from '@/types/SearchResult';

export const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (query.trim().length === 0) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/search?q=${encodeURIComponent(query)}`,
          { 
            credentials: 'include' 
          }
        );

        if (!response.ok) throw new Error('Search failed');

        const data = await response.json();
        setSearchResults(data.body.users || []);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Error",
          description: "Failed to perform search",
          variant: "destructive"
        });
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle clicks outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      setIsAuthenticated(loggedIn);
    };
    checkAuth();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowResults(true);
    setSelectedIndex(-1);
    debouncedSearch(query);
  };

  const handleResultClick = (userId: string) => {
    setShowResults(false);
    setSearchQuery("");
    setSelectedIndex(-1);
    // Show loading state while navigating
    setIsSearching(true);
    navigate(`/profile/${userId}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleResultClick(searchResults[selectedIndex].id);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

    const handleLogout = async () => {
      try {
        await fetch('http://localhost:3000/api/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        navigate('/login', {
          state: {
            message: 'Logout successful!'
          }
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to logout: " + error,
          variant: "destructive",
          action: <ToastAction altText="Try again" onClick={handleLogout}>Try again</ToastAction>
        }); 
      }
    };;

    const handleHome = () => {
      navigate('/home');
    };

    const handleProfile = () => {
      navigate('/profile');
    };

    const handleNetwork = () => {
      navigate('/network');
    };

    const handleMessages = () => {
      navigate('/chat');
    };

    return (
      <nav className="bg-white shadow fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-8 flex-1">
              {/* Logo */}
              <div className="w-8 h-8 rounded flex-shrink-0">
                <img src="/linkedin.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              
              {/* Search with Dropdown */}
              <div className="relative flex-1 max-w-xs sm:max-w-sm" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowResults(true)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-full text-sm focus-visible:ring-blue-600 text-gray-600 placeholder:text-gray-600"
                  />
                </div>

                {/* Search Results Dropdown */}
                {showResults && (searchResults.length > 0 || isSearching || searchQuery.trim().length > 0) && (
                  <Card className="absolute mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((result, index) => (
                          <div
                            key={result.id}
                            onClick={() => handleResultClick(result.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                              index === selectedIndex
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <ProfilePicture 
                              src={result.profilePhotoPath} 
                              size="sm"
                            />
                            <div className="flex flex-col">
                              { result.fullName && (
                                <span className="font-medium text-gray-900 text-left">
                                  {result.fullName}
                                </span>
                              )}
                                <span className="text-sm text-gray-500 text-left">
                                  @{result.username}
                                </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No users found
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
             {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center">

              {/* Navigation Icons */}
              <div className="flex items-center space-x-1">


                {/* Network */}
                {isAuthenticated && (
                <>
                  {/* Home */}
                  <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group"
                    onClick={handleHome}>
                    <Home className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-xs mt-0.5">Home</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                  </div>

                  {/* Network */}
                  <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group"
                    onClick={handleNetwork}>
                    <Users className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-xs mt-0.5">Network</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                  </div>

                  {/* Messages */}
                  <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group"
                    onClick={handleMessages}>
                    <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-xs mt-0.5">Messages</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                  </div>

                  {/* Profile */}
                  <div className="inline-flex flex-col items-center p-2 pr-3 hover:text-gray-900 text-gray-500 cursor-pointer relative group"
                    onClick={handleProfile}>
                    <User className="w-6 h-6" strokeWidth={1.5} />
                    <span className="text-xs mt-0.5">Me</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="default"
                    onClick={handleLogout}
                    className="mx-3">
                    Logout
                  </Button>
                </>
                )}
            </div>
          </div>

          {!isAuthenticated && (
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button
                variant="default"
                onClick={() => navigate('/register')}>
                Register
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
            <div className="sm:hidden flex items-center">
              <Menu 
                className="w-6 h-6 text-gray-500 hover:text-gray-900 ml-2" 
                strokeWidth={1.5}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">

            {/* Home */ }
            {isAuthenticated && (
            <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleHome}>
              <Home className="w-6 h-6 mr-3" strokeWidth={1.5} />
              <span>Home</span>
            </div>
            )}

            {/* Network */}
            {isAuthenticated && (
            <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleNetwork}>
              <Users className="w-6 h-6 mr-3" strokeWidth={1.5} />
              <span>Network</span>
            </div>
            )}

            {/* Messages */}
            {isAuthenticated && (
            <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleMessages}>
              <MessageSquare className="w-6 h-6 mr-3" strokeWidth={1.5} />
              <span>Messages</span>
            </div>
            )}
            
            {/* Profile */}
            {isAuthenticated && (
            <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={handleProfile}>
              <User className="w-6 h-6 mr-3" strokeWidth={1.5} />
              <span>Me</span>
            </div>
            )}

            {/* Mobile Logout */}
            {isAuthenticated && (
            <div className="px-4 py-2">
              <Button
                variant="default"
                onClick={handleLogout}>
                Logout
              </Button>
            </div>
            )}

            {!isAuthenticated && (
              <div className="px-4 py-2 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="w-full">
                  Login
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/register')}
                  className="w-full">
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </nav>
  );
};  