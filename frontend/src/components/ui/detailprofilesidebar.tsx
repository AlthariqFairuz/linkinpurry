import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Post } from '@/types/Post';

interface LatestPostSidebarProps {
  userId: string;
  isLoggedIn: boolean;
  profilePhotoPath: string;
  fullName: string;
}

const LatestPostSidebar = ({ userId, isLoggedIn, profilePhotoPath, fullName }: LatestPostSidebarProps) => {
  const [latestPost, setLatestPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLatestPost = async () => {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/api/latest-posts/${userId}`, {
          credentials: 'include'
        });

        const data = await response.json();

        if (data.success && data.body.length > 0) {
          setLatestPost(data.body[0]);
        }
      } catch (error) {
        setError('Failed to fetch latest post');
        toast({
          title: "Error",
          description: "Failed to load latest post" + error,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestPost();
  }, [userId, isLoggedIn, toast]);

  if (!isLoggedIn) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Latest Post</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please log in to view posts
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Latest Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Latest Post</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Latest Post</CardTitle>
      </CardHeader>
      <CardContent>
        {latestPost ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profilePhotoPath} alt={fullName} />
                <AvatarFallback>{fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(latestPost.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{latestPost.content}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No posts yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default LatestPostSidebar;