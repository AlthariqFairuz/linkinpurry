export interface NetworkResponse {
  id: string;
  fullName: string | null;
  username: string;
  skills: string | null;
  workHistory: string | null;  
  profilePhotoPath: string;
}

export interface NetworkApiResponse {
    success: boolean;
    message: string;
    body: {
      connection: NetworkResponse[];
    } | null;
}