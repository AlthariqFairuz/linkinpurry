
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { User } from '@/types/User';
import { NetworkCard } from '@/components/ui/networkcard';
import { fetchNetwork } from '@/api/fetchNetwork';
import Loading from '@/components/ui/loading';

export default function Network() {
  const [userData, setUserData] = useState<User | null>(null);
  const [userNetwork, setUserNetwork] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserDataAndNetwork = async () => {
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

        // Also fetch network for user
        const network = await fetchNetwork();
        if (network) {
          setUserNetwork(network);
        }

      } catch (error) {
        console.error('Fetch user error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndNetwork();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-[68px]">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard fullName={userData.fullName} username= {userData.username} email={userData.email} profilePhotoPath={userData.profilePhotoPath}/>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex flex-wrap justify-content-space-between gap-4">
                {userNetwork.connection.map(user => (
                  <NetworkCard fullName={user.fullName} username={user.username} profilePhotoPath={user.profilePhotoPath} />
                ))}
              </div>
            </div>
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