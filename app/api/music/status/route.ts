import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { success: false, error: 'IDs are required' },
        { status: 400 }
      )
    }

    const idArray = ids.split(',')
    console.log('🔍 [Status] Polling IDs:', idArray)

    // Chama a API Suno no Railway
    const response = await fetch(`${SUNO_API_URL}/api/get?ids=${ids}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Status] API Error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Log status de cada song
    if (Array.isArray(data)) {
      data.forEach(song => {
        const hasAudio = song.audio_url ? '🎵 audio ready' : '⏳ processing'
        console.log(`[Status] ${song.id}: ${song.status} ${hasAudio}`)
      })
    }

    // API retorna array de songs
    if (Array.isArray(data)) {
      return NextResponse.json({
        success: true,
        songs: data
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid response format from Suno API'
    }, { status: 500 })

  } catch (error) {
    console.error('❌ [Status] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
