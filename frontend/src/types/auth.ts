export interface User {
    id: string;
    username: string;
    email: string;
    createdAt: string;
  }
  
  export interface AuthResponse {
    success: boolean;
    data?: {
      token: string;
      user: User;
      tokenExpires: string;
    };
    error?: string;
  }