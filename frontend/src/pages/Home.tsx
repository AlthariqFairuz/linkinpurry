import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Post } from '@/components/ui/post';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';

export default function Home() {
  const navigate = useNavigate();
  const user = {
    fullName: 'Ai Hoshino Bini Gw (need to be fetched from API)',
    title: 'fulstek',
    location: 'Ngawi 69'
  };

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

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar onLogout={handleLogout} />

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user} />
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