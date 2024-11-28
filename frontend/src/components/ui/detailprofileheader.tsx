import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from '@/components/ui/profilephoto';
import { Clock } from "lucide-react";
import DetailProfileHeaderProps from "@/types/DetailProfileHeader";

const DetailProfileHeader = ({ 
  fullName, 
  connections, 
  profilePhotoPath,
  connectionStatus,
  isLoggedIn,
  onConnect, 
  onAccept,
  onDecline,
  onDisconnect 
}: DetailProfileHeaderProps) => {
  const renderConnectionButton = () => {
    if (!isLoggedIn) {
      return (
        <Button 
          onClick={onConnect}
          className="rounded-full"
        >
          Connect
        </Button>
      );
    }

    switch (connectionStatus) {
      case 'connected':
        return (
          <Button 
            onClick={onDisconnect}
            variant="destructive"
            className="rounded-full"
          >
            Disconnect
          </Button>
        );
      case 'pending-sent':
        return (
          <Button 
            variant="secondary"
            className="rounded-full cursor-not-allowed"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            Pending
          </Button>
        );
      case 'pending-received':
        return (
          <>
            <Button 
              onClick={onAccept}
              className="mx-2 rounded-full"
            >
              Accept
            </Button>
            <Button 
              onClick={onDecline}
              variant="outline"
              className="mx-2 rounded-full"
            >
              Decline
            </Button>
          </>
        );
      default:
        return (
          <Button 
            onClick={onConnect}
            className="rounded-full"
          >
            Connect
          </Button>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Background Banner */}
      <div className="bg-white rounded-lg shadow mb-4">
        <img 
          src="/images/istri-gw.webp" 
          className="h-48 w-full rounded-t-lg object-cover" 
          alt="Background"
        />
      </div>
      <CardContent className="relative pt-0">
        {/* Profile Picture - overlap banner */}
        <div className="absolute -top-12 left-6">
          <div className="rounded-full border-4 border-white bg-white">
            <ProfilePicture size="lg" src={profilePhotoPath} />
          </div>
        </div>

        {/* Profile Info Container */}
        <div className="pt-16 pb-4">
          {/* Name and Connections */}
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">{fullName}</h2>
            <p className="text-gray-600 text-sm">{connections} connections</p>
          </div>

          {/* Connection Button */}
          <div className="mt-4">
            {renderConnectionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetailProfileHeader;