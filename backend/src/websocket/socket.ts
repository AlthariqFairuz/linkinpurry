import { Server } from 'socket.io';
import type { Server as HttpServer  } from 'http';
import { prisma } from '../db/connections.js';
import type { ChatMessage } from '../types/ChatMessage.js';


export function initializeWebSocket(httpServer: HttpServer) {
  // intinya ini tu:
  // 1. buat server socket.io yang terattach ke httpServer
  // 2. buat cors untuk FE
  // 3. buat path untuk socket.io (localhost:3000/socket.io/)
  // 4. buat transport untuk socket.io (websocket new gen browser dan polling for older browser)
  // anggap io itu sebagai sebuah gedung, dan socket itu sebagai orang yang masuk kedalam gedung
  
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    path: '/socket.io/', 
    transports: ['websocket'] 
  });

  // keep track user yang sedang online via socket.id dan typing status
  const activeUsers = new Map<string, string>();
  const typingTimeouts = new Map<string, NodeJS.Timeout>(); // NodeJS.Timeout intinya itu representasi dari built-in type yang merepresentasikan sebuah timeout object

  io.on('connection', (socket) => {

    // Handle user joining
    socket.on('join', (userId: string) => {
      try {
        // Update user status
        activeUsers.set(userId, socket.id);

        // Join user's own room for private messages
        socket.join(userId);

      } catch (error) {
        console.error('Error in join handler:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle private messages, we use Partial<ChatMessage> because when a socket message first arrives, it might not have all the information yet. J
    socket.on('private_message', async (data: Partial<ChatMessage>) => {
      try {
        console.log('Received message data:', data);
    
        // Find the fromId from activeUsers based on socket.id
        let fromId: string | undefined;
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            fromId = userId;
            break;
          }
        }
    
        if (!fromId || !data.toId || !data.message) {
          throw new Error('Invalid message data');
        }

        const trimmedMessage = data.message.trim();
        if (!trimmedMessage) {
          throw new Error('Message cannot be empty');
        }
    
        // Create complete message object
        const chatMessage = await prisma.chat.create({
          data: {
            fromId: BigInt(fromId),
            toId: BigInt(data.toId),
            message: trimmedMessage,
            timestamp: new Date(),
          }
        });

        const messagePayload = {
          fromId,
          toId: data.toId,
          message: trimmedMessage,
          timestamp: chatMessage.timestamp,
        };

        // Get recipient's socket info
        const recipientSocketId = activeUsers.get(data.toId);
        
        // Emit to recipient if online
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receive_message', messagePayload);
        }
        
        // Emit back to sender for confirmation
        socket.emit('message_sent', messagePayload);
    
      } catch (error) {
        socket.emit('error', { 
          message: 'Failed to send message',
          error: error instanceof Error ? error.message : 'Unknown error',
          data: data
        });
      }
    });

    // Update chat history endpoint to include read status
    socket.on('get_chat_history', async (conversationId: string) => {
      try {
        let userId: string | undefined;
        for (const [id, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            userId = id;
            break;
          }
        }

        if (!userId) {
          throw new Error('User not authenticated');
        }

        const messages = await prisma.chat.findMany({
          where: {
            OR: [
              { fromId: BigInt(userId), toId: BigInt(conversationId) },
              { fromId: BigInt(conversationId), toId: BigInt(userId) }
            ]
          },
          orderBy: {
            timestamp: 'asc'
          }
        });

        socket.emit('chat_history', {
          conversationId,
          messages: messages.map(msg => ({
            id: msg.id.toString(),
            fromId: msg.fromId.toString(),
            toId: msg.toId.toString(),
            message: msg.message,
            timestamp: msg.timestamp,
          }))
        });
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    // Handle typing indicators with debounce
    socket.on('typing_start', (data: { fromId: string, toId: string }) => {
      try {
        const { fromId, toId } = data;
        
        // Clear existing timeout if any
        const existingTimeout = typingTimeouts.get(fromId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Notify recipient
        const recipientSocketId = activeUsers.get(toId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('user_typing', { userId: fromId });
        }
        // Auto-clear typing status after 3 seconds
        const timeout = setTimeout(() => {
          const recipientSocketId = activeUsers.get(toId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit('user_stopped_typing', { userId: fromId });
          }
          typingTimeouts.delete(fromId);
        }, 3000);

        typingTimeouts.set(fromId, timeout);


      } catch (error) {
        console.error('Error handling typing indicator:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      try {
        // Find and remove user from active users
        for (const [userId, socketId] of activeUsers.entries()) {
          if (socketId === socket.id) {
            // Clear any existing typing timeouts
            const existingTimeout = typingTimeouts.get(userId);
            if (existingTimeout) {
              clearTimeout(existingTimeout);
              typingTimeouts.delete(userId);
            }

            // Remove user from active users
            activeUsers.delete(userId);

            // Notify other users about offline status
            socket.broadcast.emit('user_offline', userId);
            break;
          }
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
}