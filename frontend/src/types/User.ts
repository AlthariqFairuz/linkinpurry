import { Post } from "./Post";

export interface User {
    id: string | null;
    email: string;
    username: string;
    fullName: string | null;
    skills: string | null;
    workHistory: string | null;
    profilePhotoPath: string;
    connections: number | null;
    latestPost: Post | null;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    body: {
      id: string | null;
      email: string;
      username: string;
      fullName: string | null;
      skills: string | null;
      workHistory: string | null;
      profilePhotoPath: string;
      connections: number | null;
      latestPost: Post | null;
    } | null;
}

export interface verifyResponse {
    success: boolean;
    message: string;
    body: {
      token: string;
      id: string;
      email: string;
      fullName: string | null;
    } | null;
} 