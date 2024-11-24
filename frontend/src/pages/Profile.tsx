import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Post } from '@/components/ui/post';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';

export default function Profile() {
  const [ user, setUser ] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

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
      console.error('Logout error:', error);
    }
  };

  const handleHome = async () => {
    try {
      navigate('/home', {
        state: {
          message: 'Home successful!'
        }
      });
    } catch (error) {
      console.error('Home error:', error);
    }
  };

  const getProfile = async () => {
    if (id !== undefined) {
      try {
        const response = await fetch(`http://localhost:3000/api/profile/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        response.json().then(
          (res) => setUser(res.body.user)
        );
      } catch (error) {
        console.error('Profile error:', error);
      }
    }
    else {
      try {
        const response = await fetch(`http://localhost:3000/api/profile`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        response.json().then(
          (res) => setUser(res.body.user)
        );
      } catch (error) {
        console.error('Profile error:', error);
      }
    }
  };

  useEffect(() => {
    getProfile();
  },[]);

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} onLogo={handleHome}/>

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user} />
          </div>

          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}