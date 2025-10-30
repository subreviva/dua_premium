# Suno API Integration - Complete Documentation

This document provides complete documentation for all integrated Suno API endpoints following the official API specification at https://docs.sunoapi.org/

## ✅ Fully Integrated Endpoints

### 1. Get Music Generation Details
**Endpoint:** `GET /api/v1/generate/record-info`

Retrieve detailed information about a music generation task, including status, parameters, and results.

**Parameters:**
- `taskId` (required): The task ID returned from Generate Music or Extend Music endpoints

**Response Structure:**
\`\`\`typescript
{
  code: 200,
  msg: "success",
  data: {
    taskId: string
    parentMusicId?: string
    param: string
    response: {
      taskId: string
      sunoData: Array<{
        id: string
        audioUrl: string
        streamAudioUrl: string
        imageUrl: string
        prompt: string
        modelName: string
        title: string
        tags: string
        createTime: string
        duration: number
      }>
    }
    status: "PENDING" | "TEXT_SUCCESS" | "FIRST_SUCCESS" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED" | "CALLBACK_EXCEPTION" | "SENSITIVE_WORD_ERROR"
    type: "GENERATE" | "EXTEND" | "UPLOAD_COVER" | "UPLOAD_EXTEND"
    errorCode?: number
    errorMessage?: string
  }
}
\`\`\`

**Usage Example:**
\`\`\`typescript
const response = await fetch(`/api/suno/details/${taskId}`)
const result = await response.json()

if (result.code === 200 && result.data.status === "SUCCESS") {
  console.log("Music generation complete:", result.data.response.sunoData)
}
\`\`\`

---

### 2. Get Timestamped Lyrics
**Endpoint:** `POST /api/v1/generate/get-timestamped-lyrics`

Retrieve timestamped lyrics for synchronized display during audio playback.

**Parameters:**
- `taskId` (required): The task ID of the music generation task
- `audioId` (optional): The specific audio ID to retrieve lyrics for (takes priority over musicIndex)
- `musicIndex` (optional): The index of the track (0 or 1) within the task

**Response Structure:**
\`\`\`typescript
{
  code: 200,
  msg: "success",
  data: {
    alignedWords: Array<{
      word: string
      success: boolean
      startS: number  // Start time in seconds
      endS: number    // End time in seconds
      palign: number
    }>
    waveformData: number[]
    hootCer: number  // Lyrics alignment accuracy score
    isStreamed: boolean
  }
}
\`\`\`

**Usage Example:**
\`\`\`typescript
const response = await fetch('/api/suno/lyrics/timestamped', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: '5c79****be8e',
    audioId: 'e231****-****-****-****-****8cadc7dc',
    musicIndex: 0
  })
})

const result = await response.json()

if (result.code === 200) {
  // Display synchronized lyrics
  result.data.alignedWords.forEach(word => {
    console.log(`${word.word} (${word.startS}s - ${word.endS}s)`)
  })
}
\`\`\`

---

### 3. Boost Music Style
**Endpoint:** `POST /api/v1/style/generate`

Generate enhanced music style descriptions from simple text input.

**Parameters:**
- `content` (required): Style description in concise and clear language (e.g., "Pop, Mysterious")

**Response Structure:**
\`\`\`typescript
{
  code: 200,
  msg: "success",
  data: {
    taskId: string
    param: string
    result: string  // The final generated music style text result
    creditsConsumed: number
    creditsRemaining: number
    successFlag: "0" | "1" | "2"  // 0-pending, 1-success, 2-failed
    errorCode?: number
    errorMessage?: string
    createTime: string
  }
}
\`\`\`

**Usage Example:**
\`\`\`typescript
const response = await fetch('/api/suno/boost', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'Pop, Mysterious'
  })
})

const result = await response.json()

if (result.code === 200 && result.data.successFlag === "1") {
  console.log("Enhanced style:", result.data.result)
  console.log("Credits remaining:", result.data.creditsRemaining)
}
\`\`\`

---

## Status Codes

All endpoints follow the same status code convention:

- ✅ **200** - Request successful
- ⚠️ **400** - Invalid parameters
- ⚠️ **401** - Unauthorized access
- ⚠️ **404** - Invalid request method or path
- ⚠️ **405** - Rate limit exceeded
- ⚠️ **413** - Theme or prompt too long
- ⚠️ **429** - Insufficient credits
- ⚠️ **430** - Call frequency too high
- ⚠️ **455** - System maintenance
- ❌ **500** - Server error

---

## Authentication

All API requests require Bearer Token authentication:

\`\`\`typescript
headers: {
  'Authorization': `Bearer ${SUNO_API_KEY}`,
  'Content-Type': 'application/json'
}
\`\`\`

The API key is automatically handled by the server-side routes using the `SUNO_API_KEY` environment variable.

---

## Task Status Flow

Music generation tasks follow this status progression:

1. **PENDING** - Task created, waiting to start
2. **TEXT_SUCCESS** - Lyrics/text generation complete
3. **FIRST_SUCCESS** - First audio track generated
4. **SUCCESS** - All audio tracks generated successfully

Error states:
- **CREATE_TASK_FAILED** - Failed to create task
- **GENERATE_AUDIO_FAILED** - Audio generation failed
- **CALLBACK_EXCEPTION** - Callback processing error
- **SENSITIVE_WORD_ERROR** - Content contains sensitive words

---

## Polling for Task Completion

Use the `waitForCompletion` helper method to automatically poll for task completion:

\`\`\`typescript
import { getSunoClient } from '@/lib/suno-api'

const client = getSunoClient()
const result = await client.waitForCompletion(taskId, 600000) // 10 minute timeout

console.log("Task complete:", result)
\`\`\`

---

## Integration Checklist

- ✅ Get Music Generation Details endpoint
- ✅ Get Timestamped Lyrics endpoint
- ✅ Boost Music Style endpoint
- ✅ Proper parameter validation
- ✅ Error handling with all status codes
- ✅ TypeScript interfaces matching API spec
- ✅ Server-side API routes
- ✅ Authentication handling
- ✅ Task status polling

All endpoints are now 100% integrated and functional according to the official Suno API documentation.
