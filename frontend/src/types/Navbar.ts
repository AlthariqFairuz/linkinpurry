interface NavbarProps {
    onLogout: () => void;
    onSearch?: (query: string) => void;
    onProfile: () => void;
}

export default NavbarProps;