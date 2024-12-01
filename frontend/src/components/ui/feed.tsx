import { useState, useEffect, useCallback } from 'react';
import { DetailPost } from "@/components/ui/detailpost";
import { UserData } from '@/types/UserData';
import { Post } from '@/types/Post';

// Main Feed Component
export function Feed({ currentUser }: { currentUser: UserData }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastPostId, setLastPostId] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      // Instead of manually appending parameters, we can use template literals
      // This is cleaner and more readable
      const response = await fetch(
        `http://localhost:3000/api/feed?limit=10${lastPostId?`&cursor=${lastPostId}` : ''}`, 
        {
          credentials: 'include'
        }
      );
      const data = await response.json();
  
      if (data.success) {
        const newPosts = data.body;
        // Use functional update to ensure we don't miss any updates
        setPosts(prevPosts => {
          // Create a Map to deduplicate posts based on ID
          const uniquePosts = new Map([
            ...prevPosts.map((post : Post) => [post.id, post]),
            ...newPosts.map((post : Post) => [post.id, post])
          ]);
          return Array.from(uniquePosts.values());
        });
        
        setHasMore(newPosts.length === 10);
        if (newPosts.length > 0) {
          setLastPostId(newPosts[newPosts.length - 1].id);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch posts: ' + err);
    } finally {
      setLoading(false);
    }
  }, [lastPostId]);

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      if (hasMore && !loading && lastPostId) {
        fetchPosts();
      }
    }
  }, [hasMore, loading, lastPostId, fetchPosts]);

  // Effect for fetching posts
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); 

  // Effect for scroll listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleDelete = async (postId : string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/feed/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
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
        credentials: 'include'
      });
      
      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, content: newContent } : post
        ));
      }
    } catch (err) {
      console.error('Failed to edit post:', err);
    }
  };

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        {error}
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {posts.map(post => (
        <DetailPost
          key={post.id}
          post={post}
          currentUser={currentUser}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}
      {loading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}
    </div>
  );
};