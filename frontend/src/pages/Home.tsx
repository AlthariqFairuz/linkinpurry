import { useNavigate, useParams } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Post } from '@/components/ui/post';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { fetchUser } from '@/middleware/fetchUser';
import { useEffect } from 'react';
import { useState } from 'react';
import { UserProfile, User } from '@/types/User';

export default function Home() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userData, setUserData] = useState<UserProfile | User>(null);
 
  useEffect(() => {
   const loadUser = async () => {
     try {
       if (!id) return;
       const fetchedUser = await fetchUser(id);
       if (fetchedUser) {
         setUserData(fetchedUser);
       }
     } catch (error) {
       console.error('User error:', error);
     }
   };
    loadUser();
 }, [id]);

  const posts = [
    {
      id: 1,
    },
    {
      id: 2,
    }
  ];

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

  const handleProfile = async () => {
    try {
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error('Profile error:', error);
    }
  };

  console.log(id);

  console.log(userData);

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} onProfile={handleProfile}/>

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard username="bambang" email="bambang@gmail.com" fullName="bambang" />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex gap-4">
                <ProfilePicture size="sm" />
                <button className="flex-1 text-left px-4 py-2.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                  Start a post
                </button>
              </div>
            </div>

            {posts.map(post => (
              <Post key={post.id} />
            ))}
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