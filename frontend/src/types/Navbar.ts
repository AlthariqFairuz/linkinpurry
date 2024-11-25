interface NavbarProps {
    onLogout: () => void;
    onSearch?: (query: string) => void;
    onProfile: () => void;
    isProfilePage: boolean; 
}

export default NavbarProps;