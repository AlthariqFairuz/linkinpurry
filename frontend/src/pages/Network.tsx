
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { User } from '@/types/User';
import { NetworkCard } from '@/components/ui/networkcard';
import { fetchUnconnected, fetchRequested, fetchConnected } from '@/api/fetchNetwork';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Loading from '@/components/ui/loading';

export default function Network() {
  const [userData, setUserData] = useState<User | null>(null);
  const [unconnected, setUnconnected] = useState(null);
  const [requested, setRequested] = useState(null);
  const [connected, setConnected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDatas = async () => {
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
        const resultUnconnected = await fetchUnconnected();
        if (resultUnconnected) {
          setUnconnected(resultUnconnected);
        }

        const resultRequested = await fetchRequested();
        if (resultRequested) {
          setRequested(resultRequested);
        }

        const resultConnected = await fetchConnected();
        if (resultConnected) {
          setConnected(resultConnected);
        }

      } catch (error) {
        console.error('Fetch user error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatas();
  }, []);

  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-[68px]">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <ProfileCard fullName={userData.fullName} username= {userData.username} email={userData.email} profilePhotoPath={userData.profilePhotoPath} connections={userData.connections}/>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader >
                <CardTitle className="text-left text-lg">Unconnected</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-content-space-between gap-4">
                {unconnected.connection.map(user => (
                  <NetworkCard key={"unconnected#"+user.id} userId={user.id} fullName={user.fullName} username={user.username} profilePhotoPath={user.profilePhotoPath} connected={false} requested={false} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader >
                <CardTitle className="text-left text-lg">Connection Requested</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-content-space-between gap-4">
                {requested.connection.map(user => (
                  <NetworkCard key={"requested#"+user.id} userId={user.id} fullName={user.fullName} username={user.username} profilePhotoPath={user.profilePhotoPath} connected={false} requested={true} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader >
                <CardTitle className="text-left text-lg">Connected</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-content-space-between gap-4">
                {connected.connection.map(user => (
                  <NetworkCard key={"connected#"+user.id} userId={user.id} fullName={user.fullName} username={user.username} profilePhotoPath={user.profilePhotoPath} connected={true} requested={false} />
                ))}
              </CardContent>
            </Card>
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