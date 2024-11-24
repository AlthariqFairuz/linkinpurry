interface User {
    fullName: string;
    title: string;
    location: string;
}
  
interface ProfileCardProps {
    user: User;
}

export default ProfileCardProps;