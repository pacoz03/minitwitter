'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { login as apiLogin } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Inserisci il tuo username.",
  }),
  password: z.string().min(1, {
    message: "Inserisci la password.",
  }),
});

const LoginPage = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setServerError('');
    
    try {
      const data = await apiLogin(values);

      if (data.requires_otp) {
        localStorage.setItem('temp_token', data.temp_token!);
        router.push('/verify-otp');
      } else if (data.token && data.user) {
        login(data.token, data.user);
        router.push('/');
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Si è verificato un errore imprevisto. Riprova.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm  shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Accedi</CardTitle>
          <CardDescription className="text-gray-400">
            Inserisci le tue credenziali per accedere
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="username" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******************" 
                        {...field} 
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="text-red-500 text-sm font-medium text-center bg-red-500/10 p-2 rounded border border-red-500/20">
                  {serverError}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Attendere...
                  </>
                ) : (
                  'Continua'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Non hai un account?{' '}
            <Link href="/signup" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
              Registrati
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;