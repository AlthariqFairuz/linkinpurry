import { ApiResponse, User } from '@/types/User';

export const fetchNetwork = async (): Promise<User> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data: ApiResponse = await response.json();
    return data.body;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};