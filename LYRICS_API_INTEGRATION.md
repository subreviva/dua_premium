# Lyrics Generation API Integration

This document describes the complete integration of the Suno Lyrics Generation API following the official documentation at https://docs.sunoapi.org/

## Endpoints Implemented

### 1. Generate Lyrics
**Endpoint:** `POST /api/suno/lyrics/generate`

Creates lyrics for music using AI models without generating audio tracks.

**Required Parameters:**
- `prompt` (string): Detailed description of desired lyrics content (max 200 words)
- `callBackUrl` (string): URL to receive lyrics generation results when complete

**Response:**
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "5c79****be8e"
  }
}
\`\`\`

**Example Usage:**
\`\`\`typescript
const response = await fetch('/api/suno/lyrics/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A song about peaceful night in the city',
    callBackUrl: 'https://your-domain.com/api/suno/callback/lyrics'
  })
})
\`\`\`

### 2. Get Lyrics Generation Details
**Endpoint:** `GET /api/suno/details/lyrics/{taskId}`

Retrieves detailed information about a lyrics generation task.

**Parameters:**
- `taskId` (string): Task ID from the generate lyrics endpoint

**Response:**
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "11dc****8b0f",
    "param": "{\"prompt\":\"A song about peaceful night in the city\"}",
    "response": {
      "taskId": "11dc****8b0f",
      "data": [
        {
          "text": "[Verse]\n我穿越城市黑暗夜\n心中燃烧梦想的烈火",
          "title": "钢铁侠",
          "status": "complete",
          "errorMessage": ""
        }
      ]
    },
    "status": "SUCCESS",
    "type": "LYRICS",
    "errorCode": null,
    "errorMessage": null
  }
}
\`\`\`

**Task Status Values:**
- `PENDING`: Task is pending
- `SUCCESS`: Lyrics generation completed successfully
- `CREATE_TASK_FAILED`: Failed to create task
- `GENERATE_LYRICS_FAILED`: Lyrics generation failed
- `CALLBACK_EXCEPTION`: Callback delivery failed
- `SENSITIVE_WORD_ERROR`: Content policy violation

### 3. Lyrics Generation Callbacks
**Endpoint:** `POST /api/suno/callback/lyrics`

Receives callback notifications when lyrics generation tasks complete.

**Callback Types:**
- `complete`: Lyrics generation finished successfully
- `error`: Task failed

**Success Callback Format:**
\`\`\`json
{
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "taskId": "11dc****8b0f",
    "data": [
      {
        "text": "[Verse]\nWalking through the city's darkest night\nWith dreams burning like a blazing fire",
        "title": "Iron Man",
        "status": "complete",
        "errorMessage": ""
      }
    ]
  }
}
\`\`\`

**Error Callback Format:**
\`\`\`json
{
  "code": 400,
  "msg": "Lyrics generation failed",
  "data": {
    "callbackType": "error",
    "taskId": "11dc****8b0f",
    "data": null
  }
}
\`\`\`

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Lyrics generation completed |
| 400 | Bad Request - Parameter error, content violation |
| 401 | Unauthorized - Invalid API key |
| 404 | Not Found - Invalid endpoint |
| 405 | Rate limit exceeded |
| 413 | Prompt too long (exceeds 200 words) |
| 429 | Insufficient credits |
| 430 | Call frequency too high |
| 451 | Download Failed - Unable to download files |
| 455 | System maintenance |
| 500 | Server Error |

## Implementation Notes

1. **Callback URL**: Must be publicly accessible and respond within 15 seconds
2. **Idempotency**: Same taskId may receive multiple callbacks, ensure processing is idempotent
3. **Prompt Length**: Maximum 200 words, validated before submission
4. **Callback Stages**: Unlike music generation, lyrics callbacks have only `complete` and `error` stages
5. **Content Policy**: Lyrics content must comply with content policies to avoid generation failures
6. **Encoding**: Lyrics may contain special characters, ensure UTF-8 encoding

## Best Practices

1. Use HTTPS for callback URLs
2. Verify request source in callback processing
3. Return 200 status quickly to avoid timeout
4. Process complex logic asynchronously
5. Store lyrics content promptly to database or file system
6. Handle all error codes appropriately
7. Implement retry logic for failed callbacks

## Alternative: Polling

If callbacks cannot be used, poll the details endpoint every 30 seconds:

\`\`\`typescript
async function pollLyricsStatus(taskId: string) {
  const maxAttempts = 40 // 20 minutes max
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const response = await fetch(`/api/suno/details/lyrics/${taskId}`)
    const result = await response.json()
    
    if (result.data.status === 'SUCCESS') {
      return result.data.response.data
    }
    
    if (['CREATE_TASK_FAILED', 'GENERATE_LYRICS_FAILED', 'CALLBACK_EXCEPTION', 'SENSITIVE_WORD_ERROR'].includes(result.data.status)) {
      throw new Error(result.data.errorMessage || 'Lyrics generation failed')
    }
    
    await new Promise(resolve => setTimeout(resolve, 30000))
    attempts++
  }
  
  throw new Error('Lyrics generation timeout')
}
\`\`\`

## Environment Variables

Ensure `SUNO_API_KEY` is set in your environment:

\`\`\`bash
SUNO_API_KEY=your_api_key_here
\`\`\`

## Testing

Test the integration with:

\`\`\`bash
# Generate lyrics
curl -X POST http://localhost:3000/api/suno/lyrics/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A song about peaceful night in the city",
    "callBackUrl": "https://your-domain.com/api/suno/callback/lyrics"
  }'

# Get lyrics details
curl http://localhost:3000/api/suno/details/lyrics/TASK_ID
