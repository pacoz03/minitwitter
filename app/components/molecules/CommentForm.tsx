'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isPublishing: boolean;
  isAuthenticated: boolean;
}

const CommentForm = ({ onSubmit, isPublishing, isAuthenticated }: CommentFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    if (!content.trim()) return;
    await onSubmit(content);
    setContent('');
  };

  return (
    <div className="p-4 border-b border-gray-800 bg-gray-900/30">
      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Scrivi un commento..."
          className="w-full min-h-[100px] bg-gray-950/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none rounded-xl"
          disabled={!isAuthenticated || isPublishing}
        />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || !isAuthenticated || isPublishing}
            className=" bg-blue-600 hover:bg-blue-500 text-white font-bold px-6"
          >
            {isPublishing ? 'Pubblicazione...' : 'Commenta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;
