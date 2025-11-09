import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/runway/upload-video
 * Faz upload de vídeo para usar com Runway ML
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      );
    }

    // Validar tamanho (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Video file must be smaller than 100MB' },
        { status: 400 }
      );
    }

    // Fazer upload para Vercel Blob Storage
    const blob = await put(`videos/${Date.now()}-${videoFile.name}`, videoFile, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      success: true,
      videoUri: blob.url,
      size: videoFile.size,
      type: videoFile.type,
    });
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
