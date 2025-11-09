// ===================================================
// HOOK: useCommunityPosts
// ===================================================
// Gerencia listagem de posts da comunidade
// Features: Filtros, paginação, loading states
// ===================================================

import { useState, useEffect, useCallback } from 'react';
import { supabaseClient } from '@/lib/supabase';

export type PostType = 'image' | 'music' | 'all';

export interface CommunityPost {
  id: string;
  user_id: string;
  type: 'image' | 'music';
  title: string;
  description: string | null;
  media_url: string;
  firebase_path: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
}

interface UseCommunityPostsOptions {
  type?: PostType;
  limit?: number;
}

export function useCommunityPosts(options: UseCommunityPostsOptions = {}) {
  const { type = 'all', limit = 20 } = options;
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: currentOffset.toString(),
      });

      if (type !== 'all') {
        params.append('type', type);
      }

      const response = await fetch(`/api/community/posts?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();

      if (reset) {
        setPosts(data.posts || []);
        setOffset(limit);
      } else {
        setPosts(prev => [...prev, ...(data.posts || [])]);
        setOffset(prev => prev + limit);
      }

      setHasMore((data.posts || []).length === limit);

    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [type, limit, offset]);

  // Carregar posts iniciais
  useEffect(() => {
    fetchPosts(true);
  }, [type]); // Recarregar quando o tipo mudar

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(false);
    }
  }, [loading, hasMore, fetchPosts]);

  const refresh = useCallback(() => {
    setOffset(0);
    fetchPosts(true);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
