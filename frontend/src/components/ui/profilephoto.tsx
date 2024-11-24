import ProfilePictureProps from '@/types/ProfilePicture';

export const ProfilePicture = ({ size = 'md', src = '/src/assets/default.jpg' }: ProfilePictureProps) => {
    const sizeClasses = {
      sm: 'w-10 h-10',
      md: 'w-16 h-16',
      lg: 'w-24 h-24'
    };
     return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white`}>
        <img
          src={src}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
    );
};