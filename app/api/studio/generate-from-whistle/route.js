import { NextResponse } from 'next/server';

const SUNOAPI_BASE_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-gold.vercel.app';

export async function POST(request) {
  try {
    const { audioUrl, style, prompt, title, instrumental = false } = await request.json();
    
    console.log('[SunoAPI] Starting generation with:', {
      audioUrl: audioUrl ? 'provided' : 'none',
      style,
      prompt: prompt?.substring(0, 50) + '...',
      instrumental
    });

    if (!SUNOAPI_KEY) {
      throw new Error('SUNOAPI_KEY not configured');
    }

    // Determine which endpoint to use based on input
    let endpoint, requestBody;
    
    if (audioUrl) {
      // Use custom mode for audio continuation
      endpoint = `${SUNOAPI_BASE_URL}/api/custom_generate`;
      requestBody = {
        prompt: prompt || `A ${style} song`,
        tags: style || 'pop',
        title: title || 'DUA AI Studio',
        make_instrumental: instrumental,
        wait_audio: false
      };
    } else {
      // Use generate endpoint for text-only generation  
      endpoint = `${SUNOAPI_BASE_URL}/api/generate`;
      requestBody = {
        prompt: prompt || `A ${style} song`,
        tags: style || 'pop',
        title: title || 'DUA AI Studio',
        make_instrumental: instrumental,
        model: 'chirp-v3-5',
        wait_audio: false
      };
    }
    
    console.log('[SunoAPI] POST to:', endpoint);
    console.log('[SunoAPI] Body:', JSON.stringify(requestBody));
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();
    console.log('[SunoAPI] Response status:', response.status);
    console.log('[SunoAPI] Response body:', responseText);
    
    if (!response.ok) {
      console.error('[SunoAPI] Error response:', responseText);
      throw new Error(`SunoAPI error: ${response.status} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    console.log('[SunoAPI] Parsed response:', data);
    
    // Extract IDs from response - try multiple possible formats
    let ids = [];
    if (Array.isArray(data)) {
      ids = data.map(item => item.id).filter(Boolean);
    } else if (data.data && Array.isArray(data.data)) {
      ids = data.data.map(item => item.id).filter(Boolean);
    } else if (data.id) {
      ids = [data.id];
    }
    
    if (ids.length === 0) {
      throw new Error('No IDs returned from SunoAPI');
    }

    console.log('[SunoAPI] Generated IDs:', ids);

    return NextResponse.json({
      success: true,
      clipIds: ids,
      taskId: ids[0] // Use first ID as task ID for compatibility
    });

  } catch (error) {
    console.error('[SunoAPI] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate music' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clipIds = searchParams.get('clipIds');
    const taskId = searchParams.get('taskId');
    
    if (!clipIds && !taskId) {
      return NextResponse.json(
        { error: 'No clipIds or taskId provided' },
        { status: 400 }
      );
    }

    if (!SUNOAPI_KEY) {
      throw new Error('SUNOAPI_KEY not configured');
    }
    
    // Parse clip IDs
    const ids = clipIds ? clipIds.split(',') : [taskId];
    console.log('[SunoAPI] Checking status for IDs:', ids);
    
    // Query clip status using GET endpoint
    const idsParam = ids.join(',');
    const response = await fetch(
      `${SUNOAPI_BASE_URL}/api/get?ids=${idsParam}`,
      {
        method: 'GET',
        headers: { 
        }
      }
    );

    const responseText = await response.text();
    console.log('[SunoAPI] Query response status:', response.status);
    
    if (!response.ok) {
      console.error('[SunoAPI] Query error:', response.status, responseText);
      throw new Error(`Query failed: ${response.status}`);
    }

    const data = JSON.parse(responseText);
    console.log('[SunoAPI] Query response:', data);
    
    // Handle different response formats
    let clips = [];
    if (Array.isArray(data)) {
      clips = data;
    } else if (data.data && Array.isArray(data.data)) {
      clips = data.data;
    } else if (data.id) {
      clips = [data];
    }
    
    console.log('[SunoAPI] Found', clips.length, 'clips');
    
    if (clips.length === 0) {
      return NextResponse.json({
        status: 'processing',
        progress: 30,
        message: 'Preparando geração...'
      });
    }
    
    // Check first clip status
    const clip = clips[0];
    const status = clip.status || 'processing';
    
    console.log('[SunoAPI] Clip status:', status, 'ID:', clip.id);
    
    // Check if complete
    if (status === 'complete' || status === 'streaming' || clip.audio_url) {
      // Return all completed clips
      const songs = clips
        .filter(c => c.audio_url)
        .map(c => ({
          id: c.id,
          title: c.title || 'DUA AI Music',
          audioUrl: c.audio_url,
          videoUrl: c.video_url || '',
          imageUrl: c.image_url || c.image_large_url || '',
          duration: c.duration || c.metadata?.duration || 0,
          tags: c.tags || c.metadata?.tags || '',
          prompt: c.prompt || c.metadata?.prompt || ''
        }));
      
      if (songs.length > 0) {
        return NextResponse.json({
          status: 'completed',
          songs: songs,
          song: songs[0]
        });
      }
    } else if (status === 'error' || status === 'failed') {
      return NextResponse.json({
        status: 'error',
        message: `Falha na geração: ${clip.error_message || clip.error_type || 'Erro desconhecido'}`
      });
    }

    // Still processing - calculate progress based on status
    let progress = 50;
    if (status === 'submitted') progress = 20;
    else if (status === 'queued') progress = 30;
    else if (status === 'streaming') progress = 70;
    else if (status === 'complete') progress = 100;
    
    return NextResponse.json({
      status: 'processing',
      progress: progress,
      message: 'Gerando música com IA...'
    });

  } catch (error) {
    console.error('[SunoAPI] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    );
  }
}
