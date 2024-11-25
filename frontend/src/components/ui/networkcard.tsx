import { UserPlus } from 'lucide-react';
import { ProfilePicture } from "./profilephoto";
import ProfileCardProps from '@/types/ProfileCard';

export const NetworkCard = ({ username, email, fullName, profilePhotoPath }: ProfileCardProps) => {
    return (
      <div style={{flex: "0 1 calc(34% - 1em)"}} className="bg-white rounded-lg shadow mb-4">
        <img 
         src="/images/default-background.webp" 
         className="h-24 w-full rounded-t-lg object-cover" 
         alt="Background"
       />
        <div className="px-4 pb-4">
          <div className="relative -mt-12 mb-4">
            <ProfilePicture size="lg" src={profilePhotoPath} />
          </div>
          <div className="mb-4">
            <h2 className="text-gray-900 text-xl font-bold">{fullName}</h2>
            <p className="text-gray-600">{email}</p>
            <p className="text-sm text-gray-500 mt-1">{username}</p>
          </div>
          
          <button
            // onClick={onConnect}
            className="m-2 px-8 py-1.5 text-sm text-blue-600 bg-white border-blue-600 rounded-pill hover:bg-blue-100 hover:text-blue-800 hover:border-blue-800 transition-colors"
          >
            <UserPlus style={{display:"inline", verticalAlign:"text-bottom", marginRight:"4px"}} size={16}/>
            Connect
          </button>

        </div>
      </div>
    );
  };    