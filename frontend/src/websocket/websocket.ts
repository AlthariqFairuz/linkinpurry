import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let userId: string | null = null;
const SERVER_URL = 'http://localhost:3000';

export async function initializeSocket(): Promise<Socket | null> {
  
  try {
    const response = await fetch(`${SERVER_URL}/api/verify`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      userId = data.body.id;
      socket = io(SERVER_URL, {
        transports: ['websocket'],
        withCredentials: true
      });

      socket.emit('join', userId);
      return socket;
    }
    
    return null;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function emitPrivateMessage(data: { toId: string; message: string; timestamp: Date }) {
  socket?.emit('private_message', data);
}

export function emitTypingStart(toId: string) {
  socket?.emit('typing_start', { 
    fromId: userId, 
    toId: toId 
  });
}

export function emitTypingEnd(toId: string) {
  socket?.emit('typing_end', { 
    fromId: userId,
    toId: toId 
  });
}

export function getUserId(): string | null {
  return userId;
}