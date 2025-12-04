'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost } from '@/lib/apiService';
import { useAuth } from '@/context/AuthContext';

const CreatePostPage = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!content.trim()) {
      setError("Il post non può essere vuoto.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(content);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Si è verificato un errore durante la pubblicazione del post.');
      setIsSubmitting(false);
    }
  };

  if (!user) {
      return <p className="p-4 text-center">Devi essere autenticato per creare un post.</p>
  }

  return (
    <div className="w-full max-w-2xl border-l border-r border-gray-800 min-h-screen">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Crea un nuovo post</h1>
        <p className="text-gray-400 text-sm">Condividi i tuoi pensieri con la community</p>
      </div>
      <div className="p-4">
        <form onSubmit={handlePublish}>
          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 shrink-0 flex items-center justify-center font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cosa stai pensando?"
                className="w-full h-32 p-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <p className="text-xs text-gray-500">Supporta Markdown: **grassetto**, _corsivo_, liste, ecc.</p>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Pubblicazione...' : 'Pubblica'}
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-4 text-right">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
