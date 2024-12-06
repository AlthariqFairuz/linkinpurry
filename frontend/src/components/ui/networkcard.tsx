import { Button } from "@/components/ui/button";
import { ProfilePicture } from "@/components/ui/profilephoto";
import { useToast } from "@/hooks/use-toast";
import NetworkCardProps from "@/types/NetworkCard";
import { useNavigate } from "react-router-dom"; 

export function NetworkCard({
  userId,
  fullName,
  username,
  profilePhotoPath,
  requested = false,
  receivedRequest = false,
  showDisconnect,
  allUsers = false,
  onUpdate
}: NetworkCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleConnect = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/request/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Connection request sent",
          variant: "success"
        });
        onUpdate?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to send connection request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request: " + error,
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/disconnect/${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to disconnect');
      }
  
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Successfully disconnected",
          variant: "success"
        });

        onUpdate?.();
      } else {
        throw new Error(data.message || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAccept = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/accept-request/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Connection request accepted",
          variant: "success"
        });
        onUpdate?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to accept request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request: " + error,
        variant: "destructive"
      });
    }
  };

  const handleDecline = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/decline-request/${userId}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Connection request declined",
          variant: "success"
        });
        onUpdate?.();
      } else {
        toast({
          title: "Error",
          description: "Failed to decline request",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline request: " + error,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="cursor-pointer" onClick={() => navigate(`/profile/${userId}`)}>
        <ProfilePicture src={profilePhotoPath} size="lg" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div 
          className="font-medium text-black cursor-pointer truncate"
          onClick={() => navigate(`/profile/${userId}`)}
        >
          {fullName || 'No Name'}
        </div>
        {username && (
          <div className="text-sm text-gray-500 truncate">
            @{username}
          </div>
        )}
        
        <div className="mt-2 space-x-2">
          
          {!showDisconnect && !requested && !receivedRequest && !allUsers && (
            <Button 
              onClick={handleConnect}
              className="rounded-full"
            >
              Connect
            </Button>
          )}

          {allUsers && (
            <Button 
              variant="default"
              className="rounded-full"
              onClick={() => navigate(`/profile/${userId}`)}
            >
              See Profile
            </Button>
          )}

          {requested && (
            <Button 
              variant="outline"
              className="rounded-full"
              disabled
            >
              Pending
            </Button>
          )}

          {receivedRequest && (
            <>
              <Button 
                variant="default"
                onClick={handleAccept}
                className="rounded-full"
              >
                Accept
              </Button>

              <Button 
                variant="outline"
                onClick={handleDecline}
                className="rounded-full"
              >
                Decline
              </Button>
            </>
          )}

          {showDisconnect && (
            <Button 
              variant="destructive"
              className="rounded-full"
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}