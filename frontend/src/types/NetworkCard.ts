export type ConnectionStatus = 'connected' | 'requested' | 'incoming' | 'unconnected';

interface NetworkCardProps {
    userId: string;
    fullName: string | null;
    username?: string;
    profilePhotoPath: string;
    connected?: boolean;
    requested?: boolean;
    receivedRequest?: boolean;
    onUpdate?: () => void;
  }
export default NetworkCardProps;