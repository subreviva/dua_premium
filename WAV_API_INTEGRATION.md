# WAV Format Conversion API Integration

This document describes the complete integration of the Suno API WAV format conversion endpoints.

## Endpoints Integrated

### 1. Convert to WAV Format
- **Endpoint**: `POST /api/v1/wav/generate`
- **Local Route**: `POST /api/suno/wav/convert`
- **Purpose**: Convert existing music tracks to high-quality WAV format

**Required Parameters:**
- `taskId` (string): The task ID of the music generation task
- `audioId` (string): The audio ID of the specific track to convert
- `callBackUrl` (string): The URL to receive WAV conversion completion notification

**Example Request:**
\`\`\`typescript
const response = await fetch('/api/suno/wav/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: '5c79****be8e',
    audioId: 'e231****-****-****-****-****8cadc7dc',
    callBackUrl: 'https://yourdomain.com/api/suno/callback/wav'
  })
})
\`\`\`

### 2. Get WAV Conversion Details
- **Endpoint**: `GET /api/v1/wav/record-info?taskId={taskId}`
- **Local Route**: `GET /api/suno/details/wav/[taskId]`
- **Purpose**: Retrieve detailed information about a WAV format conversion task

**Response Fields:**
- `taskId`: Task ID
- `musicId`: The ID of the source music track
- `callbackUrl`: The callback URL provided in the conversion request
- `completeTime`: Timestamp when conversion was completed
- `response.audioWavUrl`: WAV format audio file URL
- `successFlag`: Task status (PENDING, SUCCESS, CREATE_TASK_FAILED, GENERATE_WAV_FAILED, CALLBACK_EXCEPTION)
- `createTime`: Creation time
- `errorCode`: Error code (if task failed)
- `errorMessage`: Error message (if task failed)

**Example Request:**
\`\`\`typescript
const response = await fetch('/api/suno/details/wav/5c79****be8e')
const data = await response.json()
\`\`\`

### 3. WAV Conversion Callbacks
- **Local Route**: `POST /api/suno/callback/wav`
- **Purpose**: Receive WAV conversion completion notifications

**Callback Status Codes:**
- `200`: Success - WAV format conversion completed
- `400`: Bad Request - Parameter error, unsupported source audio file format
- `451`: Download Failed - Unable to download source audio file
- `500`: Server Error - Please try again later

**Callback Payload:**
\`\`\`json
{
  "code": 200,
  "msg": "success",
  "data": {
    "audioWavUrl": "https://example.com/s/04e6****e727.wav",
    "task_id": "988e****c8d3"
  }
}
\`\`\`

## Usage Example

### Complete WAV Conversion Flow

\`\`\`typescript
// 1. Start WAV conversion
const conversionResponse = await fetch('/api/suno/wav/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: 'your-music-task-id',
    audioId: 'your-audio-id',
    callBackUrl: 'https://yourdomain.com/api/suno/callback/wav'
  })
})

const { data } = await conversionResponse.json()
const wavTaskId = data.taskId

// 2. Poll for status (alternative to callback)
const checkStatus = async () => {
  const statusResponse = await fetch(`/api/suno/details/wav/${wavTaskId}`)
  const statusData = await statusResponse.json()
  
  if (statusData.data.successFlag === 'SUCCESS') {
    console.log('WAV URL:', statusData.data.response.audioWavUrl)
    return statusData.data.response.audioWavUrl
  } else if (statusData.data.successFlag === 'PENDING') {
    // Wait and check again
    setTimeout(checkStatus, 5000)
  } else {
    console.error('Conversion failed:', statusData.data.errorMessage)
  }
}

// Start polling
checkStatus()
\`\`\`

## Error Handling

The API uses standard HTTP status codes and includes detailed error messages:

- **400**: Invalid parameters or unsupported file format
- **401**: Unauthorized access (invalid API key)
- **404**: Invalid request method or path
- **409**: Conflict - WAV record already exists
- **429**: Insufficient credits
- **451**: Source audio file download failed
- **500**: Server error

## Best Practices

1. **Use Callbacks**: Callbacks are more efficient than polling for task completion
2. **Validate Parameters**: Always validate required parameters before making requests
3. **Handle Errors**: Implement proper error handling for all possible status codes
4. **Async Processing**: Download and process WAV files asynchronously to avoid blocking
5. **Storage Management**: WAV files are larger than MP3 - ensure sufficient storage space
6. **URL Expiration**: Generated WAV file URLs may have time limits - download promptly

## Integration Status

- ✅ Convert to WAV Format endpoint
- ✅ Get WAV Conversion Details endpoint
- ✅ WAV Conversion Callbacks handler
- ✅ Parameter validation
- ✅ Error handling
- ✅ TypeScript interfaces

All endpoints are fully integrated and follow the official Suno API documentation at https://docs.sunoapi.org/
