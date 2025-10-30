import { NextRequest, NextResponse } from 'next/server'
import { getTaskStatus, type SunoRecordInfoResponse } from '@/lib/suno-api'

export const runtime = 'edge'

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

    const idArray = ids.split(',').map((s) => s.trim()).filter(Boolean)
    console.log('🔍 [Status] Polling Task IDs:', idArray)

    // For each taskId, fetch record info and map to legacy SunoSong shape expected by UI
    const results = await Promise.all(
      idArray.map(async (taskId) => {
        try {
          const apiResponse = await getTaskStatus(taskId)
          
          // Default legacy shape
          const legacy = {
            id: taskId,
            status: 'submitted' as const,
            title: '',
            created_at: new Date().toISOString(),
            model_name: '',
            image_url: '',
            audio_url: '',
            lyric: '',
            tags: '',
            prompt: '',
            gpt_description_prompt: '',
            type: '',
            video_url: '',
            duration: 0,
          }
          
          // Check if we got a successful response
          if (!apiResponse.data) {
            console.warn(`[Status] No data for task ${taskId}`)
            return legacy
          }

          const data = apiResponse.data

          if (!data || !data.response || !Array.isArray(data.response.sunoData) || data.response.sunoData.length === 0) {
            return legacy
          }

          const item = data.response.sunoData[0]
          const status = data.status

          const mappedStatus =
            status === 'SUCCESS' || status === 'FIRST_SUCCESS' || status === 'TEXT_SUCCESS'
              ? 'complete'
              : status?.endsWith('FAILED')
              ? 'error'
              : 'submitted'

          return {
            ...legacy,
            status: mappedStatus as 'submitted' | 'complete' | 'error',
            title: item.title || '',
            model_name: item.modelName || '',
            image_url: item.imageUrl || '',
            audio_url: item.audioUrl || '',
            lyric: '', // Not available in response
            tags: item.tags || '',
            prompt: item.prompt || '',
            video_url: '',
            duration: item.duration || 0,
          }
        } catch (e) {
          console.error('❌ [Status] Error for task', taskId, e)
          return {
            id: taskId,
            status: 'submitted' as const,
            title: '',
            created_at: new Date().toISOString(),
            model_name: '',
            image_url: '',
            audio_url: '',
            lyric: '',
            tags: '',
            prompt: '',
            gpt_description_prompt: '',
            type: '',
            video_url: '',
            duration: 0,
          }
        }
      })
    )

    // Log quick summary
    results.forEach((song: any) => {
      const hasAudio = song.audio_url ? '🎵 audio ready' : '⏳ processing'
      console.log(`[Status] ${song.id}: ${song.status} ${hasAudio}`)
    })

    return NextResponse.json({ success: true, songs: results })

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
