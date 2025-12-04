'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyOtp as apiVerifyOtp } from '@/lib/apiService';
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

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth();

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const tempToken = localStorage.getItem('temp_token');

    if (!tempToken) {
      setError('Sessione scaduta o non valida. Riprova a effettuare il login.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await apiVerifyOtp({ temp_token: tempToken, otp_token: otp });
      
      if (data.token && data.user) {
        login(data.token, data.user);
        localStorage.removeItem('temp_token');
        router.push('/');
      }
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
          <CardTitle className="text-2xl font-bold text-center">Verifica OTP</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Inserisci il codice OTP da Google Authenticator
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-white">Codice OTP</Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500 text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                autoFocus
                required
              />
              <p className="text-xs text-gray-400 text-center">
                Inserisci il codice a 6 cifre
              </p>
            </div>

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
              {isLoading ? "Verifica in corso..." : "Verifica e Accedi"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Button 
            variant="link" 
            onClick={() => router.back()} 
            className="text-gray-400 hover:text-white"
          >
            Torna indietro
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyOtpPage;