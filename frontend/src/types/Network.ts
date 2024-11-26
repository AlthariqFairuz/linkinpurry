import { User } from '@/types/User';

export interface Network {
  connection: User[];
}

export interface NetworkApiResponse {
    success: boolean;
    message: string;
    body: {
      connection: User[];
    } | null;
}