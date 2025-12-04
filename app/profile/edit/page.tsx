'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { updateUserProfile } from '@/lib/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const EditProfilePage = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.bio) {
      setBio(user.bio);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      await updateUserProfile(user.id, bio);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/profile');
  };

  if (!user) {
    return <p className="p-4 text-center">Caricamento...</p>;
  }

  return (
    <div className="w-full max-w-xl border-r border-gray-800 min-h-screen">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 backdrop-blur-sm p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Modifica profilo</h1>
      </div>

      <div className="p-2">
        <Card className=" border-gray-800 shadow-lg">
          <CardContent className="space-y-6">
            {/* Username Field (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-400">Username</Label>
              <Input
                id="username"
                type="text"
                value={user.username}
                disabled
                className="bg-[#020618] border-gray-700 text-gray-500 cursor-not-allowed focus-visible:ring-0"
              />
            </div>

            {/* Bio Field */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-gray-400">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                className="bg-[#0b101b] border-gray-700 text-gray-200 resize-none focus-visible:ring-blue-600 focus-visible:border-blue-600"
                placeholder="Raccontaci qualcosa di te..."
              />
            </div>

            {/* Error Message */}
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button 
                onClick={handleSave} 
                disabled={loading} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold min-w-[80px]"
              >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvataggio...
                    </>
                ) : 'Salva'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={handleCancel} 
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              >
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;