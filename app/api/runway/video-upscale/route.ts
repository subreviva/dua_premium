import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/runway/video-upscale
 * Inicia o upscale de vídeo para 4K usando Runway ML
 */
export async function POST(request: NextRequest) {
  try {
    const { videoUri } = await request.json();

    if (!videoUri) {
      return NextResponse.json(
        { error: 'videoUri is required' },
        { status: 400 }
      );
    }

    const runwayApiKey = process.env.RUNWAY_API_KEY;
    if (!runwayApiKey) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 500 }
      );
    }

    // Chamar API do Runway ML para upscale
    const response = await fetch('https://api.runwayml.com/v1/upscale', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'upscale_v1',
        videoUri: videoUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Runway API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to start upscale', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      taskId: data.id,
      status: data.status,
    });
  } catch (error) {
    console.error('Error in video-upscale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
