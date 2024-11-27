import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '@/api/fetchUser';
import { getUserId } from '@/api/getUserId';
import { User } from '@/types/User';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Navbar } from '@/components/ui/navbar' ;
import Footer from '@/components/ui/footer';
import ProfileHeader from '@/components/ui/detailprofilecard';
import Loading from '@/components/ui/loading';

export const DetailProfile = () => {
 const { id } = useParams();
 const [profileData, setProfileData] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [isConnected, setIsConnected] = useState<boolean>(false);
 const { toast } = useToast();
 const navigate = useNavigate();
  useEffect(() => {
   const loadData = async () => {
     try {
       setIsLoading(true);
       
       if (!id) {
         navigate('/profile');
         return;
       }
        // Get current user's ID
       const currentUserId = await getUserId();
       
       // Check if viewing own profile
       if (currentUserId === id) {
         navigate('/profile');
         return;
       }
        // Fetch profile data
       const userData = await fetchUser(id);
       if (userData) {
         setProfileData(userData);
         
         // Check if connected
         const connectionStatus = await fetch(`http://localhost:3000/api/connection-status/${id}`, {
           credentials: 'include'
         });
         const isConnected = await connectionStatus.json();
         setIsConnected(isConnected.body.connected);
       } 
       else {
         toast({
           title: "Error",
           description: "User does not exist",
           variant: "destructive",
         });
       }
     } catch (error) {
       console.error('Error loading profile:', error);
       toast({
         title: "Error",
         description: "An error occurred while loading the profile",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
    loadData();
 }, [id, toast, navigate]);

  const handleConnect = async () => {
   try {
     const response = await fetch(`http://localhost:3000/api/request/${id}`, {
       method: 'POST',
       credentials: 'include',
       headers: {
         'Content-Type': 'application/json',
       },
     });
      if (response.ok) {
       setIsConnected(true);
       toast({
         title: "Success",
         description: "Connection request sent",
         variant: "success",
       });
     } else {
       toast({
         title: "Error",
         description: "Failed to send connection request",
         variant: "destructive",
       });
     }
   } catch (error) {
     console.error('Connection request error:', error);
     toast({
       title: "Error",
       description: "An error occurred while sending the connection request",
       variant: "destructive",
     });
   }
 };
  const handleDisconnect = async () => {
   try {
     const response = await fetch(`http://localhost:3000/api/disconnect/${id}`, {
       method: 'POST',
       credentials: 'include',
       headers: {
         'Content-Type': 'application/json',
       },
     });
      if (response.ok) {
       setIsConnected(false);
       toast({
         title: "Success",
         description: "Successfully disconnected",
         variant: "success",
       });
     } else {
       toast({
         title: "Error",
         description: "Failed to disconnect",
         variant: "destructive",
       });
     }
   } catch (error) {
     console.error('Disconnect error:', error);
     toast({
       title: "Error",
       description: "An error occurred while disconnecting",
       variant: "destructive",
     });
   }
 };
  if (isLoading) {
    return <Loading isLoading={isLoading} />;
  }

  if (!profileData) {
   navigate('/notfound');
 }

   return (
    <div className="min-h-screen bg-[#f3f2ef] pt-8">
     <Navbar />
      
      <main className="pt-16 pb-8">
        <div className="max-w-[1128px] mx-auto px-4 space-y-4">
          {/* Profile Header */}
          <ProfileHeader
            fullName={profileData.fullName}
            connections={profileData.connections}
            profilePhotoPath={profileData.profilePhotoPath}
            isConnected={isConnected}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr] gap-4">
            <div className="space-y-4">
              {/* Work History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Work History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-gray-700">{profileData.workHistory || 'No work history available'}</p>
                </CardContent>
              </Card>

              {/* Skills - Only Visible to Connected Users */}
              {isConnected && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700">{profileData.skills || 'No skills listed'}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar (subject to change)*/}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Intermediate</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div className="bg-blue-600 h-2.5 rounded-full w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
export default DetailProfile;