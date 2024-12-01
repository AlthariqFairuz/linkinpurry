import { useState } from "react";
import { Button } from "./button";
import { Card } from "./card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { MessageSquare, Send, Share2, MoreHorizontal, ThumbsUp } from "lucide-react";
import { Textarea } from "./textarea";
import { Separator } from "./separator";
import { format } from 'date-fns';
import { Post } from "@/types/Post";
import { UserData } from "@/types/UserData";
// Individual Post Component
export function DetailPost({ post, currentUser, onDelete, onEdit }: { post: Post, currentUser: UserData, onDelete: (postId: string) => void, onEdit: (postId: string, newContent: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleEdit = async () => {
        onEdit(post.id.toString(), editContent);
        setIsEditing(false);
    };
  
    return (
      <Card className="mb-4 p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.user.profilePhotoPath} />
              <AvatarFallback>{post.user.fullName?.[0] || 'User'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{post.user.fullName || 'LinkInPurry Member'}</h3>
              <p className="text-xs text-muted-foreground text-gray-500">
                {format(new Date(post.createdAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {currentUser?.id === post.userId.toString() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="iconLight" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
              <DropdownMenuItem 
                  onClick={() => setIsEditing(true)}
                  className="text-sm"
                >
                  <Button variant="edit" className="w-full justify-start">
                    Edit post
                  </Button>
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={() => onDelete(post.id)}
                  className="text-sm"
                >
                  <Button variant="edit" className="w-full justify-start text-red-600 hover:text-red-700">
                    Delete post
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
  
        <div className="mt-3">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-md"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-left">
                <p className={`text-sm leading-6 text-gray-900 whitespace-pre-wrap break-words text-left ${
                    isExpanded ? '' : 'line-clamp-5'
                }`}>
                    {post.content}
                </p>
                {post.content.length > 80 && (
                    <div className="text-left">
                        <button 
                            className="bg-transparent text-[#0a66c2] outline-none border-none text-sm font-medium p-0"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'See less' : 'See more...'}
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>
  
        <Separator className="my-4" />
  
        <div className="flex justify-between items-center">
        <Button 
          variant="postAction" 
          size="sm" 
          className="text-xs hover:bg-black/5"
        >
          <ThumbsUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Like</span>
        </Button>
        
        <Button 
          variant="postAction" 
          size="sm" 
          className="text-xs hover:bg-black/5"
        >
          <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Comment</span>
        </Button>
        
        <Button 
          variant="postAction" 
          size="sm" 
          className="text-xs hover:bg-black/5"
        >
          <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Share</span>
        </Button>
        
        <Button 
          variant="postAction" 
          size="sm" 
          className="text-xs hover:bg-black/5"
        >
          <Send className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Send</span>
        </Button>
      </div>

      </Card>
    );
  };
  