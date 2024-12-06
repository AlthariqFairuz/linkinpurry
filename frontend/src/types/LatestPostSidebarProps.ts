import { Post } from "@/types/Post";

export interface LatestPostSidebarProps {
    userId: string;
    isLoggedIn: boolean;
    profilePhotoPath: string;
    fullName: string;
    latestPost: Post | null;
  }