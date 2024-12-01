import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { Post } from '@/types/Post';

interface LatestPostSidebarProps {
  userId: string;
  isLoggedIn: boolean;
  profilePhotoPath: string;
  fullName: string;
  latestPost: Post | null;
}

const LatestPostSidebar = ({ isLoggedIn, profilePhotoPath, fullName, latestPost }: LatestPostSidebarProps) => {


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