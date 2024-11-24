export interface User {
    id: string;
    email: string;
    username: string;
    fullName: string | null;
    skills: string[];
    workHistory: string[];
    profilePhotoPath: string;
}

export interface UserProfile {
    email?: string;
    username?: string;
    fullName: string | null;
    skills: string[];
    workHistory: string[];
    profilePhotoPath: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    body: {
      email?: string;
      username?: string;
      fullName: string | null;
      skills: string[];
      workHistory: string[];
      profilePhotoPath: string;
    } | null;
}
