import { useState, useEffect, useRef, useCallback } from 'react';
import { Post } from '@/types/Post';
import { DetailPost } from '@/components/ui/detailpost';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { User } from '@/types/User';


export function Feed({ currentUser }: {currentUser: User | null}) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  // Use a ref to track loading state without causing re-renders
  const isLoadingRef = useRef(false);
  const LIMIT = 10;

  // Update the ref whenever the loading state changes
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const fetchPosts = useCallback(async (cursor?: string) => {
    // Use the ref instead of the state to prevent concurrent fetches
    if (isLoadingRef.current) {
      console.log('Fetch prevented - already loading');
      return;
    }

    try {
      console.log('Fetching posts with cursor:', cursor);
      setIsLoading(true);
      isLoadingRef.current = true;
      setError(null);

      const url = new URL('http://localhost:3000/api/feed');
      url.searchParams.append('limit', LIMIT.toString());
      if (cursor) {
        url.searchParams.append('cursor', cursor);
      }

      console.log('Fetching from URL:', url.toString());

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Received posts:', {
          newPosts: data.body.length,
          firstId: data.body[0]?.id,
          lastId: data.body[data.body.length - 1]?.id
        });

        setPosts(prevPosts => {
          const newPosts = cursor 
            ? [...prevPosts, ...data.body]
            : data.body;
          
          console.log('Posts state updated:', {
            previousCount: prevPosts.length,
            newCount: newPosts.length
          });
          
          return newPosts;
        });
        
        setHasMore(data.body.length === LIMIT);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to load posts: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [toast]); 

  useEffect(() => {
    console.log('Initial load triggered');
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (!hasMore) {
      console.log('No more posts to load, skipping observer setup');
      return;
    }

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      console.log('Intersection observer triggered:', {
        isIntersecting: target.isIntersecting,
        hasMore,
        isLoading: isLoadingRef.current
      });

      if (target.isIntersecting && hasMore && !isLoadingRef.current) {
        const lastPost = posts[posts.length - 1];
        if (lastPost) {
          console.log('Loading more posts from ID:', lastPost.id);
          fetchPosts(lastPost.id);
        }
      }
    };

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
      console.log('Observer attached to target');
    }

    return () => {
      console.log('Cleaning up observer');
      observer.disconnect();
    };
  }, [posts, hasMore, fetchPosts]);

  const handleDelete = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feed/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        toast({
          title: "Success",
          description: "Post deleted successfully",
          variant: "success",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (postId: string, newContent: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feed/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, content: newContent }
              : post
          )
        );
        toast({
          title: "Success",
          description: "Post updated successfully",
          variant: "success",
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post: " + error.message,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        Error loading feed: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <DetailPost
          key={post.id}
          post={post}
          currentUser={currentUser}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}

      <div ref={observerTarget} className="h-4" />
      {isLoading && (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}
      {!hasMore && posts.length > 0 && (
        <div className="text-center text-muted-foreground p-4 text-gray-900">
          No more posts to load
        </div>
      )}
      {!hasMore && posts.length === 0 && (
        <div className="text-center text-muted-foreground p-4 text-gray-900">
          No posts yet
        </div>
      )}
    </div>
  );
}