import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt, callBackUrl } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }
    
    console.log('🎵 [Lyrics] Request:', { promptLength: prompt.length })

    const sunoAPI = new SunoAPIClient({ apiKey })
    
    // Auto-generate callback URL if not provided
    const finalCallBackUrl = callBackUrl || `${req.headers.get('origin') || 'http://localhost:3000'}/api/suno/callback/lyrics`
    
    const result = await sunoAPI.generateLyrics({ 
      prompt,
      callBackUrl: finalCallBackUrl
    })
    
    console.log('✅ [Lyrics] Success')
    
    return NextResponse.json({ 
      success: true, 
      data: result.data 
    })

  } catch (error: unknown) {
    console.error('❌ [Lyrics] Error:', error)
    
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
