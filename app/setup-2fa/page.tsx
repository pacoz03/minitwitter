'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { Copy, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

const Setup2FAPage = () => {
  const router = useRouter();
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const storedSecret = localStorage.getItem('otp_secret');
    if (storedSecret) {
      setSecret(storedSecret);
    } else {
      router.push('/signup');
    }
  }, [router]);

  const handleCopy = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinue = () => {
    localStorage.removeItem('otp_secret');
    localStorage.removeItem('temp_token');
    router.push('/');
  };
  
  if (!secret) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020618] p-4 text-white">
      <Card className="w-full max-w-lg border-gray-800 bg-gray-900 shadow-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-white">Registrazione completata! 🎉</CardTitle>
          <CardDescription className="text-gray-400 mt-1">
            Configura autenticazione a due fattori
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Nota Informativa */}
          <Alert className="border-blue-900 bg-blue-950/40 text-blue-200">
            <AlertDescription className="text-sm">
              <strong className="text-white">Nota:</strong> Questo progetto usa un secret OTP condiviso per tutti gli utenti. Configura Google Authenticator una sola volta e potrai accedere con qualsiasi account.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-base">Passo 1: Installa Google Authenticator</h3>
            <ul className="list-disc list-inside text-sm text-gray-400 ml-1 space-y-1">
              <li>
                iPhone: <a href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">App Store</a>
              </li>
              <li>
                Android: <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">Google Play</a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-white text-base">Passo 2: Scansiona il QR Code</h3>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <QRCode 
                  value={`otpauth://totp/MiniTwitter?secret=${secret}`} 
                  size={180} 
                  level={"H"}
                  includeMargin={false}
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">Oppure inserisci manualmente il secret:</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secret" className="text-white font-medium">Secret OTP</Label>
            <div className="flex items-center gap-3">
              <Input
                id="secret"
                type="text"
                readOnly
                value={secret}
                className="bg-gray-950/50 border-gray-700 text-gray-300 font-mono text-sm h-10 focus-visible:ring-blue-500"
              />
              <Button 
                onClick={handleCopy}
                variant="outline"
                className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white min-w-[90px]"
              >
                {copied ? <Check className="h-4 w-4 mr-2 text-green-500" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? 'Copiato' : 'Copia'}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 rounded-md text-base transition-all mt-4"
          >
            Continua al Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup2FAPage;