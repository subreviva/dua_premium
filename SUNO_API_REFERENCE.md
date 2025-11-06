# Suno API - Complete Implementation Reference

## 📋 Overview

Complete implementation of Suno API v1, fully aligned with [official documentation](https://docs.sunoapi.org/).

---

## 🎵 API Endpoints

### 1. Music Generation
**POST** `/api/music/generate`

#### Required Fields
- `customMode` (boolean)
- `instrumental` (boolean)  
- `model` (V3_5|V4|V4_5|V4_5PLUS|V5)
- `callBackUrl` (string)

#### Optional Fields
- `prompt`, `style`, `title`, `personaId`, `negativeTags`
- `vocalGender` (m|f)
- `styleWeight`, `weirdnessConstraint`, `audioWeight` (0-1)

---

### 2. Extend Music
**POST** `/api/music/extend`

#### Required Fields
- `audio_id` (string)
- `default_param_flag` (boolean)
- `model` (string)
- `callBackUrl` (string)

#### Required if `default_param_flag=true`
- `prompt`, `continue_at`, `style`, `title`

#### Optional Fields
- `persona_id`, `negative_tags`, `vocal_gender`
- `style_weight`, `weirdness_constraint`, `audio_weight`

---

### 3. Upload & Cover
**POST** `/api/music/cover`

#### Required Fields
- `upload_url` (string, max 2min audio)
- `custom_mode` (boolean)
- `instrumental` (boolean)
- `model` (string)
- `callBackUrl` (string)

#### Custom Mode Requirements
- `style`, `title` (required)
- `prompt` (required if `instrumental=false`)

#### Non-custom Mode
- `prompt` (required)

---

### 4. Upload & Extend
**POST** `/api/music/upload-extend`

#### Required Fields
- `upload_url` (string, max 2min audio)
- `default_param_flag` (boolean)
- `model` (string)
- `callBackUrl` (string)

#### Required if `default_param_flag=true`
- `style`, `title`, `continue_at` (number)
- `prompt` (required if `instrumental=false`)

#### Optional Fields
- `instrumental`, `persona_id`, `negative_tags`, `vocal_gender`
- `style_weight`, `weirdness_constraint`, `audio_weight`

---

### 5. Add Instrumental
**POST** `/api/music/add-instrumental`

Generate musical accompaniment for vocals/melody.

#### Required Fields
- `upload_url` (string, vocal/melody audio)
- `title` (string)
- `tags` (string - desired style)
- `negative_tags` (string - styles to exclude)
- `model` (V4_5PLUS|V5, default: V4_5PLUS)
- `callBackUrl` (string)

#### Optional Fields
- `vocal_gender` (m|f)
- `style_weight`, `weirdness_constraint`, `audio_weight` (0-1)

---

### 6. Add Vocals
**POST** `/api/music/add-vocals`

Layer AI-generated vocals on top of an existing instrumental.

#### Required Fields
- `uploadUrl` (string, instrumental audio)
- `prompt` (string - vocal description)
- `title` (string)
- `negativeTags` (string - vocal traits to exclude)
- `style` (string - music/vocal style)
- `callBackUrl` (string)

#### Optional Fields
- `vocalGender` (m|f)
- `styleWeight`, `weirdnessConstraint`, `audioWeight` (0-1)
- `model` (V4_5PLUS|V5, default: V4_5PLUS)

---

### 7. Check Status
**GET** `/api/music/status?ids=task1,task2`

Poll task status with comma-separated IDs.

---

### 8. Get Credits
**GET** `/api/music/credits`

Check remaining API credits.

---

### 9. Get Timestamped Lyrics
**POST** `/api/music/timestamped-lyrics`

Retrieve timestamped lyrics for synchronized display during playback.

#### Required Fields
- `taskId` (string - music generation task ID)

#### Optional Fields
- `audioId` (string - specific audio ID, takes priority)
- `musicIndex` (0|1 - track index if audioId not provided)

#### Response
- `alignedWords[]` - Word-level timing info
- `waveformData[]` - For audio visualization
- `hootCer` - Alignment accuracy score
- `isStreamed` - Streaming audio flag

---

### 10. Boost Music Style
**POST** `/api/music/boost-style`

Generate enhanced style descriptions from simple inputs using AI.

#### Required Fields
- `content` (string - concise style description, max 500 chars)

#### Response
- `result` - Enhanced style description
- `creditsConsumed`, `creditsRemaining`
- `successFlag` - 0=pending, 1=success, 2=failed

#### Example
Input: "Pop, Mysterious"  
Output: "Upbeat pop with enigmatic melodies, layered synths, and haunting vocals..."

---

### 11. Generate Music Cover
**POST** `/api/music/generate-cover`

Create personalized cover images for generated music.

#### Required Fields
- `taskId` (string - original music task ID)
- `callBackUrl` (string - callback for completion)

#### Response
Returns new `taskId` for cover generation.

#### Callback Format
```json
{
  "code": 200,
  "data": {
    "taskId": "...",
    "images": ["url1.png", "url2.png"]
  }
}
```

Usually generates 2 different style cover images.

---

### 12. Replace Music Section
**POST** `/api/music/replace-section`

Replace a specific time segment within existing music.

#### Required Fields
- `taskId` (string - original task ID)
- `musicIndex` (integer - song index, 0 or 1)
- `prompt` (string - replacement content description)
- `tags` (string - music style)
- `title` (string)
- `infillStartS` (number - start time in seconds)
- `infillEndS` (number - end time in seconds, must be > infillStartS)

#### Optional Fields
- `negativeTags` (string - styles to avoid)
- `callBackUrl` (string)

#### Notes
Time range defined by infillStartS and infillEndS. Replacement blends seamlessly with existing audio.

---

### 13. Get Cover Details
**GET** `/api/music/cover-details?taskId=xxx`

Get detailed information about cover generation tasks.

#### Query Parameters
- `taskId` (string - cover generation task ID)

#### Response
- `successFlag` - 0=pending, 1=success, 2=generating, 3=failed
- `response.images[]` - Array of generated cover image URLs
- Usually 2 different style covers

---

### 14. Generate Persona
**POST** `/api/music/generate-persona`

Create a personalized music Persona with unique identity.

#### Required Fields
- `taskId` (string - from any generation endpoint)
- `musicIndex` (integer - track index, 0 or 1)
- `name` (string - Persona name)
- `description` (string - detailed characteristics)

#### Response
Returns `personaId` to use in subsequent generation requests for similar style.

#### Usage
Use personaId in Generate, Extend, Upload-Cover, or Upload-Extend endpoints.

---

### 15. Generate Lyrics
**POST** `/api/music/generate-lyrics`

Generate AI-powered lyrics without generating audio tracks.

#### Required Fields
- `prompt` (string - detailed lyrics description, max 200 words)
- `callBackUrl` (string - URL to receive results)

#### Features
- Usually generates 2 different lyrics variants
- Includes structure markers ([Verse], [Chorus], [Bridge], etc.)
- Callback notification when complete

#### Response
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "5c79****be8e"
  }
}
```

#### Callback Types
- `complete` - Lyrics generation completed
- `error` - Task failed

#### Notes
- Unlike music generation, lyrics have only one callback stage: 'complete'
- Lyrics content may contain special characters and line breaks
- Ensure proper UTF-8 encoding when handling lyrics

---

### 16. Get Lyrics Details
**GET** `/api/music/lyrics-details?taskId={taskId}`

Retrieve detailed information about a lyrics generation task.

#### Query Parameters
- `taskId` (string, required) - Task ID from Generate Lyrics

#### Status Values
- `PENDING` - Task is queued or processing
- `SUCCESS` - Lyrics generation completed successfully
- `CREATE_TASK_FAILED` - Failed to create task
- `GENERATE_LYRICS_FAILED` - Generation process failed
- `CALLBACK_EXCEPTION` - Callback error occurred
- `SENSITIVE_WORD_ERROR` - Content policy violation

#### Response Format
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "11dc****8b0f",
    "param": "{\"prompt\":\"A song about night\"}",
    "response": {
      "taskId": "11dc****8b0f",
      "data": [
        {
          "text": "[Verse]\nLyrics content here...",
          "title": "Song Title",
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
```

#### Polling Recommendation
Poll every 30 seconds until successFlag becomes `SUCCESS` or a failure state.

---

### 24. Base64 File Upload
**POST** `/api/file-upload/base64`

Upload files via Base64 encoded data to temporary storage. Files automatically deleted after 3 days.

#### Required Fields
- `base64Data` (string - Base64 encoded file data or data URL format)
- `uploadPath` (string - File upload path without leading/trailing slashes)

#### Optional Fields
- `fileName` (string - Filename with extension, random if not provided)

#### Base64 Data Formats
- Data URL format: `data:image/png;base64,iVBORw0KGgo...`
- Pure Base64 string: `iVBORw0KGgo...`

#### Response
```json
{
  "success": true,
  "code": 200,
  "msg": "File uploaded successfully",
  "data": {
    "fileName": "uploaded-image.png",
    "filePath": "images/user-uploads/uploaded-image.png",
    "downloadUrl": "https://tempfile.redpandaai.co/xxx/images/user-uploads/uploaded-image.png",
    "fileSize": 154832,
    "mimeType": "image/png",
    "uploadedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

#### File Management
- **Storage**: Temporary (3-day auto-deletion)
- **Base URL**: https://tempfile.redpandaai.co
- **Overwrite**: Same filename overwrites existing file
- **Limits**: 10 MB max (Base64 encoding adds ~33% overhead)

---

### 25. File Stream Upload
**POST** `/api/file-upload/stream`

Upload files via multipart/form-data stream. Recommended for files > 5 MB.

#### Content-Type
`multipart/form-data`

#### Form Fields
- `file` (File, required) - Binary file data
- `uploadPath` (string, required) - File upload path without leading/trailing slashes
- `fileName` (string, optional) - Filename with extension

#### Advantages
- More efficient for large files (> 5 MB)
- No Base64 encoding overhead
- Browser native file upload support
- Direct binary transfer

#### Response
```json
{
  "success": true,
  "code": 200,
  "msg": "File uploaded successfully",
  "data": {
    "fileName": "uploaded-video.mp4",
    "filePath": "videos/user-uploads/uploaded-video.mp4",
    "downloadUrl": "https://tempfile.redpandaai.co/xxx/videos/user-uploads/uploaded-video.mp4",
    "fileSize": 25641234,
    "mimeType": "video/mp4",
    "uploadedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

#### Limits
- **Max Size**: 50 MB per file
- **Storage**: Temporary (3-day auto-deletion)
- **Recommendation**: Use for files > 5 MB

---

### 26. URL File Upload
**POST** `/api/file-upload/url`

Download files from URLs and upload to temporary storage.

#### Required Fields
- `fileUrl` (string - File download URL, must be HTTP or HTTPS)
- `uploadPath` (string - File upload path without leading/trailing slashes)

#### Optional Fields
- `fileName` (string - Filename with extension, random if not provided)

#### Use Cases
- Import files from external APIs
- Copy files from public URLs
- Transfer files between services
- Download and re-host content

#### URL Requirements
- Must be valid HTTP or HTTPS URL
- Must be publicly accessible (no authentication)
- Must return binary content
- Source server must allow downloads

#### Response
```json
{
  "success": true,
  "code": 200,
  "msg": "File uploaded successfully",
  "data": {
    "fileName": "downloaded-doc.pdf",
    "filePath": "documents/downloads/downloaded-doc.pdf",
    "downloadUrl": "https://tempfile.redpandaai.co/xxx/documents/downloads/downloaded-doc.pdf",
    "fileSize": 2458912,
    "mimeType": "application/pdf",
    "uploadedAt": "2025-01-01T12:00:00.000Z"
  }
}
```

#### Limits
- **Max Size**: 50 MB per file
- **Timeout**: 60 seconds download timeout
- **Redirects**: Follows redirects automatically

#### Supported File Formats (All Methods)
- **Images**: jpg, png, gif, webp, svg, bmp, ico
- **Audio**: mp3, wav, ogg, m4a, flac, aac
- **Video**: mp4, webm, mov, avi, mkv
- **Documents**: pdf, doc, docx, txt, csv, json
- **Archives**: zip, rar, tar, gz

---

## 🔄 Callbacks

---

### 17. Convert to WAV Format
**POST** `/api/music/convert-wav`

Convert existing music tracks to high-quality WAV format.

#### Required Fields
- `taskId` (string - music generation task ID)
- `audioId` (string - specific track ID to convert)
- `callBackUrl` (string - URL to receive completion notification)

#### Features
- High-quality lossless WAV format
- Uncompressed audio (5-10x larger than MP3)
- Suitable for professional audio production
- Callback notification when conversion completes

#### Response
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "988e****c8d3"
  }
}
```

#### Callback Format (Success)
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "audioWavUrl": "https://example.com/s/04e6****e727.wav",
    "task_id": "988e****c8d3"
  }
}
```

#### Notes
- WAV files are significantly larger than MP3
- Download URLs may have time limits
- Ensure adequate storage space

---

### 18. Get WAV Conversion Details
**GET** `/api/music/wav-details?taskId={taskId}`

Retrieve detailed information about a WAV conversion task.

#### Query Parameters
- `taskId` (string, required) - Task ID from Convert to WAV

#### Status Values
- `PENDING` - Conversion in progress
- `SUCCESS` - Conversion completed successfully
- `CREATE_TASK_FAILED` - Failed to create task
- `GENERATE_WAV_FAILED` - Conversion failed
- `CALLBACK_EXCEPTION` - Callback error

#### Response Format
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "988e****c8d3",
    "musicId": "8551****662c",
    "callbackUrl": "https://api.example.com/callback",
    "completeTime": "2025-01-01 00:10:00",
    "response": {
      "audioWavUrl": "https://example.com/s/04e6****e727.wav"
    },
    "successFlag": "SUCCESS",
    "createTime": "2025-01-01 00:00:00"
  }
}
```

#### Polling Recommendation
Poll every 30 seconds until successFlag becomes `SUCCESS` or a failure state.

---

### 21. Create Music Video
**POST** `/api/music/create-video`

Generate MP4 music videos with animated visualizations, album artwork, and customizable branding.

#### Required Fields
- `taskId` (string - unique task identifier)
- `audioId` (string - ID of audio track to create video for)

#### Optional Fields
- `callBackUrl` (string - URL for completion notifications)
- `author` (string - max 50 chars, displayed prominently in video)
- `domainName` (string - max 50 chars, subtle bottom watermark)

#### Video Format
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD)
- **Features**: Animated waveforms, album artwork, metadata display
- **Processing**: 2-5 minutes depending on track length
- **Availability**: S3 download URL valid for 7 days

#### Branding Options
- `author`: Displayed prominently at video start and end
- `domainName`: Subtle watermark at bottom throughout video
- Use cases: Content creators, record labels, music platforms

#### Response
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "taskId": "vid_abc123"
  }
}
```

---

### 22. Get Music Video Details
**GET** `/api/music/video-details?taskId={taskId}`

Poll video generation status and retrieve download URL.

#### Query Parameters
- `taskId` (string, required) - Task ID from create-video response

#### Status Values (successFlag)
- `PENDING` - Video generation in progress (2-5 minutes typical)
- `SUCCESS` - Video ready, videoUrl available for download
- `CREATE_TASK_FAILED` - Failed to initialize generation task
- `GENERATE_MP4_FAILED` - Failed during video rendering
- `CALLBACK_EXCEPTION` - Callback notification failed (video may still be available)

#### Response Format
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "taskId": "vid_abc123",
    "musicId": "audio_xyz789",
    "callbackUrl": "https://your-domain.com/webhook",
    "musicIndex": 0,
    "completeTime": "2025-01-30T12:34:56Z",
    "response": {
      "videoUrl": "https://example.com/s/video_abc123.mp4"
    },
    "successFlag": "SUCCESS",
    "createTime": "2025-01-30T12:30:00Z"
  }
}
```

#### Video Details
- File size: Typically 20-100 MB depending on duration
- URL expires after 7 days from completion
- No authentication required for download
- Save video to your storage for permanent access

#### Polling Recommendation
Poll every 30 seconds until successFlag becomes `SUCCESS` or a failure state.

---

### 23. Get Remaining Credits
**GET** `/api/music/credits`

Retrieve current credit balance for your Suno API account.

#### No Parameters Required

#### Response
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "credits": 1500,
    "usedCredits": 2500,
    "totalCredits": 4000
  }
}
```

#### Credit Consumption

**Music Generation:**
- Generate music (custom mode): 10 credits
- Generate music (description mode): 5 credits
- Extend audio: 10 credits
- Upload audio: 1 credit

**Audio Processing:**
- Convert to WAV: 5 credits
- Vocal separation (separate_vocal): 5 credits
- Stem separation (split_stem): 10 credits
- Style enhancement: 5 credits
- Cover creation: 10 credits

**Content Creation:**
- Generate lyrics: 2 credits
- Create music video: 5 credits
- Replace music section: 10 credits

**Persona Management:**
- Generate persona: 1 credit
- Delete persona: 0 credits (free)

**Information Retrieval:**
- Get any details/status: 0 credits (free)

#### Usage Monitoring
- Call before expensive operations to check balance
- Implement credit threshold alerts (e.g., notify when < 50 credits)
- Track consumption patterns for billing
- Cache response for 1-5 minutes to avoid excessive API calls

#### Best Practices
- Check credits before batch operations
- Implement graceful degradation when credits low
- Set up automated top-up when balance is low
- Log credit consumption for analytics

---

## 🔄 Callbacks

---

### 19. Separate Vocals & Instruments
**POST** `/api/music/separate-vocals`

AI-powered stem separation for vocals and instruments using state-of-the-art source separation.

#### Required Fields
- `taskId` (string - music generation task ID)
- `audioId` (string - specific track ID to separate)
- `callBackUrl` (string - URL to receive results)

#### Optional Fields
- `type` (string - separation type)
  - `separate_vocal` (default): Basic vocal/instrumental separation (2 stems)
  - `split_stem`: Advanced multi-instrument separation (12+ stems)

#### Separation Types

**separate_vocal** (default):
- Vocal track (isolated vocals only)
- Instrumental track (accompaniment without vocals)
- Faster processing (~1-2 minutes)

**split_stem** (advanced):
- Vocals, Backing Vocals, Drums, Bass, Guitar
- Keyboard, Percussion, Strings, Synthesizer
- Effects, Brass, Woodwinds
- Longer processing (~3-5 minutes)

#### Response
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "3e63b4cc88d52611159371f6af5571e7"
  }
}
```

#### Callback Format (separate_vocal)
```json
{
  "code": 200,
  "msg": "vocal Removal generated successfully.",
  "data": {
    "task_id": "3e63b4cc88d52611159371f6af5571e7",
    "vocal_removal_info": {
      "instrumental_url": "https://file.aiquickdraw.com/s/xxx_Instrumental.mp3",
      "vocal_url": "https://file.aiquickdraw.com/s/xxx_Vocals.mp3",
      "origin_url": ""
    }
  }
}
```

#### Notes
- State-of-the-art AI source separation
- Best results with high-quality source audio
- split_stem produces 12+ separate files
- Not all stems may be present in every track

---

### 20. Get Vocal Separation Details
**GET** `/api/music/vocal-separation-details?taskId={taskId}`

Retrieve detailed information about a vocal/stem separation task.

#### Query Parameters
- `taskId` (string, required) - Task ID from Separate Vocals

#### Status Values
- `PENDING` - Separation in progress
- `SUCCESS` - Separation completed successfully
- `CREATE_TASK_FAILED` - Failed to create task
- `GENERATE_AUDIO_FAILED` - Separation failed
- `CALLBACK_EXCEPTION` - Callback error

#### Response Format (separate_vocal)
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "3e63b4cc88d52611159371f6af5571e7",
    "musicId": "376c687e-d439-42c1-b1e4-bcb43b095ec2",
    "response": {
      "instrumentalUrl": "https://...Instrumental.mp3",
      "vocalUrl": "https://...Vocals.mp3"
    },
    "successFlag": "SUCCESS",
    "completeTime": "1753782937000"
  }
}
```

#### Response Format (split_stem)
```json
{
  "response": {
    "vocalUrl": "https://...Vocals.mp3",
    "backingVocalsUrl": "https://...Backing_Vocals.mp3",
    "drumsUrl": "https://...Drums.mp3",
    "bassUrl": "https://...Bass.mp3",
    "guitarUrl": "https://...Guitar.mp3",
    "keyboardUrl": "https://...Keyboard.mp3",
    "percussionUrl": "https://...Percussion.mp3",
    "stringsUrl": "https://...Strings.mp3",
    "synthUrl": "https://...Synth.mp3",
    "fxUrl": "https://...FX.mp3",
    "brassUrl": "https://...Brass.mp3",
    "woodwindsUrl": "https://...Woodwinds.mp3"
  }
}
```

#### Polling Recommendation
Poll every 30 seconds. separate_vocal: 1-2 min, split_stem: 3-5 min.

---

## 🔔 Callbacks

Format:
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "callbackType": "complete",
    "task_id": "xxx",
    "data": [{ /* track info */ }]
  }
}
```

**Types**: `text`, `first`, `complete`, `error`  
**Codes**: 200 (success), 400 (bad request), 451 (download failed), 500 (error)

---

## 🎨 Model Versions

| Model | Max Duration | Features |
|-------|--------------|----------|
| V5 | 4-8 min | Fastest, best expression |
| V4_5PLUS | 8 min | Richest sound |
| V4_5 | 8 min | Smart prompts |
| V4 | 4 min | Best quality |
| V3_5 | 4 min | Solid arrangements |

---

## 📏 Limits

**Prompts (Custom Mode lyrics):**
- V3_5/V4: 3000 chars
- V4_5+/V5: 5000 chars

**Prompts (Non-custom):** 500 chars

**Style/Tags:**
- V3_5/V4: 200 chars
- V4_5+/V5: 1000 chars

**Title:**
- V3_5/V4: 80 chars
- V4_5+/V5: 100 chars

---

## 🚀 Quick Start

```bash
# Set API key
export SUNO_API_KEY=your_key

# Generate music
curl -X POST https://domain.com/api/music/generate \
  -d '{"prompt":"Calm piano","style":"Classical","customMode":true,"instrumental":true,"model":"V5"}'

# Check status  
curl https://domain.com/api/music/status?ids=task_id
```

---

## ✅ Status

All endpoints: **100% Complete**
- Music Generation ✅
- Music Extension ✅
- Upload & Cover ✅
- Upload & Extend ✅
- Add Instrumental ✅
- Add Vocals ✅
- Timestamped Lyrics ✅
- Boost Style ✅
- Generate Cover ✅
- Replace Section ✅
- Cover Details ✅
- Generate Persona ✅
- Generate Lyrics ✅
- Get Lyrics Details ✅
- Convert to WAV ✅
- Get WAV Details ✅
- Separate Vocals/Stems ✅
- Get Separation Details ✅
- Create Music Video ✅
- Get Video Details ✅
- Get Remaining Credits ✅
- Base64 File Upload ✅
- Stream File Upload ✅
- URL File Upload ✅
- Status Polling ✅
- Callbacks ✅
- All Models ✅

**Total**: 27 API features (26 endpoints + callbacks)

---

## 📚 Docs

- [SETUP.md](./SETUP.md) - Configuration
- [SUNO_CALLBACKS.md](./SUNO_CALLBACKS.md) - Callback details
- [Official Docs](https://docs.sunoapi.org/) - Suno API

---

**Updated**: Oct 30, 2025 | **API**: v1 | **Status**: Complete ✅
