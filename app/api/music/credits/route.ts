import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 10

export async function GET(req: NextRequest) {
  try {
    const sunoApiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'
    
    console.log('💳 [Credits] Request')

    const response = await fetch(`${sunoApiUrl}/api/get_credits`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Credits] Suno API error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('✅ [Credits] Success:', data)
    
    return NextResponse.json({ 
      success: true, 
      credits: data 
    })

  } catch (error: unknown) {
    console.error('❌ [Credits] Error:', error)
    
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
