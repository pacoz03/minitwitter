'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { findUserByUsername, getUserProfileStats, getUserPosts, toggleLike, deletePost, updatePost } from '@/lib/apiService';
import Post, { PostType } from '@/app/components/Post';
import EditPostModal from '@/app/components/EditPostModal';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  created_at?: string;
}

const UserProfilePage = ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = use(params);
  
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [stats, setStats] = useState({ posts: 0, comments: 0, likes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPost, setEditingPost] = useState<PostType | null>(null);

  const fetchData = useCallback(async (user: User) => {
    try {
        setLoading(true);
        const [userStats, userPosts] = await Promise.all([
            getUserProfileStats(user.id),
            getUserPosts(user.id, currentUser?.id),
        ]);
        
        setStats(userStats);
        setPosts(userPosts);
        
    } catch (err) {
        setError('Errore durante il caricamento dei dati del profilo.');
    } finally {
        setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userFound = await findUserByUsername(username);
        
        if (!userFound) {
          setError('Utente non trovato.');
          return;
        }
        setProfileUser(userFound);
        fetchData(userFound);

      } catch (err) {
        setError('Errore durante il caricamento del profilo.' + err);
      }
    };

    fetchUser();
  }, [username, fetchData]);

  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
     const originalPosts = [...posts];
     setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, is_liked: !isLiked, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 } : p
     ));

     try {
        await toggleLike(postId, isLiked);
     } catch (err) {
        setPosts(originalPosts);
     }
  };

  const handleDeletePost = async (postId: string) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.filter(p => p.id !== postId));
    setStats(prev => ({ ...prev, posts: prev.posts - 1 }));

    try {
      await deletePost(postId);
    } catch (err) {
      setPosts(originalPosts);
      setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
    }
  };

  const handleOpenEditModal = (post: PostType) => setEditingPost(post);
  const handleCloseEditModal = () => setEditingPost(null);

  const handleSavePost = async (postId: string, newContent: string) => {
    const originalPosts = [...posts];
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
    handleCloseEditModal();

    try {
      await updatePost(postId, newContent);
    } catch (err) {
      setPosts(originalPosts);
    }
  };

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-500">
            <p className="text-xl mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">Torna indietro</Button>
        </div>
    );
  }

  if (!profileUser) {
    return <p className="p-8 text-center text-gray-500 animate-pulse">Ricerca profilo...</p>;
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const joinedDate = profileUser.created_at 
    ? format(new Date(profileUser.created_at), 'MMMM yyyy', { locale: it }) 
    : 'novembre 2025';

  return (
    <div className="w-full max-w-2xl border-r border-gray-800 min-h-screen ">
      {/* 1. Header Sticky */}
      <div className="sticky top-0 z-10  backdrop-blur-sm px-4 py-2 border-b border-gray-800 flex items-center gap-6">
        <button onClick={() => router.back()} className="hover:bg-gray-800 rounded-full p-2 transition-colors">
            <ArrowLeft className="text-white h-5 w-5" />
        </button>
        <div className="flex flex-col">
            <h1 className="text-xl font-bold text-white leading-tight">{profileUser.username}</h1>
            <span className="text-xs text-gray-500">{stats.posts} post</span>
        </div>
      </div>

      {/* 2. Sezione Info Profilo */}
      <div className="flex flex-col items-center pt-10 pb-6 px-4">
          <Avatar className="h-28 w-28 mb-3 border-4 ring-1 ring-gray-800">
             <AvatarImage/>
             <AvatarFallback className="bg-gray-800 text-3xl font-bold text-gray-300">
                 {profileUser.username.charAt(0).toUpperCase()}
             </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-extrabold text-white mb-1">{profileUser.username}</h2>
          <p className="text-gray-500">@{profileUser.username}</p>

          {profileUser.bio && (
             <p className="text-gray-300 mt-3 text-center max-w-md text-[15px] leading-relaxed">
                 {profileUser.bio}
             </p>
          )}

          <div className="flex items-center gap-2 mt-4 text-gray-500 text-sm">
             <span className="text-gray-500">Si è unito il {joinedDate}</span>
          </div>

          <div className="flex gap-12 mt-6">
             <div className="flex flex-col items-center">
                 <span className="text-lg font-bold text-white">{stats.posts}</span>
                 <span className="text-xs text-gray-500">Post</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-lg font-bold text-white">{stats.comments}</span>
                 <span className="text-xs text-gray-500">Commenti</span>
             </div>
             <div className="flex flex-col items-center">
                 <span className="text-lg font-bold text-white">{stats.likes}</span>
                 <span className="text-xs text-gray-500">Mi piace</span>
             </div>
          </div>
      </div>

      <div className="py-4 text-center border-b border-gray-800/50">
         <span className="text-sm font-medium text-gray-400">
            Post ({stats.posts})
         </span>
      </div>

      <div className="min-h-[200px]">
        {loading ? (
             <div className="p-8 text-center text-gray-500 animate-pulse">
                Caricamento...
             </div>
        ) : (
            posts.length > 0 ? posts.map(post => (
                <Post 
                    key={post.id} 
                    post={post} 
                    onLikeToggle={handleLikeToggle} 
                    currentUserId={currentUser?.id} 
                    onDelete={isOwnProfile ? handleDeletePost : undefined}
                    onEdit={isOwnProfile ? handleOpenEditModal : undefined}
                />
            )) : (
                <div className="py-12 px-4 text-center">
                    <p className="text-gray-500 text-sm">@{profileUser.username} non ha ancora pubblicato post.</p>
                </div>
            )
        )}
      </div>

      {isOwnProfile && editingPost && (
        <EditPostModal 
            post={editingPost}
            onClose={handleCloseEditModal}
            onSave={handleSavePost}
        />
      )}
    </div>
  );
};

export default UserProfilePage;