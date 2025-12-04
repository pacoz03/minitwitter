'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Heart, MessageCircle, Trash2, Pencil, X } from 'lucide-react';

// Shadcn UI & Utilities
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

export interface PostType {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  users: {
    id: string;
    username: string;
    image?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
}

interface PostProps {
  post: PostType;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (post: PostType) => void;
  currentUserId?: string;
}

const formatContentHtml = (text: string) => {
  let formattedText = text;
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
  return formattedText;
};

const Post = ({ post, onLikeToggle, onDelete, onEdit, currentUserId }: PostProps) => {
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  // Format data
  let timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: false, locale: it });
  timeAgo = timeAgo.replace('circa ', ''); 

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle(post.id, post.is_liked);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(post);
  };

  const isOwner = currentUserId === post.user_id;

  return (
    <article 
      className="flex gap-3 p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5 transition-colors duration-200"
      onClick={handlePostClick}
    >
      {/* Avatar Section */}
      <div className="shrink-0">
        <Link href={`/user/${post.users.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-10 w-10 border border-gray-800">
            <AvatarImage src={post.users.image} alt={post.users.username} />
            <AvatarFallback className="bg-gray-800 text-gray-300 font-bold">
              {post.users.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[15px] leading-5 overflow-hidden">
            <Link 
              href={`/user/${post.users.username}`} 
              className="font-bold text-white hover:underline truncate" 
              onClick={(e) => e.stopPropagation()}
            >
              @{post.users.username}
            </Link>
            <span className="text-gray-500 shrink-0">·</span>
            <span className="text-gray-500 text-sm shrink-0">{timeAgo}</span>
          </div>
        </div>

        {/* Body Text */}
        <div 
          className="mt-1 text-[15px] text-gray-100 whitespace-pre-wrap break-words leading-6"
          dangerouslySetInnerHTML={{ __html: formatContentHtml(post.content) }}
        />

        {/* Footer Actions */}
        <div className="flex items-center mt-3 max-w-md">
           {/* Commenti */}
           <Button
            variant="ghost"
            size="sm"
            className="group flex items-center gap-2 px-1 hover:bg-transparent text-gray-500 hover:text-blue-400"
            onClick={handlePostClick}
          >
            <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
               <MessageCircle className="h-[18px] w-[18px]" />
            </div>
            <span className="text-xs font-medium">{post.comments_count > 0 && post.comments_count}</span>
          </Button>

          {/* Likes */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "group flex items-center gap-2 px-1 hover:bg-transparent text-gray-500 hover:text-pink-600",
              post.is_liked && "text-pink-600"
            )}
            onClick={handleLikeClick}
          >
            <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
              <Heart className={cn("h-[18px] w-[18px]", post.is_liked && "fill-current")} />
            </div>
            <span className="text-xs font-medium">{post.likes_count > 0 && post.likes_count}</span>
          </Button>
        </div>
      </div>

      {/* Edit/Delete Actions (Solo se Owner) */}
      <div className="flex flex-col gap-1">
        {isOwner && onEdit && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10"
            onClick={handleEditClick}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        
        {isOwner && onDelete && (
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                onClick={(e) => e.stopPropagation()} // Ferma la propagazione per non aprire il dettaglio post
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            
            <AlertDialogContent 
              className="border-gray-800 text-white max-w-[400px] p-6 rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsAlertOpen(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              >
                <X className="h-4 w-4 text-gray-400" />
                <span className="sr-only">Close</span>
              </button>

              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-bold">Elimina post</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400 mt-2">
                  Sei sicuro di voler eliminare questo post? Questa azione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-end">
                <AlertDialogCancel 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white rounded-md font-semibold"
                >
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(post.id);
                    setIsAlertOpen(false);
                  }}
                  className="bg-red-500/90 hover:bg-red-600 text-white border-0 rounded-md font-semibold"
                >
                  Elimina
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </article>
  );
};

export default Post;