# Suno API Callbacks - Implementation Guide

## Overview

The Suno API uses callbacks to notify your application when music generation tasks are completed. This eliminates the need for constant polling.

## Callback Endpoints

### Primary Callback Endpoints

1. **`/api/music/callback`** - Legacy endpoint for backward compatibility
2. **`/api/suno/callback`** - New comprehensive callback handler
3. **`/api/callback`** - Global callback endpoint

All endpoints follow the same callback format as specified in the official Suno API documentation.

## Callback Format

### Success Callback
```json
{
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "task_id": "2fac****9f72",
    "data": [
      {
        "id": "8551****662c",
        "audio_url": "https://example.cn/****.mp3",
        "source_audio_url": "https://example.cn/****.mp3",
        "stream_audio_url": "https://example.cn/****",
        "source_stream_audio_url": "https://example.cn/****",
        "image_url": "https://example.cn/****.jpeg",
        "source_image_url": "https://example.cn/****.jpeg",
        "prompt": "[Verse] Night city lights shining bright",
        "model_name": "chirp-v3-5",
        "title": "Iron Man",
        "tags": "electrifying, rock",
        "createTime": "2025-01-01 00:00:00",
        "duration": 198.44
      }
    ]
  }
}
```

### Callback Types

| Type | Description |
|------|-------------|
| `text` | Text/lyrics generation completed |
| `first` | First music track completed |
| `complete` | All music tracks completed |
| `error` | Task failed |

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Music generation completed |
| 400 | Bad Request - Parameter error, content violation, etc. |
| 451 | Download Failed - Unable to download related files |
| 500 | Server Error - Please try again later |

## Implementation Details

### Automatic Callback URL Configuration

All music generation endpoints automatically configure the callback URL:

```typescript
const callBackUrl = `${new URL(request.url).origin}/api/music/callback`

const payload = {
  prompt: "...",
  customMode: true,
  instrumental: false,
  model: "V5",
  callBackUrl, // Automatically set
}
```

### Callback Handler Features

1. **Comprehensive Logging**: All callbacks are logged with detailed information
2. **Error Handling**: Graceful error handling to avoid Suno retry loops
3. **Type Detection**: Identifies callback type (text, first, complete, error)
4. **Track Details**: Logs individual track information on completion

### Example Callback Processing

```typescript
export async function POST(request: Request) {
  const body = await request.json()
  const { code, msg, data } = body
  const { callbackType, task_id, data: musicData } = data || {}
  
  if (code === 200 && callbackType === 'complete') {
    // Process completed music tracks
    musicData.forEach((track) => {
      console.log('Track:', track.title, track.audio_url)
      // Store in database, trigger notifications, etc.
    })
  }
  
  // Always return 200 to confirm receipt
  return NextResponse.json({ status: 'received' })
}
```

## Best Practices

### ✅ DO

- Return HTTP 200 status code quickly (< 15 seconds)
- Process callbacks asynchronously for complex operations
- Implement idempotent processing (same taskId may arrive multiple times)
- Log all callbacks for debugging
- Verify callback authenticity in production
- Download audio files immediately (URLs may expire)

### ❌ DON'T

- Block callback response with long-running operations
- Return error status codes (causes Suno to retry)
- Process the same taskId multiple times without checks
- Store API responses without validation
- Expose sensitive information in logs

## Current Implementation Status

### ✅ Implemented
- Callback endpoints for all music generation routes
- Proper callback format handling per official docs
- Comprehensive logging and error handling
- Automatic callBackUrl configuration
- Multiple callback type support (text, first, complete, error)

### 📊 Monitoring
- Check server logs to see incoming callbacks:
  ```bash
  # Search for callback logs
  grep "Suno Callback" logs
  ```

### 🔄 Polling Fallback
If callbacks fail, the UI automatically polls `/api/music/status` every 3 seconds as a fallback mechanism.

## Testing Callbacks

### Local Testing with ngrok
```bash
# Start ngrok tunnel
ngrok http 3000

# Use ngrok URL as callback in requests
https://your-ngrok-url.ngrok.io/api/music/callback
```

### Production Testing
Callbacks work automatically on Vercel deployments:
```
https://your-app.vercel.app/api/music/callback
```

## Troubleshooting

### Callback Not Received
1. Check firewall/network settings
2. Verify callback URL is publicly accessible
3. Check server logs for errors
4. Ensure endpoint returns 200 within 15 seconds

### Duplicate Callbacks
- Implement idempotent processing using taskId
- Check if same taskId is processed multiple times
- Use database or cache to track processed tasks

### Callback Timeouts
- Move heavy processing to background jobs
- Return 200 immediately, process async
- Optimize database queries
- Use queue systems for complex workflows

## Related Documentation

- [Official Suno API Docs](https://docs.sunoapi.org/)
- [Music Generation Guide](./SUNO_API_COMPLETE.md)
- [API Integration Guide](./API_INTEGRATION_COMPLETE.md)
