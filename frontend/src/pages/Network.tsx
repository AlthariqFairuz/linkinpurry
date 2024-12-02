import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Card, CardContent } from "@/components/ui/card";
import { NetworkCard } from '@/components/ui/networkcard';
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, UserPlus, UserCheck, Clock, User } from "lucide-react";
import { NetworkResponse, NetworkApiResponse } from '@/types/Network';
import LoadingComponent from '@/components/ui/loadingcomponent';

type NetworkSection = 'allUsers' | 'unconnected' | 'requested' | 'received' | 'connected';

export default function Network() {
  const navigate = useNavigate();
  const [networkData, setNetworkData] = useState<{
    allUsers: NetworkResponse[];
    unconnected: NetworkResponse[];
    requested: NetworkResponse[];
    received: NetworkResponse[];
    connected: NetworkResponse[];
  }>({
    allUsers: [],
    unconnected: [],
    requested: [],
    received: [],
    connected: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState<NetworkSection>('allUsers');
  const [error, setError] = useState<string | null>(null);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const responses = await Promise.all([
        fetch('http://localhost:3000/api/network/all-users', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/unconnected', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/requested', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/incoming-requests', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/connected', { credentials: 'include' })
      ]);

      const [allUsersData, unconnectedData, requestedData, receivedData, connectedData] = 
        await Promise.all(responses.map(r => r.json())) as NetworkApiResponse[];

      setNetworkData({
        allUsers: allUsersData.body?.connection || [],
        unconnected: unconnectedData.body?.connection || [],
        requested: requestedData.body?.connection || [],
        received: receivedData.body?.connection || [],
        connected: connectedData.body?.connection || []
      });
    } catch (error) {
      console.error('Error fetching network data:', error);
      setError('Failed to load network data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const getCurrentData = () => networkData[section] || [];

  const sectionConfig = {
    allUsers: {
      title: 'All Users',
      icon: Users,
      emptyMessage: 'No users available'
    },
    unconnected: {
      title: 'People you may know',
      icon: User,
      emptyMessage: 'No suggestions available'
    },
    requested: {
      title: 'Sent Invitations',
      icon: UserPlus,
      emptyMessage: 'No pending sent invitations'
    },
    received: {
      title: 'Received Invitations',
      icon: Clock,
      emptyMessage: 'No pending received invitations'
    },
    connected: {
      title: 'Connections',
      icon: UserCheck,
      emptyMessage: 'No connections yet'
    }
  };

  const getCurrentIcon = () => {
    const Icon = sectionConfig[section].icon;
    return <Icon className="h-5 w-5 text-[#0a66c2]" />;
  };

  const handleNetworkUpdate = async () => {
    await fetchNetworkData();
  };

  if (error) {
   navigate('/notfound');
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      
      <main className="pt-20 pb-8">
        <div className="max-w-[1128px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {getCurrentIcon()}
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{sectionConfig[section].title}</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className={[
                "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium w-full sm:w-auto",
                "bg-[#0a66c2] text-white",
                "hover:bg-[#004182]",
                "active:bg-[#00294e]",
                "focus-visible:ring-2 focus-visible:ring-[#0a66c2] focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                "shadow-sm hover:shadow-md",
                "transition-all duration-200 ease-in-out",
                "relative overflow-hidden",
                "before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:to-white/10",
                "before:opacity-0 hover:before:opacity-100",
                "before:transition-opacity before:duration-200",
                "hover:transform hover:scale-[1.02] active:scale-[0.98]",
              ].join(" ")}>
                <span className="flex items-center justify-between w-full">
                  <span>Manage network</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] sm:w-56">
                <DropdownMenuItem 
                    onClick={() => setSection('allUsers')}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 " />
                      All Users
                    </span>
                    {networkData.allUsers.length > 0 && (
                      <Badge variant="secondary">{networkData.allUsers.length}</Badge>
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSection('unconnected')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 " />
                    Suggestions
                  </span>
                  {networkData.unconnected.length > 0 && (
                    <Badge variant="secondary">{networkData.unconnected.length}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSection('requested')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Sent
                  </span>
                  {networkData.requested.length > 0 && (
                    <Badge variant="secondary">{networkData.requested.length}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSection('received')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Received
                  </span>
                  {networkData.received.length > 0 && (
                    <Badge variant="secondary">{networkData.received.length}</Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSection('connected')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Connected
                  </span>
                  {networkData.connected.length > 0 && (
                    <Badge variant="secondary">{networkData.connected.length}</Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Section */}
          {isLoading ? ( 
            <LoadingComponent />
          ): (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentData().length > 0 ? (
                getCurrentData().map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <NetworkCard
                        userId={user.id}
                        fullName={user.fullName || 'No Name'}
                        username={user.username}
                        profilePhotoPath={user.profilePhotoPath}
                        allUsers={section === 'allUsers'}
                        requested={section === 'requested'}
                        receivedRequest={section === 'received'}
                        onUpdate={handleNetworkUpdate}
                        showDisconnect={section === 'connected'}
                      />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {sectionConfig[section].emptyMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}