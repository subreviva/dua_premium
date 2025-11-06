# Suno API Complete Integration

This document provides a comprehensive overview of all integrated Suno API endpoints following the official documentation at https://docs.sunoapi.org/

## New Features Integrated

### 1. Replace Music Section

Replace a specific time segment within existing music.

**Endpoint**: `POST /api/suno/replace-section`

**Parameters**:
- `taskId` (required): Original task ID (parent task)
- `musicIndex` (required): Music index (0 or 1)
- `prompt` (required): Prompt for generating the replacement segment
- `tags` (required): Music style tags
- `title` (required): Music title
- `negativeTags` (optional): Excluded music styles
- `infillStartS` (required): Start time point for replacement (seconds, 2 decimal places)
- `infillEndS` (required): End time point for replacement (seconds, 2 decimal places)
- `callBackUrl` (optional): Callback URL for task completion

**Example**:
\`\`\`typescript
const response = await fetch('/api/suno/replace-section', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: '2fac****9f72',
    musicIndex: 0,
    prompt: 'A calm and relaxing piano track.',
    tags: 'Jazz',
    title: 'Relaxing Piano',
    negativeTags: 'Rock',
    infillStartS: 10.5,
    infillEndS: 20.75,
    callBackUrl: 'https://example.com/callback'
  })
})
\`\`\`

**Callback Handler**: `POST /api/suno/callback/replace-section`

### 2. Generate Music Cover

Create personalized cover images for generated music.

**Endpoint**: `POST /api/suno/cover/generate`

**Parameters**:
- `taskId` (required): Original music task ID
- `callBackUrl` (required): URL for receiving cover generation completion updates

**Example**:
\`\`\`typescript
const response = await fetch('/api/suno/cover/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: '73d6128b3523a0079df10da9471017c8',
    callBackUrl: 'https://api.example.com/callback'
  })
})
\`\`\`

**Callback Handler**: `POST /api/suno/callback/cover`

### 3. Get Music Cover Details

Get detailed information about music cover generation tasks.

**Endpoint**: `GET /api/suno/cover/details/[taskId]`

**Example**:
\`\`\`typescript
const response = await fetch('/api/suno/cover/details/21aee3c3c2a01fa5e030b3799fa4dd56')
const data = await response.json()
\`\`\`

**Response**:
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "21aee3c3c2a01fa5e030b3799fa4dd56",
    "parentTaskId": "73d6128b3523a0079df10da9471017c8",
    "callbackUrl": "https://api.example.com/callback",
    "completeTime": "2025-01-15T10:35:27.000Z",
    "response": {
      "images": [
        "https://tempfile.aiquickdraw.com/s/1753958521_6c1b3015141849d1a9bf17b738ce9347.png",
        "https://tempfile.aiquickdraw.com/s/1753958524_c153143acc6340908431cf0e90cbce9e.png"
      ]
    },
    "successFlag": 1,
    "createTime": "2025-01-15T10:33:01.000Z",
    "errorCode": 200,
    "errorMessage": ""
  }
}
\`\`\`

### 4. Generate Persona

Create a personalized music Persona based on generated music.

**Endpoint**: `POST /api/suno/persona/generate`

**Parameters**:
- `taskId` (required): Unique identifier of the original music generation task
- `musicIndex` (required): Index of the music track (0 or 1)
- `name` (required): Name for the Persona
- `description` (required): Detailed description of the Persona's musical characteristics

**Example**:
\`\`\`typescript
const response = await fetch('/api/suno/persona/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: '5c79****be8e',
    musicIndex: 0,
    name: 'Electronic Pop Singer',
    description: 'A modern electronic music style pop singer, skilled in dynamic rhythms and synthesizer tones'
  })
})
\`\`\`

**Response**:
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "personaId": "a1b2****c3d4",
    "name": "Electronic Pop Singer",
    "description": "A modern electronic music style pop singer, skilled in dynamic rhythms and synthesizer tones"
  }
}
\`\`\`

## Callback Mechanisms

### Replace Section Callbacks

The system sends callbacks at the following times:
- **Complete**: When the replacement task is fully completed
- **Error**: When the replacement task fails

**Callback Format**:
\`\`\`json
{
  "code": 200,
  "msg": "All generated successfully.",
  "data": {
    "callbackType": "complete",
    "task_id": "2fac****9f72",
    "data": [
      {
        "id": "e231****-****-****-****-****8cadc7dc",
        "audio_url": "https://example.cn/****.mp3",
        "stream_audio_url": "https://example.cn/****",
        "image_url": "https://example.cn/****.jpeg",
        "prompt": "A calm and relaxing piano track.",
        "model_name": "chirp-v3-5",
        "title": "Relaxing Piano",
        "tags": "Jazz",
        "createTime": "2025-01-01 00:00:00",
        "duration": 198.44
      }
    ]
  }
}
\`\`\`

### Cover Generation Callbacks

The system sends callbacks when:
- Cover generation task completed successfully
- Cover generation task failed
- Error occurred during task processing

**Success Callback Format**:
\`\`\`json
{
  "code": 200,
  "data": {
    "images": [
      "https://tempfile.aiquickdraw.com/s/1753958521_6c1b3015141849d1a9bf17b738ce9347.png",
      "https://tempfile.aiquickdraw.com/s/1753958524_c153143acc6340908431cf0e90cbce9e.png"
    ],
    "taskId": "21aee3c3c2a01fa5e030b3799fa4dd56"
  },
  "msg": "success"
}
\`\`\`

## Status Codes

All endpoints follow the standard Suno API status codes:

- **200**: Success - Request processed successfully
- **400**: Validation error - Request parameters invalid
- **401**: Unauthorized - Authentication credentials missing or invalid
- **402**: Insufficient credits - Account doesn't have enough credits
- **404**: Not found - Requested resource or endpoint doesn't exist
- **409**: Conflict - Record already exists
- **422**: Validation error - Request parameters failed validation checks
- **429**: Rate limited - Request rate limit exceeded
- **451**: Unauthorized - Failed to retrieve resource
- **455**: Service unavailable - System currently undergoing maintenance
- **500**: Server error - Unexpected error occurred
- **501**: Generation failed
- **531**: Server error - Generation failed, credits refunded

## Best Practices

1. **Always use HTTPS** for callback URLs in production
2. **Validate callback sources** to ensure legitimacy
3. **Implement idempotent processing** using taskId to handle duplicate callbacks
4. **Return 200 status code quickly** from callback handlers to avoid timeout
5. **Process complex logic asynchronously** to avoid blocking callback response
6. **Download and save images promptly** as URLs may have validity periods
7. **Implement retry mechanisms** for failed operations
8. **Log all operations** for debugging and monitoring

## Error Handling

All API routes include comprehensive error handling:
- Parameter validation before API calls
- Detailed error messages in responses
- Proper HTTP status codes
- Console logging for debugging

## Testing

To test the integration:

1. **Replace Section**:
   \`\`\`bash
   curl -X POST http://localhost:3000/api/suno/replace-section \
     -H "Content-Type: application/json" \
     -d '{"taskId":"YOUR_TASK_ID","musicIndex":0,"prompt":"Test","tags":"Jazz","title":"Test","infillStartS":10,"infillEndS":20}'
   \`\`\`

2. **Generate Cover**:
   \`\`\`bash
   curl -X POST http://localhost:3000/api/suno/cover/generate \
     -H "Content-Type: application/json" \
     -d '{"taskId":"YOUR_TASK_ID","callBackUrl":"https://your-callback-url.com"}'
   \`\`\`

3. **Generate Persona**:
   \`\`\`bash
   curl -X POST http://localhost:3000/api/suno/persona/generate \
     -H "Content-Type: application/json" \
     -d '{"taskId":"YOUR_TASK_ID","musicIndex":0,"name":"Test Persona","description":"A test persona"}'
   \`\`\`

## Environment Variables

Ensure the following environment variable is set:

\`\`\`env
SUNO_API_KEY=your_suno_api_key_here
\`\`\`

## Next Steps

To use these features in your UI:
1. Import the API client methods from `@/lib/suno-api`
2. Call the appropriate endpoints from your components
3. Handle responses and update UI accordingly
4. Set up callback endpoints to receive real-time updates
5. Implement proper error handling and user feedback
