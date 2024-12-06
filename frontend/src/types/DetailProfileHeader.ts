export type ConnectionStatusDetailProfile = 'unconnected' | 'pending-sent' | 'pending-received' | 'connected';

interface DetailProfileHeaderProps {
    id: string;
    fullName: string;
    connections: number;
    profilePhotoPath: string;
    connectionStatus: ConnectionStatusDetailProfile;
    isLoggedIn: boolean;
    onConnect: () => void;
    onAccept: () => void;
    onDecline: () => void;
    onDisconnect: () => void;
}

export default DetailProfileHeaderProps;