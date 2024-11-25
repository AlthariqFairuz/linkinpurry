import { verifyResponse } from '@/types/User';

export const getUserId = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/verify`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('Server response not ok:', response.status);
      return null;
    }

    const data: verifyResponse = await response.json();
    
    // Add null check for data.body
    if (!data.body) {
      console.error('No body in response');
      return null;
    }

    return data.body.id;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};