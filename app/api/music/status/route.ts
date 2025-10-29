import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ids = searchParams.get('ids')

    if (!ids) {
      return NextResponse.json(
        { success: false, error: 'IDs são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('[Music Status] Checking status for:', ids)

    // Chama a API Suno no Railway
    const response = await fetch(`${SUNO_API_URL}/api/get?ids=${ids}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Music Status] API Error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('[Music Status] Response:', data)

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
    console.error('[Music Status] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
