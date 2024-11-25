import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Post } from '@/components/ui/post';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { User } from '@/types/User';

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // First get the user ID
        const id = await getUserId();
        if (!id) {
          console.log('Failed to fetch user ID');
          return;
        }
      
        // Then fetch the user details using the ID
        const user = await fetchUser(id);
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        console.error('Fetch user error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
 
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

  console.log(userData);

  const handleProfile = () => {
    navigate('/profile');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} onProfile={handleProfile} isProfilePage={false}/>

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard fullName={userData.fullName} username= {userData.username} email={userData.email} />
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