'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register as apiRegister } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError('Le password non coincidono');
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiRegister({ username, email, password });
      
      login(data.token, data.user);
      localStorage.setItem('otp_secret', data.otp_secret);
      router.push('/setup-2fa');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore imprevisto. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#020618] p-4">
      <Card className="w-full max-w-sm border-gray-800 bg-gray-900 text-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Crea un account</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Inserisci i tuoi dati per registrarti
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                required
              />
            </div>

            {/* Conferma Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                required
              />
            </div>

            {/* Messaggio di Errore */}
            {error && (
              <p className="text-sm font-medium text-red-500 text-center animate-pulse">
                {error}
              </p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full"
              disabled={isLoading}
            >
              {isLoading ? "Creazione account..." : "Crea account"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter>
          <p className="w-full text-center text-sm text-gray-400">
            Hai già un account?{' '}
            <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400 hover:underline">
              Accedi
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationPage;