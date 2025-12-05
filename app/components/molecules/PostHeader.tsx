'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PostType } from '@/app/components/organisms/Post';

interface PostHeaderProps {
  user: PostType['users'];
  createdAt: string;
}

export const PostHeader = ({ user, createdAt }: PostHeaderProps) => {
  let timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: false, locale: it });
  timeAgo = timeAgo.replace('circa ', '');

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar Section */}
        <Link href={`/user/${user.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar className="h-10 w-10 border border-gray-800">
            <AvatarImage src={user.image} alt={user.username} />
            <AvatarFallback className="bg-gray-800 text-gray-300 font-bold">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        {/* User Info */}
        <div className="flex items-center gap-1 text-[15px] leading-5 overflow-hidden">
          <Link
            href={`/user/${user.username}`}
            className="font-bold text-white hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            @{user.username}
          </Link>
          <span className="text-gray-500 shrink-0">·</span>
          <span className="text-gray-500 text-sm shrink-0">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
};
