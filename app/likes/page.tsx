'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PostType } from '@/app/components/organisms/Post';
import Post from '@/app/components/organisms/Post';
import EditPostModal from '@/app/components/organisms/EditPostModal';
import { getLikedPosts, toggleLike, deletePost, updatePost } from '@/lib/apiService';
import EmptyState from '@/app/components/molecules/EmptyState';

const LikesPage = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const fetchLikedPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const posts = await getLikedPosts(user.id, user.id);
      setLikedPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch liked posts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchLikedPosts();
    }
  }, [isAuthenticated, user, fetchLikedPosts]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    // In this page, unliking a post should remove it from the list.
    const originalPosts = [...likedPosts];
    setLikedPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await toggleLike(postId, isLiked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update like status');
      setLikedPosts(originalPosts); // Revert on error
    }
  };

  const handleDeletePost = async (postId: string) => {
    const originalPosts = [...likedPosts];
    setLikedPosts(prev => prev.filter(p => p.id !== postId));
    try {
      await deletePost(postId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
      setLikedPosts(originalPosts);
    }
  };

  const handleOpenEditModal = (post: PostType) => {
    setEditingPost(post);
  };

  const handleCloseEditModal = () => {
    setEditingPost(null);
  };

  const handleSavePost = async (postId: string, newContent: string) => {
    const originalPosts = [...likedPosts];
    setLikedPosts(prev => 
        prev.map(p => p.id === postId ? { ...p, content: newContent } : p)
    );
    handleCloseEditModal();

    try {
      await updatePost(postId, newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
      setLikedPosts(originalPosts);
    }
  };

  return (
    <div className="w-full max-w-2xl border-l border-r border-gray-800 min-h-screen">
       <div className="sticky top-0 z-10 backdrop-blur-md p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Il tuo Mi piace</h1>
      </div>
      

      <div>
        {loading && <p className="p-8 text-center text-gray-500 animate-pulse">Caricamento...</p>}
        {error && <p className="p-8 text-center text-red-500">{error}</p>}
        
        {!loading && !error && likedPosts.length === 0 && (
          <EmptyState message="Non hai ancora messo mi piace a nessun post." />
        )}

        {!loading && !error && likedPosts.map((post) => (
            <Post 
                key={post.id}
                post={post} 
                onLikeToggle={handleLikeToggle} 
                onDelete={handleDeletePost}
                onEdit={handleOpenEditModal}
                currentUserId={user?.id}
            />
        ))}
      </div>

      <EditPostModal 
        post={editingPost}
        onClose={handleCloseEditModal}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default LikesPage;

