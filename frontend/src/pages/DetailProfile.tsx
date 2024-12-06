import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUser } from '@/api/fetchUser';
import { getUserId } from '@/api/getUserId';
import { User } from '@/types/User';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Navbar } from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import DetailProfileHeader from '@/components/ui/detailprofileheader';
import LoadingComponent from '@/components/ui/loadingcomponent';
import { ConnectionStatusDetailProfile } from '@/types/DetailProfileHeader';
import LatestPostSidebar from '@/components/ui/detailprofilesidebar';

export const DetailProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusDetailProfile>('unconnected');
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
        
        // Set login status
        setIsLoggedIn(!!currentUserId);

        // Check if viewing own profile
        if (currentUserId === id) {
          navigate('/profile');
          return;
        }

        // Fetch profile data
        const userData = await fetchUser(id);
        if (userData) {
          setProfileData(userData);
          
          // Only check connection status if user is logged in
          if (currentUserId) {
            // Check connection status
            const connectionResponse = await fetch(`http://localhost:3000/api/connection-status/${id}`, {
              credentials: 'include'
            });
            
            if (connectionResponse.ok) {
              const connectionData = await connectionResponse.json();
              if (connectionData.body.connected) {
                setConnectionStatus('connected');
              } else {
                // cek apakah sudah mengirim request atau sudah menerima request
                const [sentResponse, receivedResponse] = await Promise.all([
                  fetch(`http://localhost:3000/api/network/requested`, {
                    credentials: 'include'
                  }),
                  fetch(`http://localhost:3000/api/network/incoming-requests`, {
                    credentials: 'include'
                  })
                ]);
            
                if (sentResponse.ok && receivedResponse.ok) {
                  const sentData = await sentResponse.json();
                  const receivedData = await receivedResponse.json();
            
                  const hasSentRequest = sentData.body.connection.some(
                    (user: { id: string }) => user.id === id
                  );
                  const hasReceivedRequest = receivedData.body.connection.some(
                    (user: { id: string }) => user.id === id
                  );
            
                  setConnectionStatus(
                    hasSentRequest ? 'pending-sent' : hasReceivedRequest ? 'pending-received' : 'unconnected'
                  );
                }
              }
            }
          }
        } else {
          toast({
            description: "User does not exist",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        if (isLoggedIn) {
          toast({
            title: "Error",
            description: "An error occurred while loading the profile",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, toast, navigate, isLoggedIn]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/request/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setConnectionStatus('pending-sent');
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

  const handleAccept = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/accept-request/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {

        // update profile data with new connection count
        if(id){
          const updatedUserData = await fetchUser(id);
          if (updatedUserData) {
            setProfileData(updatedUserData); 
          }
        }

        setConnectionStatus('connected');
        toast({
          title: "Success",
          description: "Connection request accepted",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to accept connection request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Accept request error:', error);
      toast({
        title: "Error",
        description: "An error occurred while accepting the connection request",
        variant: "destructive",
      });
    }
  };
  
  const handleDecline = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/decline-request/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setConnectionStatus('unconnected');
        toast({
          title: "Success",
          description: "Connection request declined",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to decline connection request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Decline request error:', error);
      toast({
        title: "Error",
        description: "An error occurred while declining the connection request",
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
        setConnectionStatus('unconnected');

        if(id){
          const updatedUserData = await fetchUser(id);
          if (updatedUserData) {
            setProfileData(updatedUserData); 
          }
        }

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

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <main className="pt-24">
          {isLoading ? <LoadingComponent /> : null}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] pt-8">
      <Navbar />
      
      {isLoading ? <LoadingComponent /> : (
        <main className="pt-16 pb-32">
          <div className="max-w-[1128px] mx-auto px-4 space-y-4">
            {/* Profile Header */}
            <DetailProfileHeader
              id={ id }
              fullName={profileData.fullName}
              connections={profileData.connections}
              profilePhotoPath={profileData.profilePhotoPath}
              connectionStatus={connectionStatus}
              isLoggedIn={isLoggedIn}
              onConnect={handleConnect}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onDisconnect={handleDisconnect}
            />
            

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_1fr] gap-4">
              <div className="space-y-4">
                {/* Work History - Always visible */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Work History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700 break-words">{profileData.workHistory || 'No work history available'}</p>
                  </CardContent>
                </Card>

                {/* Skills - Always visible */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-gray-700 break-words">{profileData.skills || 'No skills listed'}</p>
                    </CardContent>
                </Card>
              </div>

              {/* Right Sidebar - Not visible for unregistered users*/}
              <div className="space-y-4">
                <LatestPostSidebar
                  userId={id || ''}
                  isLoggedIn={isLoggedIn}
                  profilePhotoPath={profileData.profilePhotoPath}
                  fullName={profileData.fullName}
                  latestPost={profileData.latestPost}
                />
              </div>
            </div>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
};

export default DetailProfile;