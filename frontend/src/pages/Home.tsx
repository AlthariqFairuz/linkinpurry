import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Feed } from '@/components/ui/feed';
import { Sidebar } from '@/components/ui/sidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { User } from '@/types/User';
import { useToast } from "@/hooks/use-toast"
import LoadingComponent from '@/components/ui/loadingcomponent';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createPostText, setCreatePostText] = useState<string>('');

  const handleCreatePost = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          createPostText
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Create post success",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setCreatePostText('');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        // First get the user ID
        const id = await getUserId();
      
        // Then fetch the user details using the ID
        const user = await fetchUser(id);
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user details: " + error,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [toast, navigate]);
 
  const posts = [
    {
      id: 1,
    },
    {
      id: 2,
    }
  ];
  
  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-[68px]">
      <Navbar />

      {isLoading ? <LoadingComponent /> : (
        <main className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
            <ProfileCard 
              fullName={userData.fullName} 
              username={userData.username} 
              email={userData.email} 
              profilePhotoPath={userData.profilePhotoPath}
              connections={userData.connections}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow mb-4 p-4">
              <div className="flex gap-4">
                <ProfilePicture size="sm" src={userData.profilePhotoPath}/>
                <AlertDialog className="w-full">
                  <AlertDialogTrigger asChild>
                    <Button variant="bar" className="w-full sm:w-auto">Start a post</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[75%]">
                    <AlertDialogHeader className="text-black">
                      <AlertDialogDescription className="hidden"></AlertDialogDescription>
                      <div className="flex gap-x-4">
                        <ProfilePicture size="sm" src={userData.profilePhotoPath}/>
                        <AlertDialogTitle className="inline text-2xl md:text-3xl font-semibold text-gray-900 text-left ">
                          {userData.fullName} 
                        </AlertDialogTitle>
                        <AlertDialogCancel class="absolute right-2 sm:right-4 md:right-4 lg:right-6 bg-white border-none"
                          onClick={() => setCreatePostText('')}
                        >
                          <X/>
                        </AlertDialogCancel>
                      </div>
                    </AlertDialogHeader>

                    <div className="space-y-2">
                      <Textarea
                        value={createPostText}
                        onChange={(e) => setCreatePostText(e.target.value)}
                        maxlength="280"
                        placeholder="What do you want to talk about?"
                        className="h-[25vh] text-black"
                        style={{fontSize: "18px"}}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <AlertDialogAction
                        onClick={() => handleCreatePost()}
                        className="rounded-full"
                        disabled={createPostText==''}
                      >
                        Post
                      </AlertDialogAction>
                    </div>

                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {posts.map(post => (
              <Feed key={post.id} />
            ))}
          </div>

          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          </div>
        </main>
      )}
      <Footer />
    </div>

  );
}