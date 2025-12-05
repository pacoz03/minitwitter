'use client';

import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import Post, { PostType } from '@/app/components/organisms/Post';
import { MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EnrichedCommentType } from '@/app/components/organisms/Comment';

interface CommentWithPostProps {
  enrichedComment: EnrichedCommentType;
  onLikeToggle: (postId: string, isLiked: boolean) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: PostType) => void;
  currentUserId?: string;
}

const CommentWithPost = ({ enrichedComment, onLikeToggle, onDelete, onEdit, currentUserId }: CommentWithPostProps) => {
  const timeAgo = formatDistanceToNow(new Date(enrichedComment.created_at), { addSuffix: true, locale: it });

  return (
    <div className="border-b border-gray-800 hover:bg-gray-900/20 transition-colors">
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
           <MessageCircle className="w-4 h-4" />
           <span className="font-medium">Hai commentato</span>
           <span>·</span>
           <span>{timeAgo}</span>
        </div>
        
        {/* Il tuo commento */}
        <p className="text-gray-200 text-[15px] mb-3 pl-6 border-l-2 border-gray-800">
            {enrichedComment.content}
        </p>
      </div>

      {/* Il post originale (Embedded) */}
      <div className="px-4 pb-4">
        <Card className="border border-gray-800 overflow-hidden rounded-xl shadow-none">
           <div className="opacity-90 hover:opacity-100 transition-opacity pointer-events-none [&_button]:pointer-events-auto [&_a]:pointer-events-auto">
             {/* Riutilizziamo il componente Post ma in un contesto "embedded" */}
             <Post 
                post={enrichedComment.post}
                onLikeToggle={onLikeToggle}
                onDelete={onDelete}
                onEdit={onEdit}
                currentUserId={currentUserId}
             />
           </div>
        </Card>
      </div>
    </div>
  );
};

export default CommentWithPost;