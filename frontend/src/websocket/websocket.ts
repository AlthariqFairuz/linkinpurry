import { io, Socket } from 'socket.io-client';

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
        this.userId = data.body.id;  // Store the user ID
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

//   private setupBaseHandlers() {
//     if (!this.socket) return;

//     this.socket.on('connect', () => {
//       console.log('Connected to WebSocket server');
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('Connection error:', error);
//       toast({
//         title: "Connection Error",
//         description: "Failed to connect to chat service"
//       });
//     });

//     this.socket.on('disconnect', (reason) => {
//       console.log('Disconnected:', reason);
//       if (reason === 'io server disconnect') {
//         // Server disconnected us, try to reconnect
//         this.socket?.connect();
//       }
//     });
//   }

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

  public emitMarkMessagesRead(data: { conversationId: string; messageIds: string[] }) {
    this.socket?.emit('mark_messages_read', data);
  }

  public getUserId(): string | null {
    return this.userId;
  }
}

export default WebSocketService;