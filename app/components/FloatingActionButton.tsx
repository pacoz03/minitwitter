'use client';

import Link from 'next/link';
import { Feather } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const FloatingActionButton = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Link
      href="/post"
      className={cn(
        'fixed bottom-20 right-4 h-14 w-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg',
        'md:hidden z-20 hover:bg-blue-500 transition-colors'
      )}
    >
      <Feather className="h-6 w-6" />
      <span className="sr-only">Create Post</span>
    </Link>
  );
};

export default FloatingActionButton;
