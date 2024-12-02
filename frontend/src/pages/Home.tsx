import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/ui/footer';
import { ProfileCard } from '@/components/ui/profilecard';
import { Feed } from '@/components/ui/feed';
import { RightSidebar } from '@/components/ui/rightsidebar';
import { Navbar } from '@/components/ui/navbar';
import { ProfilePicture } from '@/components/ui/profilephoto';
import { getUserId } from '@/api/getUserId';
import { fetchUser } from '@/api/fetchUser';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast"
import LoadingComponent from '@/components/ui/loadingcomponent';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createPostText, setCreatePostText] = useState('');

  const handleCreatePost = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3000/api/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: createPostText 
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        
        toast({
          title: "Success",
          description: "Post created successfully",
          variant: "success",
        });
        setCreatePostText('');
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const id = await getUserId();
        const user = await fetchUser(id);
        if (user) {
          setUserData(user);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch user details " + error,
          variant: "destructive",
        });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);
  
  return (
    <div className="min-h-screen bg-[#f3f2ef] pb-[68px]">
      <Navbar />

      {isLoading ? <LoadingComponent /> : (
         <main className="pt-20 pb-16">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-4">
           {/* Left Sidebar */}
           <div className="md:col-span-3 space-y-4">
             <ProfileCard 
               fullName={userData?.fullName} 
               username={userData?.username} 
               email={userData?.email} 
               profilePhotoPath={userData?.profilePhotoPath}
               connections={userData?.connections}
             />
           </div>
 
           {/* Main Feed */}
           <div className="md:col-span-6 space-y-4">
             {/* Create Post Card */}
             <div className="bg-white rounded-lg shadow p-4">
               <div className="flex gap-3 items-center">
                 <ProfilePicture size="sm" src={userData?.profilePhotoPath} />
                 <AlertDialog>
                   <AlertDialogTrigger asChild>
                     <Button 
                       variant="outline" 
                       className="w-full text-left justify-start text-muted-foreground h-12 text-gray-500"
                     >
                       Start a post
                     </Button>
                   </AlertDialogTrigger>
                   <AlertDialogContent className="sm:max-w-[425px]">
                     <AlertDialogHeader>
                       <AlertDialogTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
                         Create a post
                         <AlertDialogCancel className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full">
                           <X className="h-4 w-4" />
                         </AlertDialogCancel>
                       </AlertDialogTitle>
                       <div className="flex items-center gap-2 pt-2">
                         <ProfilePicture size="sm" src={userData?.profilePhotoPath} />
                         <span className="font-semibold text-gray-900">{userData?.fullName}</span>
                       </div>
                     </AlertDialogHeader>
 
                     <Textarea
                       value={createPostText}
                       onChange={(e) => setCreatePostText(e.target.value)}
                       placeholder="What do you want to talk about? (Max 280 characters)"
                       className="min-h-[150px] my-4 text-gray-900"
                     />
 
                     <div className="flex justify-end">
                       <AlertDialogAction
                         onClick={handleCreatePost}
                         disabled={!createPostText.trim()}
                       >
                         Post
                       </AlertDialogAction>
                     </div>
                   </AlertDialogContent>
                 </AlertDialog>
               </div>
             </div>
 
             {/* Feed Component */}
             {isLoading ? <LoadingComponent /> : (<Feed currentUser={userData} />)}
           </div>
 
           {/* Right Sidebar */}
           <div className="md:col-span-3">
             <RightSidebar />
           </div>
         </div>
       </main>
      )}
      <Footer />
    </div>
  );
}