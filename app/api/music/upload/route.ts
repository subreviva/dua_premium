import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'url is required' 
      }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid URL format' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    console.log('🎵 [Upload Music] Request:', { url })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.uploadMusic({ url })

    if (!res.data?.clip_id) {
      console.error('❌ [Upload Music] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const clipId = res.data.clip_id
    console.log('✅ [Upload Music] Success:', clipId)

    return NextResponse.json({
      success: true,
      data: {
        code: 200,
        clip_id: clipId,
        message: 'success'
      }
    })

  } catch (error: unknown) {
    console.error('❌ [Upload Music] Error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Request timeout' 
        }, { status: 408 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown error occurred' 
    }, { status: 500 })
  }
}
