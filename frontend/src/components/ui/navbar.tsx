import NavbarProps from "@/types/navbar";
import { Users, MessageSquare, Bookmark, Menu, Search } from 'lucide-react';
import { ProfilePicture } from './profilephoto';
import { Input } from '@/components/ui/input';
import { useState } from "react";

export const Navbar = ({ onLogout }: NavbarProps) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("menginfokan query :", searchQuery);
    };

     return (
      <nav className="bg-white shadow fixed top-0 w-full z-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Main Navbar */}
          <div className="flex justify-between h-14 sm:h-16">
            {/* Left Section */}
            <div className="flex items-center gap-2 sm:gap-8 flex-1">
              {/* Logo */}
              <div className="w-8 h-8 rounded flex-shrink-0">
                <img src="/linkedin.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              
              {/* Search */}
              <div className="relative flex-1 max-w-xs sm:max-w-sm">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-gray-100 rounded-full text-sm focus-visible:ring-blue-600 text-gray-600 placeholder:text-gray-600"
                    />
                  </div>
                </form>
              </div>
            </div>
             {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center">
              {/* Navigation Icons */}
              <div className="flex items-center space-x-1">
                {/* Network */}
                <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group">
                  <Users className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-xs mt-0.5">Network</span>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
                 {/* Messages */}
                <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group">
                  <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-xs mt-0.5">Messages</span>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
                 {/* Bookmarks */}
                <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group">
                  <Bookmark className="w-6 h-6" strokeWidth={1.5} />
                  <span className="text-xs mt-0.5">Bookmarks</span>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
                 {/* Profile Section */}
                <div className="h-8 w-px bg-gray-200 mx-2"></div>
                <div className="inline-flex flex-col items-center p-2 hover:text-gray-900 text-gray-500 cursor-pointer relative group">
                  <ProfilePicture size="sm" />
                  <span className="text-xs mt-0.5">Me</span>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                </div>
                <button
                  onClick={onLogout}
                  className="ml-2 px-4 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
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
                {/* Network */}
                <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                  <Users className="w-6 h-6 mr-3" strokeWidth={1.5} />
                  <span>Network</span>
                </div>
                 {/* Messages */}
                <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                  <MessageSquare className="w-6 h-6 mr-3" strokeWidth={1.5} />
                  <span>Messages</span>
                </div>
                 {/* Bookmarks */}
                <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                  <Bookmark className="w-6 h-6 mr-3" strokeWidth={1.5} />
                  <span>Bookmarks</span>
                </div>
                 {/* Profile */}
                <div className="flex items-center px-4 py-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50">
                  <ProfilePicture size="sm" />
                  <span className="ml-3">Profile</span>
                </div>
                 {/* Mobile Logout */}
                <div className="px-4 py-2">
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    );
};  