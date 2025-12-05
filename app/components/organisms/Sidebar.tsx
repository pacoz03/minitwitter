'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Heart, User, Feather, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <aside className="flex flex-col justify-between h-screen w-68 border-r p-4">
      
      {/* --- SEZIONE SUPERIORE --- */}
      <div className="flex flex-col space-y-6">
        <div className="px-2">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight">MiniTwitter</h1>
          </Link>
          
        </div>

        {isAuthenticated && user ? (
          <>
            <div className="flex items-center gap-3 px-2">
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-bold text-sm">{user.email}</span>
                <span className="truncate text-xs text-muted-foreground">@{user.username}</span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full font-bold">
              <Link href="/post">
                <Feather className="mr-2 h-5 w-5" />
                Nuovo Post
              </Link>
            </Button>

            <nav className="flex flex-col space-y-2">
              <SidebarLink 
                href="/" 
                icon={<Home className="h-6 w-6" />} 
                label="Home" 
                isActive={pathname === '/'} 
              />
              <SidebarLink 
                href="/likes" 
                icon={<Heart className="h-6 w-6" />} 
                label="Likes" 
                isActive={pathname === '/likes'} 
              />
              <SidebarLink 
                href="/profile" 
                icon={<User className="h-6 w-6" />} 
                label="Profile" 
                isActive={pathname === '/profile'} 
              />
            </nav>
          </>
        ) : (
          /* Stato Non Autenticato - Contenuto Principale */
          <div className="flex flex-col space-y-4 px-2">
            <h2 className="text-xl font-bold leading-tight">Partecipa alla conversazione</h2>
            <div className="space-y-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/signup">Crea account</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full" size="lg">
                <Link href="/login">Accedi</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* --- SEZIONE INFERIORE --- */}
      {isAuthenticated ? (
    <div className="mt-auto pt-4">
          <Button 
            variant="ghost" 
            onClick={logout}
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800 pl-4"
          >
            <LogOut className="mr-3 h-5 w-5"/>
            <span>Esci</span>
          </Button>
        </div>
      ) : (
        /* Footer per utenti non loggati (Richiesto) */
        <div className="mt-auto px-4 pb-4">
            <div className="flex flex-col space-y-2 text-sm text-blue-500">
                <Link href="/terms" className="hover:underline">
                    Termini di servizio
                </Link>
                <Link href="/privacy" className="hover:underline">
                    Informativa sulla privacy
                </Link>
            </div>
        </div>
      )}
    </aside>
  );
};

// Componente Helper per i Link
const SidebarLink = ({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) => (
  <Button 
    asChild 
    variant={isActive ? "secondary" : "ghost"} 
    size="lg"
    className={`w-full justify-start text-xl ${isActive ? 'font-bold' : 'font-normal'}`}
  >
    <Link href={href}>
      <span className="mr-4">{icon}</span>
      {label}
    </Link>
  </Button>
);

export default Sidebar;