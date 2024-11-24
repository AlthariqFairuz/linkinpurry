interface NavbarProps {
    onLogout: () => void;
    onSearch?: (query: string) => void;
    onProfile: () => void;
    onLogo: () => void;
}

export default NavbarProps;