import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePicture } from '@/components/ui/profilephoto';

const ProfileHeader = ({ 
  fullName, 
  connections, 
  profilePhotoPath, 
  isConnected, 
  onConnect, 
  onDisconnect 
}) => {
  return (
    <Card className="overflow-hidden">
        {/* Background Banner */}
        <div className="bg-white rounded-lg shadow mb-4">
            <img 
            src="/images/default-background.webp" 
            className="h-24 w-full rounded-t-lg object-cover" 
            alt="Background"
        />
        </div>
        <CardContent className="relative pt-0">
        {/* Profile Picture - Positioned to overlap banner */}
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
            {!isConnected ? (
              <Button 
                onClick={onConnect}
                className="rounded-full"
              >
                Connect
              </Button>
            ) : (
              <Button 
                onClick={onDisconnect}
                variant="destructive"
                className="rounded-full"
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;