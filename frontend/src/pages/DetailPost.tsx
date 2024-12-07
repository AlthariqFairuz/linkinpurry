import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DetailPost } from "@/components/ui/detailpost";
import { Post } from "@/types/Post";
import { UserData } from "@/types/UserData";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import LoadingComponent from "@/components/ui/loadingcomponent";

export default function DetailPostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [currentUser, setCurrentUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!postId) {
                console.error('No postId provided');
                toast({
                    title: "Error",
                    description: "Invalid post ID"
                });
                navigate('/feed');
                return;
            }
            try {
                console.log('Fetching post:', postId);
                const userResponse = await fetch('http://localhost:3000/api/verify', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                
                if (!userData.success) {
                    navigate('/login');
                    return;
                }
                setCurrentUser(userData.body);
      
                const postResponse = await fetch(`http://localhost:3000/api/feed/${postId}`, {
                    credentials: 'include'
                });
                const postData = await postResponse.json();
                
                if (!postData.success) {
                    toast({
                        title: "Error",
                        description: "Failed to load post",
                        variant: "destructive"
                    });
                    navigate('/feed');
                    return;
                }
                setPost(postData.body);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: "Error",
                    description: "Something went wrong",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [postId, navigate]);

    
    const handleDelete = async (postId: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/feed/${postId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Post deleted successfully",
                    variant: "success"
                });
                navigate('/feed');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast({
                title: "Error",
                description: "Failed to delete post",
                variant: "destructive"
            });
        }
    };

    
    const handleEdit = async (postId: string, newContent: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/feed/${postId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newContent })
            });
            const data = await response.json();

            if (data.success) {
                setPost(prev => prev ? { ...prev, content: newContent } : null);
                toast({
                    title: "Success",
                    description: "Post updated successfully",
                    variant: "success"
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error updating post:', error);
            toast({
                title: "Error",
                description: "Failed to update post",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f3f2ef] pt-16">
            <Navbar />
            
            <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
                {isLoading ? (
                    <LoadingComponent/>
                ) : post && currentUser ? (
                    <DetailPost 
                        key={post.id}
                        post={post}
                        currentUser={currentUser}   
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Post not found</p>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}