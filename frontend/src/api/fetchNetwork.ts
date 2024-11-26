import { Network, NetworkApiResponse } from '@/types/Network';

export const fetchUnconnected = async (): Promise<Network> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/unconnected`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data: NetworkApiResponse = await response.json();
    return data.body;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};

export const fetchRequested = async (): Promise<Network> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/requested`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data: NetworkApiResponse = await response.json();
    return data.body;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};

export const fetchConnected = async (): Promise<Network> => {
  try {
    const response = await fetch(`http://localhost:3000/api/network/connected`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const data: NetworkApiResponse = await response.json();
    return data.body;
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
};