import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

// DIAGNOSTIC ENDPOINT - Returns what it receives
export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    return NextResponse.json({
      success: true,
      message: 'Test endpoint working',
      received: body,
      timestamp: new Date().toISOString(),
      runtime: 'nodejs',
      env: {
        hasApiKey: !!process.env.SUNO_API_KEY,
        nodeVersion: process.version,
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test endpoint is alive',
    timestamp: new Date().toISOString(),
  })
}
