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
    id?: string;
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
      id?: string;
      email?: string;
      username?: string;
      fullName: string | null;
      skills: string[];
      workHistory: string[];
      profilePhotoPath: string;
    } | null;
}
