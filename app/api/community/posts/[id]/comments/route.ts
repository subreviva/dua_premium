// ===================================================
// API: GET/POST /api/community/posts/[id]/comments
// ===================================================
// Gerenciar comentários de um post
// ===================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET - Listar comentários
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    const { data: comments, error } = await supabase
      .from('community_comments')
      .select(`
        *,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch comments', details: error.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedComments = comments?.map(comment => ({
      ...comment,
      user: {
        id: comment.user?.id,
        name: comment.user?.raw_user_meta_data?.name || comment.user?.raw_user_meta_data?.full_name || comment.user?.email?.split('@')[0] || 'Anonymous',
        avatar: comment.user?.raw_user_meta_data?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id}`,
        email: comment.user?.email
      }
    }));

    return NextResponse.json({ comments: formattedComments || [] });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Adicionar comentário
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    // Get auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Get content from request
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment is too long (max 1000 characters)' },
        { status: 400 }
      );
    }

    // Insert comment
    const { data: comment, error: insertError } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim()
      })
      .select(`
        *,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create comment', details: insertError.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedComment = {
      ...comment,
      user: {
        id: comment.user?.id,
        name: comment.user?.raw_user_meta_data?.name || comment.user?.raw_user_meta_data?.full_name || comment.user?.email?.split('@')[0] || 'Anonymous',
        avatar: comment.user?.raw_user_meta_data?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user?.id}`,
        email: comment.user?.email
      }
    };

    return NextResponse.json({ comment: formattedComment }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
