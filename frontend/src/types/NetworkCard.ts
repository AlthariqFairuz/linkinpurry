interface NetworkCardProps {
    userId: string;
    fullName: string;
    username: string;
    profilePhotoPath: string;
    connectionStatus: string;
    handleClick: (id: string) => void;
}

export default NetworkCardProps;