export type ConnectionStatus = 'connected' | 'requested' | 'incoming' | 'unconnected';

interface NetworkCardProps {
    userId: string;
    fullName: string | null;
    username?: string;
    profilePhotoPath: string;
    requested?: boolean;
    receivedRequest?: boolean;
    showDisconnect?: boolean;
    allUsers?: boolean;
    onUpdate?: () => void;
  }
export default NetworkCardProps;