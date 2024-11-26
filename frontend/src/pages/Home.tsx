import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Feed } from '@/components/ui/feed';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { User } from '@/types/User';
import { useToast } from "@/hooks/use-toast"
import Loading from '@/components/ui/loading';

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // First get the user ID
        const id = await getUserId();
      
        // Then fetch the user details using the ID
        const user = await fetchUser(id);
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user details: " + error,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast, navigate]);
 
  const posts = [
    {
      id: 1,
    },
    {
      id: 2,
    }
  ];

  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-[68px]">
      console.log(userData);
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard 
              fullName={userData.fullName} 
              username={userData.username} 
              email={userData.email} 
              profilePhotoPath={userData.profilePhotoPath}
              connections={userData.connections}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex gap-4">
                <ProfilePicture size="sm" src={userData.profilePhotoPath}/>
                <button className="flex-1 text-left px-4 py-2.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                  Start a post
                </button>
              </div>
            </div>

            {posts.map(post => (
              <Feed key={post.id} />
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