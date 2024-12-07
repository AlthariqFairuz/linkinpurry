import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { NetworkResponse } from '@/types/Network';
import { useNavigate } from 'react-router-dom';

export const RightSidebar = () => {
  const [unconnectedUsers, setUnconnectedUsers] = useState<NetworkResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnconnectedUsers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/network/unconnected', {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.body.connection) {
          setUnconnectedUsers(data.body.connection.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch unconnected users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnconnectedUsers();
  }, []);

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/request/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUnconnectedUsers(prev => prev.filter(user => user.id !== userId));
        toast({
          title: "Success",
          description: "Connection request sent",
          variant: "success"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request" + error,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <h2 className="font-semibold mb-4">People you may know</h2>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">People you may know</h2>
      <div className="space-y-4">
        {unconnectedUsers.length > 0 && unconnectedUsers.map((user) => (
          <div key={user.id} className="flex flex-col space-y-2">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                <AvatarImage src={user.profilePhotoPath} alt={user.fullName || ''} />
                <AvatarFallback>{user.fullName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 
                  className="truncate max-w-[200px] font-medium text-sm cursor-pointer text-left"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  {user.fullName || 'LinkInPurry Member'}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 text-left truncate max-w-[200px]">
                  {user.username}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleConnect(user.id)}
            >
              Connect
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};