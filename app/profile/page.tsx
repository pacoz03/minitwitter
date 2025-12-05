'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getUserProfileStats, getUserPosts, getLikedPosts, getUserComments, toggleLike, deletePost, updatePost } from '@/lib/apiService';
import Post, { PostType } from '@/app/components/organisms/Post';
import { Button } from '@/components/ui/button';
import EditPostModal from '@/app/components/organisms/EditPostModal';
import CommentWithPost from '@/app/components/organisms/CommentWithPost';
import { EnrichedCommentType } from '@/app/components/organisms/Comment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserProfileCard from '@/app/components/organisms/UserProfileCard';
import { Pencil, LogOut } from 'lucide-react';
import TabButton from '@/app/components/atoms/TabButton';

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPosts, setLikedPosts] = useState<PostType[]>([]);
  const [userComments, setUserComments] = useState<EnrichedCommentType[]>([]);
  
  const [stats, setStats] = useState({ posts: 0, comments: 0, likes: 0 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'likes'>('posts');

  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const fetchInitialStats = useCallback(async () => {
    if (!user) return;
    try {
      const userStats = await getUserProfileStats(user.id);
      setStats(userStats);
    } catch (err) {
      console.error("Errore caricamento statistiche iniziali", err);
    }
  }, [user]);

  useEffect(() => {
    fetchInitialStats();
  }, [fetchInitialStats]);

  const fetchDataForTab = useCallback(async (tab: typeof activeTab) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (tab === 'posts') {
        const userPosts = await getUserPosts(user.id, user.id);
        setPosts(userPosts);
      } else if (tab === 'likes') {
        const userLikedPosts = await getLikedPosts(user.id, user.id);
        setLikedPosts(userLikedPosts);
      } else if (tab === 'comments') {
        const comments = await getUserComments(user.id, user.id);
        setUserComments(comments);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to fetch data for ${tab}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDataForTab(activeTab);
  }, [activeTab, fetchDataForTab]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    const updatePostLike = (p: PostType) => 
      p.id === postId ? { ...p, is_liked: !isLiked, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 } : p;
    
    // Optimistic updates
    setPosts(prev => prev.map(updatePostLike));
    setLikedPosts(prev => prev.map(updatePostLike));
    setUserComments(prev => prev.map(c => ({ ...c, post: updatePostLike(c.post) })));
    
    if (isLiked) {
      setLikedPosts(prev => prev.filter(p => p.id !== postId));
      setStats(prev => ({...prev, likes: prev.likes - 1}));
    } else {
        setStats(prev => ({...prev, likes: prev.likes + 1}));
    }

    try {
      await toggleLike(postId, isLiked);
    } catch (err) {
      setError('Failed to update like status');
      fetchDataForTab(activeTab); // Revert on error
      fetchInitialStats();
    }
  };

  const handleDeletePost = async (postId: string) => {
    const originalState = { posts, likedPosts, userComments, stats };
    setPosts(prev => prev.filter(p => p.id !== postId));
    setLikedPosts(prev => prev.filter(p => p.id !== postId));
    setUserComments(prev => prev.filter(c => c.post.id !== postId));
    setStats(prev => ({...prev, posts: prev.posts - 1}));

    try {
      await deletePost(postId);
    } catch (err) {
      setError('Failed to delete post');
      setPosts(originalState.posts);
      setLikedPosts(originalState.likedPosts);
      setUserComments(originalState.userComments);
      setStats(originalState.stats);
    }
  };

  const handleOpenEditModal = (post: PostType) => setEditingPost(post);
  const handleCloseEditModal = () => setEditingPost(null);

  const handleSavePost = async (postId: string, newContent: string) => {
    const originalPosts = [...posts];
    const updateContent = (p: PostType) => p.id === postId ? { ...p, content: newContent } : p;
    
    setPosts(prev => prev.map(updateContent));
    setLikedPosts(prev => prev.map(updateContent));
    setUserComments(prev => prev.map(c => ({...c, post: updateContent(c.post) })));
    handleCloseEditModal();

    try {
      await updatePost(postId, newContent);
    } catch (err) {
      setError('Failed to save post');
      setPosts(originalPosts);
    }
  };

  if (!user) {
    return <p className="p-4 text-center">Caricamento del profilo...</p>;
  }

  return (
    <div className="w-full max-w-2xl border-r border-gray-800 min-h-screen">
        <div className="sticky top-0 z-10 backdrop-blur-md p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Profilo</h1>
      </div>

      <div className="p-4 space-y-6">
        <UserProfileCard />
      </div>
      
      <div className="border-b border-gray-800 bg-[#020618]">
        <div className="flex">
            <TabButton isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} label="Post" count={stats.posts} />
            <TabButton isActive={activeTab === 'comments'} onClick={() => setActiveTab('comments')} label="Commenti" count={stats.comments} />
            <TabButton isActive={activeTab === 'likes'} onClick={() => setActiveTab('likes')} label="Mi piace" count={stats.likes} />
        </div>
      </div>

      <div className="min-h-[200px]">
        {loading && <div className="p-8 text-center text-gray-500 animate-pulse">Caricamento contenuti...</div>}
        {error && <div className="p-8 text-center text-red-400 bg-red-900/10 m-4 rounded">{error}</div>}
        
        {!loading && !error && activeTab === 'posts' && (
            posts.length > 0 ? (
                posts.map((post) => (
                    <Post key={post.id} post={post} onLikeToggle={handleLikeToggle} onDelete={handleDeletePost} onEdit={handleOpenEditModal} currentUserId={user?.id} />
                ))
            ) : <EmptyState message="Non hai ancora pubblicato nessun post." />
        )}

        {!loading && !error && activeTab === 'likes' && (
             likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                    <Post key={post.id} post={post} onLikeToggle={handleLikeToggle} onDelete={handleDeletePost} onEdit={handleOpenEditModal} currentUserId={user?.id} />
                ))
            ) : <EmptyState message="Non hai ancora messo mi piace a nessun post." />
        )}

        {!loading && !error && activeTab === 'comments' && (
            userComments.length > 0 ? (
                userComments.map((comment) => (
                    <CommentWithPost key={comment.id} enrichedComment={comment} onLikeToggle={handleLikeToggle} onDelete={handleDeletePost} onEdit={handleOpenEditModal} currentUserId={user?.id} />
                ))
            ) : <EmptyState message="Non hai ancora commentato nessun post." />
        )}
      </div>
      
      <EditPostModal post={editingPost} onClose={handleCloseEditModal} onSave={handleSavePost} />
    </div>
  );
};



import EmptyState from '@/app/components/molecules/EmptyState';

export default ProfilePage;