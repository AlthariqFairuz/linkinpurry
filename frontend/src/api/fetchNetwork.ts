import { ApiResponse, User } from '@/types/User';

export const fetchUnconnected = async (): Promise<User> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/unconnected`, {
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

export const fetchRequested = async (): Promise<User> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/requested`, {
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

export const fetchConnected = async (): Promise<User> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/connected`, {
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