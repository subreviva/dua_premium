// ===================================================
// HOOK: useLike
// ===================================================
// Gerencia likes em posts da comunidade
// Features: Optimistic updates, toggle, auth
// ===================================================

import { useState, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';

export function useLike(postId: string, initialLiked: boolean = false, initialCount: number = 0) {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async () => {
    try {
      setLoading(true);

      // Get auth token
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      // Optimistic update
      const previousLiked = liked;
      const previousCount = likesCount;
      
      setLiked(!liked);
      setLikesCount(prev => liked ? prev - 1 : prev + 1);

      // API call
      const response = await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        // Revert on error
        setLiked(previousLiked);
        setLikesCount(previousCount);
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      
      // Confirm state from server
      setLiked(data.liked);

    } catch (error) {
      console.error('Error toggling like:', error);
      // Error handling could show toast notification
    } finally {
      setLoading(false);
    }
  }, [postId, liked, likesCount]);

  return {
    liked,
    likesCount,
    toggleLike,
    loading
  };
}
