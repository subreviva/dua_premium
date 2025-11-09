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

    console.log('🎬 Starting video upscale with Runway ML...');
    console.log('📹 Video URI length:', videoUri.length);

    // Validações
    if (typeof videoUri !== 'string' || videoUri.length < 13) {
      return NextResponse.json(
        { error: 'Invalid videoUri format. Must be HTTPS URL or data URI (min 13 chars)' },
        { status: 400 }
      );
    }

    // Verificar se é URL HTTPS ou data URI
    const isDataUri = videoUri.startsWith('data:video/');
    const isHttpsUrl = videoUri.startsWith('https://');
    
    if (!isDataUri && !isHttpsUrl) {
      return NextResponse.json(
        { error: 'videoUri must be a HTTPS URL or data URI starting with data:video/' },
        { status: 400 }
      );
    }

    const payload = {
      model: 'upscale_v1',
      videoUri,
    };

    console.log('📦 Payload:', { model: payload.model, videoUriType: isDataUri ? 'data URI' : 'HTTPS URL' });

    // Call Runway ML API (DEV endpoint)
    const response = await fetch('https://api.dev.runwayml.com/v1/video_upscale', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Runway API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to start upscale', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Upscale task created:', data.id);

    return NextResponse.json({
      success: true,
      taskId: data.id,
    });
  } catch (error) {
    console.error('Error in video-upscale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
