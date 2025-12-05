'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const UserProfileCard = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <Card className="bg-[#111625] border-gray-800 text-white shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Informazioni utente</CardTitle>
                <CardDescription className="text-gray-400">I tuoi dati personali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Username</p>
                    <p className="text-base font-semibold">@{user.username}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Email</p>
                    <p className="text-base text-gray-200">{user.email}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Bio</p>
                    <div className="text-sm">
                        {user.bio ? (
                            <p className="text-gray-200">{user.bio}</p>
                        ) : (
                            <p className="text-gray-500 italic">Nessuna bio aggiunta. <Link href="/profile/edit" className="text-blue-500 hover:underline not-italic">Aggiungine una!</Link></p>
                        )}
                    </div>
                </div>
            </CardContent>
            <div className="px-6 pb-6 flex flex-col gap-3">
                <Link href="/profile/edit" className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg">
                        <Pencil className="mr-2 h-4 w-4" />
                        Modifica profilo
                    </Button>
                </Link>
                <Button
                    variant="destructive"
                    onClick={logout}
                    className="w-full bg-red-900/40 hover:bg-red-900/60 text-red-200 hover:text-red-100 border border-red-900/50 rounded-lg"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Esci dall'account
                </Button>
            </div>
        </Card>
    );
}

export default UserProfileCard;
