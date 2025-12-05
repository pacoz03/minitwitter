
import apiClient from '@/lib/apiClient';
import { PostType } from '@/app/components/organisms/Post';
import { CommentType, EnrichedCommentType } from '@/app/components/organisms/Comment';

// Define a common interface for list responses
interface ListResponse<T> {
  items: T[];
  count: number;
}

// Define User and Like types based on their usage in pages
interface ApiUser {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  created_at: string;
  image?: string;
  has_otp?: boolean;
}

interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// --- Auth Types ---
interface LoginResponse {
  requires_otp?: boolean;
  temp_token?: string;
  token?: string;
  user?: ApiUser;
}

interface RegistrationResponse {
  user: ApiUser;
  token: string;
  otp_secret: string;
}

interface VerifyOtpResponse {
  token: string;
  user: ApiUser;
}


/**
 * Enriches a single post with aggregated data like counts and user-specific status.
 * @param post - The post to enrich.
 * @param currentUserId - The ID of the currently logged-in user to check for like status.
 * @returns The enriched post.
 */
export const enrichPost = async (post: PostType, currentUserId?: string): Promise<PostType> => {
  try {
    const [likesRes, commentsRes, userLikeRes] = await Promise.all([
      apiClient<{ count: number }>(`/api/likes?post_id=${post.id}&count=true`),
      apiClient<{ count: number }>(`/api/comments?post_id=${post.id}&count=true`),
      currentUserId ? apiClient<{ count: number }>(`/api/likes?post_id=${post.id}&user_id=${currentUserId}`) : Promise.resolve({ count: 0 })
    ]);
    
    return {
      ...post,
      likes_count: likesRes.count ?? 0,
      comments_count: commentsRes.count ?? 0,
      is_liked: currentUserId ? userLikeRes.count > 0 : false,
    };
  } catch (error) {
    console.error(`Failed to fetch details for post ${post.id}`, error);
    return { ...post, likes_count: 0, comments_count: 0, is_liked: false };
  }
};


// --- Post Functions ---
export const getFeedPosts = async (currentUserId?: string): Promise<PostType[]> => {
  const postData = await apiClient<ListResponse<PostType>>('/api/posts');
  return Promise.all(postData.items.map(post => enrichPost(post, currentUserId)));
};

export const getUserPosts = async (userId: string, currentUserId?: string): Promise<PostType[]> => {
    const postData = await apiClient<ListResponse<PostType>>(`/api/posts?user_id=${userId}`);
    const posts = postData.items;
    return Promise.all(posts.map(post => enrichPost(post, currentUserId)));
};

export const getPostDetails = async (postId: string, currentUserId?: string): Promise<PostType> => {
  const post = await apiClient<PostType>(`/api/posts/${postId}`);
  const comments = await getComments(postId);
  const enrichedPost = await enrichPost(post, currentUserId);
  return { ...enrichedPost, comments_count: comments.length };
};

export const createPost = (content: string) => {
  return apiClient('/api/posts', {
    method: 'POST',
    body: { content },
  });
};

export const updatePost = (postId: string, newContent: string) => {
  return apiClient(`/api/posts/${postId}`, {
    method: 'PATCH',
    body: { content: newContent },
  });
};

export const deletePost = (postId: string) => {
  return apiClient(`/api/posts/${postId}`, {
    method: 'DELETE',
  });
};


// --- Like Functions ---
export const toggleLike = (postId: string, isLiked: boolean) => {
  return apiClient('/api/likes', {
    method: isLiked ? 'DELETE' : 'POST',
    body: { post_id: postId },
  });
};

export const getLikedPosts = async (userId: string, currentUserId?: string): Promise<PostType[]> => {
    const likesData = await apiClient<ListResponse<Like>>(`/api/likes?user_id=${userId}`);
    const likedPosts = await Promise.all(
        likesData.items.map(async (like) => {
            try {
                const post = await apiClient<PostType>(`/api/posts/${like.post_id}`);
                return await enrichPost(post, currentUserId);
            } catch (e) {
                console.error(`Failed to fetch liked post ${like.post_id}`, e);
                return null;
            }
        })
    );
    return likedPosts.filter((p): p is PostType => p !== null);
};

// --- Comment Functions ---

export const getComments = async (postId: string): Promise<CommentType[]> => {
  const commentData = await apiClient<ListResponse<CommentType>>(`/api/comments?post_id=${postId}`);
  return commentData.items;
};

export const addComment = (postId: string, content: string) => {
  return apiClient<Omit<CommentType, 'user'>>('/api/comments', {
    method: 'POST',
    body: { post_id: postId, content: content.trim() },
  });
};

export const getUserComments = async (userId: string, currentUserId?: string): Promise<EnrichedCommentType[]> => {
    const response = await apiClient<ListResponse<CommentType>>(`/api/comments?limit=1000`);
    const userComments = response.items.filter(comment => comment.user_id === userId);

    const enrichedComments = await Promise.all(
        userComments.map(async (comment) => {
            try {
                const post = await apiClient<PostType>(`/api/posts/${comment.post_id}`);
                const enrichedPost = await enrichPost(post, currentUserId);
                return { ...comment, post: enrichedPost };
            } catch (e) {
                console.error(`Failed to fetch post for comment ${comment.id}`, e);
                return null;
            }
        })
    );
    return enrichedComments.filter((c): c is EnrichedCommentType => c !== null);
};


// --- User & Auth Functions ---

export const login = (credentials: {username: string, password: string}) => {
    return apiClient<LoginResponse>('/api/auth/login', { body: credentials });
};

export const register = (userData: {username: string, email: string, password: string}) => {
    return apiClient<RegistrationResponse>('/api/auth/register', { body: userData });
};

export const verifyOtp = (otpData: {temp_token: string, otp_token: string}) => {
    return apiClient<VerifyOtpResponse>('/api/auth/verify-otp', { body: otpData });
};

export const findUserByUsername = async (username: string): Promise<ApiUser | null> => {
    const decodedUsername = decodeURIComponent(username);
    const userData = await apiClient<ListResponse<ApiUser>>(`/api/users?q=${decodedUsername}`);
    return userData.items.length > 0 ? userData.items[0] : null;
};

export const updateUserProfile = (userId: string, bio: string) => {
    return apiClient(`/api/users/${userId}`, {
        method: 'PATCH',
        body: { bio },
    });
};

export const getUserProfileStats = async (userId: string) => {
    const [likesRes, allCommentsRes, postsRes] = await Promise.all([
        apiClient<{ count: number }>(`/api/likes?user_id=${userId}&count=true`),
        apiClient<ListResponse<CommentType>>(`/api/comments?limit=1000`), // Fetch all and filter
        apiClient<ListResponse<PostType>>(`/api/posts?user_id=${userId}&limit=1`),
    ]);

    const userCommentsCount = allCommentsRes.items.filter(c => c.user_id === userId).length;

    return {
        likes: likesRes.count,
        comments: userCommentsCount,
        posts: postsRes.count,
    };
};
