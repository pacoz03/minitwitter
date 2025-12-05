'use client';

import React, { useState } from 'react';
import { Trash2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PostType } from '@/app/components/organisms/Post';

interface PostOwnerActionsProps {
  post: PostType;
  isOwner: boolean;
  onEdit?: (post: PostType) => void;
  onDelete?: (postId: string) => void;
}

export const PostOwnerActions = ({ post, isOwner, onEdit, onDelete }: PostOwnerActionsProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  if (!isOwner) return null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(post);
  };
  
  return (
    <div className="flex flex-col gap-1 absolute top-2 right-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10"
          onClick={handleEditClick}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {onDelete && (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="border-gray-800 text-white max-w-[400px] p-6 rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsAlertOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4 text-gray-400" />
              <span className="sr-only">Close</span>
            </button>

            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold">Elimina post</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400 mt-2">
                Sei sicuro di voler eliminare questo post? Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter className="mt-6 flex gap-3 sm:justify-end">
              <AlertDialogCancel
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-gray-700 text-white hover:bg-gray-800 hover:text-white rounded-md font-semibold"
              >
                Annulla
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(post.id);
                  setIsAlertOpen(false);
                }}
                className="bg-red-500/90 hover:bg-red-600 text-white border-0 rounded-md font-semibold"
              >
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
