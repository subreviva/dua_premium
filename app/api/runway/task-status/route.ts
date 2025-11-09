import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/runway/task-status?taskId=xxx
 * Verifica o status de uma task do Runway ML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
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

    // Call Runway ML API (usando URL dev como no exemplo)
    const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${runwayApiKey}`,
        'X-Runway-Version': '2024-11-06',
      },
    })

    const responseText = await response.text()
    console.log('🔍 Task Status Response:', response.status, responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      console.error('❌ Runway API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get task status', details: errorData },
        { status: response.status }
      );
    }

    const data = JSON.parse(responseText);

    return NextResponse.json({
      taskId: data.id,
      status: data.status, // PENDING, RUNNING, SUCCEEDED, FAILED
      progress: data.progress || 0,
      output: data.output?.[0] || data.output || null, // output pode ser array
      createdAt: data.createdAt,
      error: data.failure?.message || null,
    });
  } catch (error) {
    console.error('Error checking task status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
