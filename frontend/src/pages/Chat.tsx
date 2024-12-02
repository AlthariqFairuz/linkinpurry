import { useEffect, useRef, useState, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft,Search, Send } from "lucide-react"
import { ChatContact } from "@/types/ChatContact"
import { ChatMessage } from "@/types/ChatMessage"
import { Navbar } from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"
import { toast } from "@/hooks/use-toast"
import WebSocketService from "@/websocket/websocket"
import { Socket } from "socket.io-client"
import { ChatHistoryMessage } from "@/types/ChatHistoryMessage"
import { MessageData } from "@/types/MessageData"
import { UserData } from "@/types/UserData"

export default function Chat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [searchMessage, setSearchMessage] = useState("")
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const wsService = useRef<WebSocketService>(WebSocketService.getInstance())
  const [socket, setSocket] = useState<Socket | null>(null)


  // Setup socket listeners as a callback to prevent recreation
  const setupSocketListeners = useCallback((socket: Socket) => {
    
    socket.on('receive_message', (data: MessageData) => {
      const currentUserId = wsService.current.getUserId();
      const newMessage: ChatMessage = {
        id: data.id,
        fromId: data.fromId,
        toId: data.toId,
        sender: data.fromId === currentUserId ? 'Me' : selectedContact?.name || 'LinkedInPurry Member',
        content: data.message,
        timestamp: new Date(data.timestamp).toLocaleTimeString(),
        isMe: data.fromId === currentUserId,  // Check against actual user ID
      }
      
      setMessages(prev => [...prev, newMessage])
      
      if (selectedContact && !document.hidden && socket) {
        // Handle read status directly here
        const messageId = data.id;
        socket.emit('mark_messages_read', {
          conversationId: selectedContact.id.toString(),
          messageIds: [messageId]
        });
  
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === messageId
              ? { ...msg, read: true, readAt: new Date() }
              : msg
          )
        );
      }
      setContacts(prev => prev.map(contact => {
        if (contact.id.toString() === data.fromId) {
          return {
            ...contact,
            lastMessage: data.message,
            unread: document.hidden ? (contact.unread || 0) + 1 : 0
          }
        }
        return contact
      }))
    })

    socket.on('user_typing', ({ userId }: { userId: string }) => {
      if (selectedContact?.id.toString() === userId) {
        setIsTyping(true)
      }
    })

    socket.on('user_stopped_typing', ({ userId }: { userId: string }) => {
      if (selectedContact?.id.toString() === userId) {
        setIsTyping(false)
      }
    })
  }, [selectedContact])

  // Initialize WebSocket and load contacts
  useEffect(() => {
    let currentSocket: Socket | null = null;

    const initializeChat = async () => {
      const socketInstance = await wsService.current.initialize()
      if (socketInstance) {
        currentSocket = socketInstance;
        setSocket(socketInstance)
        setupSocketListeners(socketInstance)
        await loadContacts()
      }
    }

    initializeChat()

    return () => {
      if (currentSocket) {
        currentSocket.disconnect()
      }
    }
  }, [setupSocketListeners])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const loadContacts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/network/connected', {
        credentials: 'include'
      })
      const data = await response.json()

      if (data.success) {
        const formattedContacts = data.body.connection.map((user: UserData) => ({
          id: parseInt(user.id),
          name: user.fullName,
          avatar: user.profilePhotoPath,
          lastMessage: "",
          unread: 0,
          online: false,
          lastActive: null
        }))
        setContacts(formattedContacts)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
      toast({
        title: "Error",
        description: "Failed to load contacts"
      })
    }
  }

  // Handle sending messages
  const handleSendMessage = () => {
    if (!message.trim() || !socket || !selectedContact) return

    const messageData = {
      toId: selectedContact.id.toString(),
      message: message.trim(),
      timestamp: new Date()
    }

    wsService.current.emitPrivateMessage(messageData)

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Me',
      content: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
      isMe: true,
    }
    
    setMessages(prev => [...prev, newMessage])
    setMessage('')
  }

  // Handle typing indicator with debounce
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    
    if (!socket || !selectedContact) return

    wsService.current.emitTypingStart(selectedContact.id.toString())
    
    // Debounce typing end
    setTimeout(() => {
      wsService.current.emitTypingEnd(selectedContact.id.toString())
    }, 1000)
  }

  // Handle contact selection and load chat history
  const handleContactSelect = async (contact: ChatContact) => {
    setSelectedContact(contact)
    setShowMobileChat(true)
    
    // Update the URL to include the selected user's ID
    window.history.pushState({}, '', `/chat/${contact.id}`)
  
    try {
      const response = await fetch(
        `http://localhost:3000/api/chat/history/${contact.id}`,
        { credentials: 'include' }
      )
      const data = await response.json()
      
      if (data.success) {
        const currentUserId = wsService.current.getUserId();
        
        const formattedMessages = data.body.messages.map((msg: ChatHistoryMessage) => ({
          id: msg.id,
          fromId: msg.fromId,
          toId: msg.toId,
          sender: msg.fromId === currentUserId ? 'Me' : contact.name,
          content: msg.message,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
          isMe: msg.fromId === currentUserId, 
        }))
        setMessages(formattedMessages)
  
        // Reset unread count
        setContacts(prev => prev.map(c => 
          c.id === contact.id ? { ...c, unread: 0 } : c
        ))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat history" + error,
        variant: "destructive"
      })
    }
  }

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`
        max-w-[70%] rounded-lg px-4 py-2
        ${message.isMe ? 'bg-[#0a66c2] text-white' : 'bg-[#f3f2ef] text-[#666666]'}
      `}>
        <p>{message.content}</p>
        <p className="text-xs opacity-70">{message.timestamp}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar - Hidden on mobile when in chat view */}
      <div className={showMobileChat ? "hidden md:block" : "block"}>
        <Navbar />
      </div>

      {/* Main Content */}
      <main className={`
        flex-1 flex flex-col md:flex-row
        px-0 md:px-4 pb-16 md:pb-20
        ${showMobileChat ? "pt-0 md:pt-20" : "pt-16 md:pt-20"}
      `}>
        {/* Contact List */}
        <Card className={`
          md:w-80 border-0 md:border rounded-none md:rounded-lg
          h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)]
          ${showMobileChat ? "hidden md:block" : "block"}
        `}>
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Messaging</h2>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search messages..."
                value={searchMessage}
                onChange={(e) => setSearchMessage(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Separator />
          <ScrollArea className="h-[calc(100vh-12rem)] md:h-[calc(100vh-16rem)]">
            {contacts
              .filter((contact) =>
                contact.name.toLowerCase().includes(searchMessage.toLowerCase()) ||
                (contact.lastMessage || "").toLowerCase().includes(searchMessage.toLowerCase())
              )
              .map((contact) => (
                <Button
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  variant="iconLight"
                  className={`
                    w-full justify-start gap-3 p-4 h-auto
                    ${selectedContact?.id === contact.id ? "bg-[#0a66c2] text-white" : ""}
                  `}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>{contact.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium line-clamp-1">{contact.name}</p>
                    <p className={`text-sm line-clamp-1 ${selectedContact?.id === contact.id ? "text-white/80" : "text-muted-foreground"}`}>
                      {contact.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {contact.unread > 0 && (
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {contact.unread}
                    </div>
                  )}
                </Button>
              ))}
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className={`
          flex-1 flex flex-col md:ml-4
          border-0 md:border rounded-none md:rounded-lg
          h-screen md:h-[calc(100vh-8rem)]
          ${!showMobileChat ? "hidden md:flex" : "flex"}
        `}>
          {selectedContact ? (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <Button
                  variant="iconLight"
                  size="icon"
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h2 className="text-xl font-semibold line-clamp-1">{selectedContact.name}</h2>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-sm text-gray-500">Typing...</span>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="Write a message..."
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  variant="iconLight" 
                  size="icon" 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !socket}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </main>

      {/* Footer - Hidden on mobile when in chat view */}
      <div className={showMobileChat ? "hidden md:block" : "block"}>
        <Footer />
      </div>
    </div>
  );
}