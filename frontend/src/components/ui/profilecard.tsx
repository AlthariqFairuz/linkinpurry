import { ProfilePicture } from "./profilephoto";
import ProfileCardProps from '@/types/ProfileCard';

export const ProfileCard = ({ username, email, fullName, profilePhotoPath, connections }: ProfileCardProps) => {
    return (
      <div className="bg-white rounded-lg shadow mb-4">
        <img 
         src="/images/istri-gw.webp" 
         className="h-24 w-full rounded-t-lg object-cover" 
         alt="Background"
       />
        <div className="px-4 pb-4">
          <div className="relative -mt-12 mb-4">
            <ProfilePicture size="lg" src={profilePhotoPath} />
          </div>
          <div className="mb-4">
            <h2 className="text-gray-900 text-xl font-bold break-words">{fullName}</h2>
            <p className="text-gray-600 break-words">{email}</p>
            <p className="text-sm text-gray-500 mt-1 break-words">{username}</p>
          </div>
          <div className="border-t border-b py-2 mb-4">
            <div className="text-sm">
              <p className="text-blue-600 hover:underline cursor-pointer">{connections} connections</p>
              <p className="text-blue-600 hover:underline cursor-pointer mt-1">69 profile views</p>
            </div>
          </div>
        </div>
      </div>
    );
  };    