'use client';

import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostActionsProps {
  commentsCount: number;
  likesCount: number;
  isLiked: boolean;
  onCommentClick: () => void;
  onLikeClick: (e: React.MouseEvent) => void;
}

export const PostActions = ({
  commentsCount,
  likesCount,
  isLiked,
  onCommentClick,
  onLikeClick,
}: PostActionsProps) => {
  return (
    <div className="flex items-center mt-3 max-w-md">
      {/* Commenti */}
      <Button
        variant="ghost"
        size="sm"
        className="group flex items-center gap-2 px-1 hover:bg-transparent text-gray-500 hover:text-blue-400"
        onClick={onCommentClick}
      >
        <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
          <MessageCircle className="h-[18px] w-[18px]" />
        </div>
        <span className="text-xs font-medium">{commentsCount > 0 && commentsCount}</span>
      </Button>

      {/* Likes */}
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'group flex items-center gap-2 px-1 hover:bg-transparent text-gray-500 hover:text-pink-600',
          isLiked && 'text-pink-600'
        )}
        onClick={onLikeClick}
      >
        <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
          <Heart className={cn('h-[18px] w-[18px]', isLiked && 'fill-current')} />
        </div>
        <span className="text-xs font-medium">{likesCount > 0 && likesCount}</span>
      </Button>
    </div>
  );
};
