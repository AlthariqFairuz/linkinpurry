export interface User {
    email: string;
    username: string;
    fullName: string | null;
    skills: string | null;
    workHistory: string | null;
    profilePhotoPath: string;
    connections: number | null;
}

export interface ApiResponse {
    success: boolean;
    message: string;
    body: {
      email: string;
      username: string;
      fullName: string | null;
      skills: string | null;
      workHistory: string | null;
      profilePhotoPath: string;
      connections: number | null;
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