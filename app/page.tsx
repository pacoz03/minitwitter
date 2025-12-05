'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Heart, MessageCircle, Trash2, Pencil, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import { deletePost, getFeedPosts, toggleLike, updatePost } from '@/lib/apiService';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from './components/molecules/EmptyState';
import Post, { PostType } from '@/app/components/organisms/Post';
import EditPostModal from '@/app/components/organisms/EditPostModal';



export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Stati per la modale di modifica
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const enhancedPosts = await getFeedPosts(user?.id);
      setPosts(enhancedPosts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    // Optimistic update
    const originalPosts = [...posts];
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === postId
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.is_liked ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );

    try {
      await toggleLike(postId, isLiked);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Failed to ${isLiked ? 'unlike' : 'like'} post.`;
      setError(message);
      setPosts(originalPosts); // Revert on error
    }
  };


  const handleDeletePost = async (postId: string) => {
    // Aggiornamento ottimistico: rimuovi subito dalla lista
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await deletePost(postId);
    } catch (err) {
      setError('Impossibile eliminare il post.');
      setPosts(originalPosts); // Revert in caso di errore
    }
  };

  const handleOpenEditModal = (post: PostType) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditingPost(null);
    setIsEditModalOpen(false);
  };

  const handleSavePost = async (postId: string, newContent: string) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
    handleCloseEditModal();

    try {
      await updatePost(postId, newContent);
    } catch (err) {
      setError('Impossibile salvare le modifiche.');
      setPosts(originalPosts); // Revert
    }
  };

  return (
    <div className="w-full max-w-2xl border-r border-gray-800 min-h-screen relative">
      <div className="sticky top-0 z-10 backdrop-blur-md p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Il tuo Feed</h1>
      </div>
      
      <div>
        {loading && (
          <div className="space-y-4 p-4">
             {/* Skeleton Loading State */}
            {[...Array(3)].map((_, i) => (
               <div key={i} className="flex space-x-4">
                 <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
                 <div className="space-y-2 flex-1">
                   <Skeleton className="h-4 w-[200px] bg-gray-800" />
                   <Skeleton className="h-4 w-full bg-gray-800" />
                   <Skeleton className="h-4 w-[80%] bg-gray-800" />
                 </div>
               </div>
            ))}
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
             <p className="text-red-500 mb-2">Qualcosa è andato storto</p>
             <p className="text-sm text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <EmptyState 
              message="Nessun post da mostrare."
              description="Segui qualcuno o scrivi il tuo primo post!"
          />        )}

        {!loading && !error && posts.map((post) => (
           <Post 
             key={post.id} 
             post={post} 
             onLikeToggle={handleLikeToggle} 
             currentUserId={user?.id}
             onDelete={handleDeletePost} 
             onEdit={handleOpenEditModal} 
           />
        ))}
      </div>

      {/* Modale di Modifica */}
      <EditPostModal 
        post={editingPost}
        onClose={handleCloseEditModal}
        onSave={handleSavePost}
      />
    </div>
  );
}
