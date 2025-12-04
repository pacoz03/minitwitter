'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, User, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const authenticatedItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/likes', label: 'Likes', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const unauthenticatedItems = [
    { href: '/login', label: 'Accedi', icon: LogIn },
    { href: '/signup', label: 'Crea account', icon: UserPlus },
  ];

  const navItems = isAuthenticated ? authenticatedItems : unauthenticatedItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 h-16 md:hidden z-20">
      <div className="flex justify-around items-center h-full">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link href={href} key={label}>
              <div
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-md w-24', // Added fixed width for consistency
                  isActive ? 'text-blue-500' : 'text-gray-400'
                )}
              >
                <Icon className={cn('h-6 w-6', isActive && 'fill-current')} />
                <span className="text-xs font-medium text-center">{label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
