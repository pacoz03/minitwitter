'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { PostType } from '@/app/components/organisms/Post';

export interface CommentType {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user?: { 
    id: string;
    username: string;
    image?: string;
  };
}

export interface EnrichedCommentType extends CommentType {
  post: PostType;
}

interface CommentProps {
  comment: CommentType;
}

const formatContentHtml = (text: string) => {
  let formattedText = text;
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
  return formattedText;
};

const Comment = ({ comment }: CommentProps) => {
  // Calcolo tempo
  let timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: false, locale: it });
  timeAgo = timeAgo.replace('circa ', ''); // Pulizia stringa

  const username = comment.user?.username || 'Utente sconosciuto';
  const initial = username.charAt(0).toUpperCase();

  return (
    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Avatar User */}
      <Link href={`/user/${username}`} className="shrink-0 mt-1">
        <Avatar className="h-8 w-8 border border-gray-700">
            <AvatarImage src={comment.user?.image} />
            <AvatarFallback className="bg-gray-700 text-xs font-bold text-gray-300">
                {initial}
            </AvatarFallback>
        </Avatar>
      </Link>

      {/* Comment Body - Stile "Card" scura */}
      <Card className="flex-1 bg-gray-800/40 border-gray-800/50 p-3 rounded-xl rounded-tl-none">
        <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-center gap-2">
                <Link href={`/user/${username}`} className="font-bold text-sm text-gray-200 hover:underline">
                    {username}
                </Link>
                <span className="text-xs text-gray-500">{timeAgo} fa</span>
            </div>
        </div>
        
        <div 
          className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed wrap-break-word"
          dangerouslySetInnerHTML={{ __html: formatContentHtml(comment.content) }}
        />
        
        {/* Placeholder per azioni future sui commenti (like, reply) */}
        <div className="mt-2 flex gap-4">
             {/* Esempio icona like commento (statica per ora) */}
             <button className="text-gray-600 hover:text-pink-500 transition-colors">
                <Heart className="h-3 w-3" />
             </button>
        </div>
      </Card>
    </div>
  );
};

export default Comment;