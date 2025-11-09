// ===================================================
// API: GET /api/community/posts
// ===================================================
// Retorna lista de posts da comunidade
// Query params: type (image|music), limit, offset
// ULTRA-SIMPLIFIED: Performance first, dados mínimos
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Query simples - apenas posts
    let query = supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type && (type === 'image' || type === 'music')) {
      query = query.eq('type', type);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('❌ Error fetching posts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch posts', details: error.message },
        { status: 500 }
      );
    }

    // Formatar posts com avatar padrão
    const formattedPosts = posts?.map(post => ({
      id: post.id,
      user_id: post.user_id,
      type: post.type,
      title: post.title,
      description: post.description,
      media_url: post.media_url,
      firebase_path: post.firebase_path,
      thumbnail_url: post.thumbnail_url,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: post.user_id,
        name: 'Creator',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`,
        email: ''
      }
    })) || [];

    return NextResponse.json({
      posts: formattedPosts,
      total: formattedPosts.length,
      limit,
      offset,
      hasMore: formattedPosts.length === limit
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
      }
    });

  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
