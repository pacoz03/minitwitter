'use client';

import { useState, useEffect } from 'react';
import { PostType } from './Post';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface EditPostModalProps {
  post: PostType | null;
  onClose: () => void;
  onSave: (postId: string, newContent: string) => Promise<void>;
}

const EditPostModal = ({ post, onClose, onSave }: EditPostModalProps) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sincronizza il contenuto quando cambia il post selezionato
  useEffect(() => {
    if (post) {
      setContent(post.content);
    }
  }, [post]);

  const handleSave = async () => {
    if (!post) return;
    setIsSaving(true);
    try {
      await onSave(post.id, content);
      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio", error);
      // Qui potresti gestire un errore visivo se necessario
    } finally {
      setIsSaving(false);
    }
  };

  // Gestione della chiusura del dialogo
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={!!post} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifica post</DialogTitle>
          <DialogDescription className="text-gray-400">
            Apporta modifiche al tuo post qui sotto. Clicca su salva quando hai finito.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-gray-950/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus-visible:ring-blue-500 resize-none"
            placeholder="Cosa stai pensando?"
          />
        </div>

        <DialogFooter className="flex space-x-2 sm:justify-end">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isSaving}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !content.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold min-w-[80px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              'Salva'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostModal;