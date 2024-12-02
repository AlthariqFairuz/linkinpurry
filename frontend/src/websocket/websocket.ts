import { io, Socket } from 'socket.io-client';


// here we are using singleton pattern to ensure that there is only one instance of the WebSocketService
class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket ;
  private userId: string;
  private readonly SERVER_URL = 'http://localhost:3000';

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async initialize(): Promise<Socket | null> {
     try {
      const response = await fetch(`${this.SERVER_URL}/api/verify`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        this.userId = data.body.id; 
        this.socket = io(this.SERVER_URL, {
          transports: ['websocket'],
          withCredentials: true
        });

        this.socket.emit('join', this.userId);
        return this.socket;
      }
      
      return null;
    } catch (error) {
      console.error('Socket initialization error:', error);
      return null;
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Helper methods for common socket operations
  public emitPrivateMessage(data: { toId: string; message: string; timestamp: Date }) {
    this.socket?.emit('private_message', data);
  }

  public emitTypingStart(toId: string) {
    this.socket?.emit('typing_start', { toId });
  }

  public emitTypingEnd(toId: string) {
    this.socket?.emit('typing_end', { toId });
  }

  public getUserId(): string | null {
    return this.userId;
  }
}

export default WebSocketService;