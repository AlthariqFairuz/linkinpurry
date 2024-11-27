type ConnectionStatusDetailProfile = 'unconnected' | 'pending' | 'connected';

interface ProfileHeaderProps {
    fullName: string;
    connections: number;
    profilePhotoPath: string;
    connectionStatus: ConnectionStatusDetailProfile;
    isLoggedIn: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
}

export default ProfileHeaderProps;