import { UserPlus } from 'lucide-react';
import { ProfilePicture } from "./profilephoto";
import NetworkCardProps from '@/types/NetworkCard';
import { Button } from '@/components/ui/button';

export const NetworkCard = ({ userId, username, fullName, profilePhotoPath, connected, requested }: NetworkCardProps) => {
    let button;
    if (connected) {
      button = <Button
        // onClick={onConnect}
        variant="outline"
      >
        <UserPlus style={{display:"inline", verticalAlign:"text-bottom"}} size={16}/>
        Unconnect
      </Button>
    }

    if (!connected && !requested) {
      button = <Button
        // onClick={onConnect}
        variant="outline"
      >
        <UserPlus style={{display:"inline", verticalAlign:"text-bottom"}} size={16}/>
        Connect
      </Button>
    }

    return (
      <div style={{flex: "0 1 calc(34% - 1em)"}} className="bg-white rounded-lg shadow mb-4">
        <img 
         src="/images/default-background.webp" 
         className="h-24 w-full rounded-t-lg object-cover" 
         alt="Background"
       />
        <div className="px-4 pb-4">
          <a className="relative -mt-12 mb-4" href={"/profile/" + userId}>
            <ProfilePicture size="lg" src={profilePhotoPath} />
          </a>
          <div className="mb-4">
            <h2 className="text-gray-900 text-xl font-bold">{fullName}</h2>
            <p className="text-sm text-gray-500 mt-1">{username}</p>
          </div>
          
          {button}

        </div>
      </div>
    );
  };    