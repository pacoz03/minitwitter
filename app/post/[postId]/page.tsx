'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Post, { PostType } from '@/app/components/Post';
import Comment, { CommentType } from '@/app/components/Comment';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { getPostDetails, getComments, toggleLike, addComment } from '@/lib/apiService';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const PostDetailPage = ({ params }: { params: Promise<{ postId: string }> }) => {
  const { postId } = use(params);
  
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState<PostType | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPostAndComments = useCallback(async () => {
    try {
      setLoading(true);
      
      const [postDetails, commentsData] = await Promise.all([
        getPostDetails(postId, user?.id),
        getComments(postId)
      ]);

      setPost(postDetails);
      setComments(commentsData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post details.');
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);
  
  const handleLikeToggle = async (postId: string, isLiked: boolean) => {
    if (!post) return;
    
    // Optimistic update
    const originalPost = { ...post };
    setPost({ ...post, is_liked: !isLiked, likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1 });
    
    try {
        await toggleLike(postId, isLiked);
    } catch (err) {
        setError("Failed to update like status");
        setPost(originalPost); // Revert on error
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !isAuthenticated || !user) return;
    
    setIsPublishing(true); 
    try {
        const createdComment = await addComment(postId, newComment);

        // Optimistic update with user data from context
        const newCommentWithUser: CommentType = {
            ...createdComment,
            user: {
                id: user.id,
                username: user.username,
                image: user.image,
            },
        };
        
        setComments(prev => [newCommentWithUser, ...prev]);
        setNewComment('');
        
        if (post) {
            setPost({ ...post, comments_count: post.comments_count + 1 });
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
        setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl border-l border-r border-gray-800 min-h-screen flex flex-col">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 backdrop-blur-sm p-4 border-b border-gray-800 flex items-center space-x-4">
        <button onClick={() => window.history.back()} className="hover:bg-gray-800  p-2 transition-colors">
          <ArrowLeft className="text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Post</h1>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading && (
           <div className="p-4 space-y-4">
             <Skeleton className="h-32 w-full bg-gray-800 rounded-xl" />
             <Skeleton className="h-20 w-full bg-gray-800 rounded-xl" />
           </div>
        )}
        
        {error && <div className="p-8 text-center text-red-400 bg-red-900/10 m-4 rounded-lg border border-red-900/20">{error}</div>}
        
        {post && !loading && (
          <>
            {/* Main Post Component */}
            <Post post={post} onLikeToggle={handleLikeToggle} currentUserId={user?.id} />

            {/* Comment Input Section */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/30">
              <div className="space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Scrivi un commento..."
                  className="w-full min-h-[100px] bg-gray-950/50 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none rounded-xl"
                  disabled={!isAuthenticated || isPublishing}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={!newComment.trim() || !isAuthenticated || isPublishing}
                    className=" bg-blue-600 hover:bg-blue-500 text-white font-bold px-6"
                  >
                    {isPublishing ? (
                      <>
                        Pubblicazione...
                      </>
                    ) : (
                      'Commenta'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="p-4 space-y-4">
              {comments.length > 0 ? (
                  comments.map(comment => (
                      <Comment key={comment.id} comment={comment} />
                  ))
              ) : (
                  <div className="py-12 text-center text-gray-500">
                    <p>Ancora nessun commento.</p>
                    <p className="text-sm">Sii il primo a partecipare alla discussione!</p>
                  </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;