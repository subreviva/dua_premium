# Suno API Integration Guide

This document describes the complete integration of the Suno API following the official documentation at https://docs.sunoapi.org/

## Features Implemented

### 1. Add Vocals API

Layers AI-generated vocals on top of an existing instrumental track.

**Endpoint:** `POST /api/suno/vocals/add`

**Required Parameters:**
- `uploadUrl` (string): URL of the uploaded audio file to add vocals to
- `prompt` (string): Description of the audio content to generate vocals for
- `title` (string): The title of the music track
- `style` (string): The music and vocal style (e.g., "Jazz", "Classical", "Pop")
- `negativeTags` (string): Music styles or vocal traits to exclude

**Optional Parameters:**
- `vocalGender` ("m" | "f"): Preferred vocal gender
- `styleWeight` (number, 0-1): Style adherence weight
- `weirdnessConstraint` (number, 0-1): Creativity/novelty constraint
- `audioWeight` (number, 0-1): Relative weight of audio consistency
- `model` ("V4_5PLUS" | "V5"): Model version (default: V4_5PLUS)
- `callBackUrl` (string): URL to receive task completion notifications

**Example Request:**
\`\`\`typescript
const response = await fetch("/api/suno/vocals/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    uploadUrl: "https://example.com/instrumental.mp3",
    prompt: "A calm and relaxing piano track with soothing vocals",
    title: "Relaxing Piano with Vocals",
    style: "Jazz",
    negativeTags: "Heavy Metal, Aggressive Vocals",
    vocalGender: "m",
    styleWeight: 0.61,
    weirdnessConstraint: 0.72,
    audioWeight: 0.65,
    model: "V4_5PLUS",
    callBackUrl: "https://yourdomain.com/api/suno/callback/vocals"
  })
})
\`\`\`

### 2. Add Instrumental API

Generates a musical accompaniment tailored to an uploaded audio file (typically a vocal stem or melody track).

**Endpoint:** `POST /api/suno/instrumental/add`

**Required Parameters:**
- `uploadUrl` (string): URL of the uploaded music file to add instrumental to
- `title` (string): The title of the music track
- `tags` (string): Music style and characteristics for the instrumental
- `negativeTags` (string): Music styles or traits to exclude

**Optional Parameters:**
- `vocalGender` ("m" | "f"): Preferred vocal gender for any vocal elements
- `styleWeight` (number, 0-1): Style adherence weight
- `weirdnessConstraint` (number, 0-1): Creativity/novelty constraint
- `audioWeight` (number, 0-1): Relative weight of audio consistency
- `model` ("V4_5PLUS" | "V5"): Model version (default: V4_5PLUS)
- `callBackUrl` (string): URL to receive task completion notifications

**Example Request:**
\`\`\`typescript
const response = await fetch("/api/suno/instrumental/add", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    uploadUrl: "https://example.com/vocals.mp3",
    title: "Relaxing Piano",
    tags: "Relaxing Piano, Ambient, Peaceful",
    negativeTags: "Heavy Metal, Aggressive Drums",
    vocalGender: "m",
    styleWeight: 0.61,
    weirdnessConstraint: 0.72,
    audioWeight: 0.65,
    model: "V4_5PLUS",
    callBackUrl: "https://yourdomain.com/api/suno/callback/instrumental"
  })
})
\`\`\`

## Callback Handling

The Suno API uses callbacks to notify your application when tasks are completed. The callback process has three stages:

1. **text**: Text generation completed
2. **first**: First track completed
3. **complete**: All tracks completed

Note: In some cases, `text` and `first` stages may be skipped, directly returning `complete`.

### Callback Endpoints

- **General Callback:** `POST /api/suno/callback`
- **Add Vocals Callback:** `POST /api/suno/callback/vocals`
- **Add Instrumental Callback:** `POST /api/suno/callback/instrumental`

### Callback Request Format

**Success Callback:**
\`\`\`json
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
        "prompt": "[Verse] Calm and relaxing melodies",
        "model_name": "chirp-v3-5",
        "title": "Relaxing Piano",
        "tags": "relaxing, piano, jazz",
        "createTime": "2025-01-01 00:00:00",
        "duration": 198.44
      }
    ]
  }
}
\`\`\`

**Failure Callback:**
\`\`\`json
{
  "code": 400,
  "msg": "Generation failed",
  "data": {
    "callbackType": "error",
    "task_id": "2fac****9f72",
    "data": null
  }
}
\`\`\`

### Status Codes

| Code | Description |
|------|-------------|
| 200  | Success - Generation completed |
| 400  | Bad Request - Parameter error, content violation, etc. |
| 451  | Download Failed - Unable to download related files |
| 500  | Server Error - Please try again later |

## Polling Alternative

If you cannot use the callback mechanism, you can poll for task status:

\`\`\`typescript
const response = await fetch(`/api/suno/details/${taskId}`)
const result = await response.json()

if (result.code === 200 && result.data) {
  const allComplete = result.data.every(item => item.status === "complete")
  if (allComplete) {
    // All tracks completed
    console.log("Generation completed:", result.data)
  }
}
\`\`\`

We recommend polling every 30 seconds.

## Best Practices

### Callback URL Configuration

1. **Use HTTPS**: Ensure your callback URL uses HTTPS protocol for secure data transmission
2. **Verify Source**: Verify the legitimacy of the request source in callback processing
3. **Idempotent Processing**: The same taskId may receive multiple callbacks, ensure processing logic is idempotent
4. **Quick Response**: Callback processing should return a 200 status code as quickly as possible to avoid timeout
5. **Asynchronous Processing**: Complex business logic should be processed asynchronously to avoid blocking callback response
6. **Audio Processing**: Audio download and processing should be done in asynchronous tasks

### Important Reminders

- Callback URL must be a publicly accessible address
- Server must respond within 15 seconds, otherwise it will be considered a timeout
- If 3 consecutive retries fail, the system will stop sending callbacks
- Generated audio URLs may have time limits, recommend downloading and saving promptly
- Pay attention to content policy compliance to avoid generation failures due to policy violations

## Environment Variables

Make sure to set your Suno API key in your environment variables:

\`\`\`bash
SUNO_API_KEY=your_api_key_here
\`\`\`

Get your API key from: https://sunoapi.org/api-key

## Error Handling

All API routes include comprehensive error handling:

- Parameter validation
- API error responses
- Proper HTTP status codes
- Detailed error messages

Example error response:
\`\`\`json
{
  "code": 400,
  "msg": "Missing required parameters: uploadUrl, prompt",
  "data": null
}
\`\`\`

## Testing

To test the integration:

1. Upload an audio file using the file upload API
2. Call the Add Vocals or Add Instrumental API with the upload URL
3. Monitor the callback endpoint for completion notifications
4. Or poll the task status endpoint every 30 seconds

## Support

For issues or questions about the Suno API integration:
- Official Documentation: https://docs.sunoapi.org/
- API Key Management: https://sunoapi.org/api-key
