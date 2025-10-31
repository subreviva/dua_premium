import { NextResponse } from 'next/server'
import { getCredits } from '@/lib/suno-api'

export const runtime = 'nodejs'
export const maxDuration = 50

export async function GET(req: Request) {
  try {
    console.log('💳 [Credits] Request (Suno API)')

    const res = await getCredits()
    if (res.code !== 200) {
      console.error('❌ [Credits] Suno API error:', res)
      return NextResponse.json({ success: false, error: res.msg || 'Suno API error' }, { status: 500 })
    }

    // Handle both numeric response and object response
    let creditsLeft = 0
    if (typeof res.data === 'number') {
      creditsLeft = res.data
    } else if (res.data && typeof res.data === 'object' && 'credits_remaining' in res.data) {
      creditsLeft = (res.data as any).credits_remaining || 0
    }

    // Wrap into legacy shape expected by UI
    const legacy = {
      credits_left: creditsLeft,
      period: 'n/a',
      monthly_limit: 0,
      monthly_usage: 0,
    }

    console.log('✅ [Credits] Success:', legacy)

    return NextResponse.json({ success: true, credits: legacy })

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
