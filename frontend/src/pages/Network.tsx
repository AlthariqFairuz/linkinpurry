import { useEffect, useState } from 'react';
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
import { ChevronDown, Users, UserPlus, UserCheck, Clock } from "lucide-react";
import { NetworkResponse, NetworkApiResponse } from '@/types/Network';

type NetworkSection = 'unconnected' | 'requested' | 'received' | 'connected';

export default function Network() {
  const [unconnectedUsers, setUnconnectedUsers] = useState<NetworkResponse[]>([]);
  const [requestedUsers, setRequestedUsers] = useState<NetworkResponse[]>([]);
  const [receivedUsers, setReceivedUsers] = useState<NetworkResponse[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<NetworkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState<NetworkSection>('unconnected');
  const [counts, setCounts] = useState({
    unconnected: 0,
    requested: 0,
    received: 0,
    connected: 0
  });

  const fetchUsers = async () => {
    try {
      const responses = await Promise.all([
        fetch('http://localhost:3000/api/network/unconnected', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/requested', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/incoming-requests', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/connected', { credentials: 'include' })
      ]);
      
      const [unconnectedUsers, requestedUsers, receivedUsers, connectedUsers] = await Promise.all(
        responses.map(r => r.json())
      ) as NetworkApiResponse[];
      console.log(unconnectedUsers);
      setUnconnectedUsers(unconnectedUsers.body?.connection || []);
      setRequestedUsers(requestedUsers.body?.connection || []);
      setReceivedUsers(receivedUsers.body?.connection || []);
      setConnectedUsers(connectedUsers.body?.connection || []);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      const responses = await Promise.all([
        fetch('http://localhost:3000/api/network/unconnected', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/requested', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/incoming-requests', { credentials: 'include' }),
        fetch('http://localhost:3000/api/network/connected', { credentials: 'include' })
      ]);
      
      const [unconnected, requested, received, connected] = await Promise.all(
        responses.map(r => r.json())
      ) as NetworkApiResponse[];

      setCounts({
        unconnected: unconnected.body?.connection.length || 0,
        requested: requested.body?.connection.length || 0,
        received: received.body?.connection.length || 0,
        connected: connected.body?.connection.length || 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCounts();
  }, [section]);

  const sectionConfig = {
    unconnected: {
      title: 'People you may know',
      icon: Users,
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
    return <Icon className="h-5 w-5" />;
  };

  console.log(unconnectedUsers);
  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      
      <main className="pt-20 pb-8">
        <div className="max-w-[1128px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              {getCurrentIcon()}
              <h1 className="text-xl sm:text-2xl font-semibold">{sectionConfig[section].title}</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50 w-full sm:w-auto">
                <span className="flex items-center justify-between w-full">
                  <span>Manage network</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[280px] sm:w-56">
                <DropdownMenuItem 
                  onClick={() => setSection('unconnected')}
                  className="flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Suggestions
                  </span>
                  {counts.unconnected > 0 && (
                    <Badge variant="secondary">{counts.unconnected}</Badge>
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
                  {counts.requested > 0 && (
                    <Badge variant="secondary">{counts.requested}</Badge>
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
                  {counts.received > 0 && (
                    <Badge variant="secondary">{counts.received}</Badge>
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
                  {counts.connected > 0 && (
                    <Badge variant="secondary">{counts.connected}</Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section === 'unconnected' ? (
                unconnectedUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <NetworkCard
                      userId={user.id}
                      fullName={user.fullName || 'No Name'}
                      username={user.username}
                      profilePhotoPath={user.profilePhotoPath}
                      connected={section === 'connected'}
                      requested={section === 'requested'}
                      receivedRequest={section === 'received'}
                      onUpdate={() => {
                        fetchUsers();
                        fetchCounts();  
                      }}
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