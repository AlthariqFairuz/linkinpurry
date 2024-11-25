export interface User {
    email: string;
    username: string;
    fullName: string | null;
    skills: string[];
    workHistory: string[];
    profilePhotoPath: string;
}

export interface UserProfile {
    fullName: string | null;
    skills: string[];
    workHistory: string[];
    profilePhotoPath: string;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    body: {
      email: string | null;
      username: string | null;
      fullName: string | null;
      skills: string[];
      workHistory: string[];
      profilePhotoPath: string;
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