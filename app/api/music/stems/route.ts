import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { audio_id } = body

    if (!audio_id || typeof audio_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Audio ID is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }
    
    console.log('🎵 [Stems] Request:', { audio_id })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const result = await sunoAPI.stemsBasic({ clip_id: audio_id })
    
    console.log('✅ [Stems] Success:', result)
    
    return NextResponse.json({ 
      success: true, 
      data: result.data 
    })

  } catch (error: unknown) {
    console.error('❌ [Stems] Error:', error)
    
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
