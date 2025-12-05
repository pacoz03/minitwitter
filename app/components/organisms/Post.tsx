'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PostHeader } from '../molecules/PostHeader';
import { PostActions } from '../molecules/PostActions';
import { PostOwnerActions } from '../molecules/PostOwnerActions';

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

  const handlePostClick = () => {
    router.push(`/post/${post.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle(post.id, post.is_liked);
  };

  const isOwner = currentUserId === post.user_id;

  return (
    <article
      className="relative p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5 transition-colors duration-200"
      onClick={handlePostClick}
    >
      <PostHeader user={post.users} createdAt={post.created_at} />
      
      {/* Content Section */}
      <div className="flex-1 min-w-0 pl-13 mt-1"> {/* pl-13 to align with avatar and gap */}
        {/* Body Text */}
        <div
          className="text-[15px] text-gray-100 whitespace-pre-wrap break-words leading-6"
          dangerouslySetInnerHTML={{ __html: formatContentHtml(post.content) }}
        />

        {/* Footer Actions */}
        <PostActions
          commentsCount={post.comments_count}
          likesCount={post.likes_count}
          isLiked={post.is_liked}
          onCommentClick={handlePostClick}
          onLikeClick={handleLikeClick}
        />
      </div>

      {/* Edit/Delete Actions (Solo se Owner) */}
      <PostOwnerActions
        post={post}
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </article>
  );
};

export default Post;
