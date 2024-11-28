import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Search, Send } from "lucide-react"
import { ChatContact } from "@/types/ChatContact"
import { ChatMessage } from "@/types/ChatMessage"
import { Navbar } from "@/components/ui/navbar"
import Footer from "@/components/ui/footer"

export default function Chat() {
    const [message, setMessage] = useState("")
    const [searchMessage, setSearchMessage] = useState("")
    const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
    const [showMobileChat, setShowMobileChat] = useState(false)
  
    // dummy
    const contacts: ChatContact[] = [
      {
        id: 1,
        name: "Ruan Mei <3 Kartu XL",
        lastMessage: "Akuu otw yaaa",
        avatar: "/images/istri-gw.webp",
        unread: 2,
      },
      {
        id: 2,
        name: "Ayang Ruan Mei Telkomsel",
        lastMessage: "Alooo juga sayangkuuu, ga bobo???",
        avatar: "/images/istri-gw-juga.webp",
      },
    ]
  
    const messages: ChatMessage[] = [
      {
        id: 1,
        sender: "Ayang Ruan Mei Telkomsel",
        content: "Alooo sayangggg <333",
        timestamp: "10:43 PM",
        isMe: false,
      },
      {
        id: 2,
        sender: "Me",
        content: "Alooo juga sayangkuuu, ga bobo???",
        timestamp: "10:43 PM",
        isMe: true,
      },
    ]
  
    const handleSendMessage = () => {
      if (message.trim()) {
        setMessage("")
      }
    }
    const handleContactSelect = (contact: ChatContact) => {
        setSelectedContact(contact)
        setShowMobileChat(true) 
      }
    
      const handleBackToList = () => {
        setShowMobileChat(false)
      }
    
 
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
                    contact.lastMessage.toLowerCase().includes(searchMessage.toLowerCase())
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
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback>{contact.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium line-clamp-1">{contact.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread && (
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
                      onClick={handleBackToList}
                      className="md:hidden"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedContact.avatar} />
                      <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold line-clamp-1">{selectedContact.name}</h2>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`
                            flex flex-col
                            ${msg.isMe ? "items-end" : "items-start"}
                          `}
                        >
                          <div className={`
                            max-w-[70%] rounded-lg p-3
                            ${msg.isMe 
                              ? "bg-[#0a66c2] text-white" 
                              : "bg-[#f3f2ef] text-[#666666]"
                            }
                          `}>
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Write a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button 
                      variant="iconLight" 
                      size="icon" 
                      onClick={handleSendMessage}
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
      )
    }