# Producer API - Official Documentation

**Base Path:** `/api/v1/producer/*`  
**API Version:** v1  
**Status:** ✅ Production Ready

---

## 🎯 Overview

Producer API provides advanced AI-powered music generation with **Suno v5-level quality at lightning speed**. Powered by the FUZZ-2.0 model, generate professional-grade tracks in ~30 seconds.

### Key Features

- 🎵 **High-Quality Music Generation** - Studio-quality output matching Suno v5 standards
- 🧠 **Advanced AI Models** - FUZZ-2.0 model with exceptional quality and efficiency
- ⚡ **Ultra-Fast Generation** - ~30 second generation time (vs 2-3 minutes on other platforms)
- 🔁 **Multiple Operations** - Create, extend, cover, replace, swap vocals/sound, variations
- 🧩 **Simple Interface** - Just `sound` and `lyrics` parameters
- 💰 **Predictable Pricing** - Flat 10 credits per task

---

## 🔐 Authentication & Base URL

- **Base URL:** `https://api.sunoapi.com/api/v1/producer`
- **Alternative:** `https://api.aimusicapi.ai/api/v1/producer`
- **Required Headers:**
  - `Authorization: Bearer <YOUR_API_KEY>`
  - `Content-Type: application/json`

---

## 💰 Pricing & Rate Limits

| Operation | Cost | Notes |
|-----------|------|-------|
| Create/Extend/Cover/Replace/Swap/Variation | 10 credits | Per task |
| Upload/Download | 2 credits | Per task |
| Query Task Status | FREE | No credit cost |

---

## 📋 API Endpoints

### 1️⃣ **Create Music**

Generate new music tracks with vocals or instrumentals.

**Endpoint:** `POST /api/v1/producer/create`

**Request Body:**

```json
{
  "task_type": "create_music",
  "mv": "FUZZ-2.0",
  "sound": "emotional pop with gentle piano, warm synths, and a catchy beat",
  "lyrics": "[Verse 1]\nWalking through the city lights...\n\n[Chorus]\nThis is our moment\nThis is our time",
  "title": "City Dreams",
  "make_instrumental": false,
  "lyrics_strength": 0.5,
  "sound_strength": 0.5,
  "weirdness": 0.5,
  "seed": "optional-seed-123",
  "cover_url": "https://example.com/cover.jpg"
}
```

**Response:**

```json
{
  "message": "success",
  "task_id": "6d7253ac-916e-49a8-b288-91ffa7f8a8cd"
}
```

---

### 2️⃣ **Extend Music**

Continue an existing track from a specific timestamp.

**Request Body:**

```json
{
  "task_type": "extend_music",
  "clip_id": "abc123-previous-clip-id",
  "mv": "FUZZ-2.0",
  "sound": "add soaring strings and uplifting orchestral build",
  "lyrics": "[Outro]\nThis is just the beginning...",
  "starts_at": 45
}
```

---

### 3️⃣ **Cover Music**

Create a new version with different style or arrangement.

**Request Body:**

```json
{
  "task_type": "cover_music",
  "clip_id": "abc123-original-clip-id",
  "mv": "FUZZ-2.0",
  "sound": "acoustic folk version with fingerstyle guitar and warm vocals",
  "lyrics": "[Verse 1]\nSame lyrics, different style...",
  "cover_strength": 0.8,
  "cover_url": "https://example.com/acoustic-cover.jpg"
}
```

---

### 4️⃣ **Replace Music Section**

Replace a specific segment with new content.

**Request Body:**

```json
{
  "task_type": "replace_music",
  "clip_id": "abc123-clip-id",
  "mv": "FUZZ-2.0",
  "sound": "heavy distorted guitar riff with driving drums",
  "lyrics": "[Bridge]\nBreak the chains\nFeel no pain",
  "starts_at": 30,
  "ends_at": 45
}
```

**Note:** Omit `ends_at` to replace until the end of the track.

---

### 5️⃣ **Swap Music Vocals**

Replace vocal performance while keeping instrumentals.

**Request Body:**

```json
{
  "task_type": "swap_music_vocals",
  "clip_id": "abc123-clip-id",
  "mv": "FUZZ-2.0",
  "sound": "smooth male pop vocal with subtle autotune effect",
  "lyrics": "[Verse 1]\nNew or same lyrics...",
  "cover_strength": 0.9
}
```

---

### 6️⃣ **Swap Music Sound**

Replace instrumental arrangement while keeping vocals.

**Request Body:**

```json
{
  "task_type": "swap_music_sound",
  "clip_id": "abc123-clip-id",
  "mv": "FUZZ-2.0",
  "sound": "ambient atmospheric pads with soft piano melodies",
  "lyrics": "[Verse 1]\nKeep same lyrics usually...",
  "cover_strength": 0.6
}
```

---

### 7️⃣ **Music Variation**

Generate a different version with similar characteristics.

**Request Body:**

```json
{
  "task_type": "music_variation",
  "clip_id": "abc123-clip-id",
  "mv": "FUZZ-2.0"
}
```

**Note:** Minimal parameters required - creates variation of the original.

---

### 8️⃣ **Upload Music**

Upload your own audio for processing.

**Endpoint:** `POST /api/v1/producer/upload`

**Request Body:**

```json
{
  "audio_url": "https://example.com/audio/song.mp3"
}
```

**Response:**

```json
{
  "message": "success",
  "task_id": "29906f02-2366-4218-b25a-41458e1d60e0"
}
```

**Cost:** 2 credits

---

### 9️⃣ **Download Music**

Export track to MP3 or WAV format.

**Endpoint:** `POST /api/v1/producer/download`

**Request Body:**

```json
{
  "clip_id": "370c650a-88cd-4f4b-960d-801e686c8a7a",
  "format": "mp3"
}
```

**Response:**

```json
{
  "message": "success",
  "task_id": "29906f02-2366-4218-b25a-41458e1d60e0"
}
```

**Formats:** `mp3`, `wav`  
**Cost:** 2 credits

---

### 🔟 **Get Music (Task Polling)**

Poll for task completion and retrieve results.

**Endpoint:** `GET /api/v1/producer/task/{task_id}`

**Response (Success - 200):**

```json
{
  "code": 200,
  "data": [
    {
      "clip_id": "74dc7bf7-56bf-457c-a4a3-3fa12f05d727",
      "title": "City Dreams",
      "sound": "emotional pop with gentle piano",
      "lyrics": "[Verse 1]\n...",
      "image_url": "https://storage.googleapis.com/.../image.jpg",
      "audio_url": "https://storage.googleapis.com/.../audio.m4a",
      "video_url": null,
      "created_at": "2025-10-01T08:49:47.934443Z",
      "mv": "FUZZ-2.0",
      "seed": "3966900172",
      "duration": 185.0165986394558,
      "state": "succeeded"
    }
  ],
  "message": "success"
}
```

**Response (Processing - 202):**

```json
{
  "code": 202,
  "type": "not_ready",
  "error": "Task is still processing. Please wait a few seconds and try again."
}
```

**State Values:**
- `pending` - Task queued
- `running` - Generation in progress
- `succeeded` - Completed successfully

**Recommended Polling:** Every 5-10 seconds

---

## 📝 Parameter Reference

### Required Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_type` | string | Operation type (see task types below) |
| `mv` | string | Model version (default: `FUZZ-2.0`) |

### Task Types

- `create_music` - Generate new track
- `extend_music` - Continue existing track
- `cover_music` - Reimagine existing track
- `replace_music` - Replace section of track
- `swap_music_vocals` - Replace vocal performance
- `swap_music_sound` - Replace instrumental arrangement
- `music_variation` - Generate alternative version

### Optional Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sound` | string | - | Audio style prompt (required if `lyrics` empty) |
| `lyrics` | string | - | Song lyrics (required if `sound` empty) |
| `make_instrumental` | boolean | false | Generate instrumental only |
| `title` | string | - | Track title (max 80 characters) |
| `cover_url` | string | - | Custom cover image URL |
| `seed` | string | - | Random seed for reproducibility |
| `lyrics_strength` | number | 0.5 | Lyrics adherence (0-1) |
| `sound_strength` | number | 0.5 | Sound prompt strength (0.2-1) |
| `weirdness` | number | 0.5 | Creative variation (0-1) |
| `clip_id` | string | - | Parent clip ID (required for extend/cover/replace/swap/variation) |
| `starts_at` | number | 30 | Start time in seconds (extend/replace) |
| `ends_at` | number | - | End time in seconds (replace only) |
| `cover_strength` | number | - | Cover intensity (0-1) for cover/swap operations |

### Model Versions

- **FUZZ-2.0 Pro** - Latest model with best quality
- **FUZZ-2.0** (Default) - Default model
- **FUZZ-2.0 Raw** - Raw output without post-processing
- **FUZZ-1.1 Pro** - Enhanced version of 1.1
- **FUZZ-1.1** - Stable production model
- **FUZZ-1.0 Pro** - Enhanced version of 1.0
- **FUZZ-1.0** - Previous stable release
- **FUZZ-0.8** - Legacy model

---

## 🚨 Critical Input Guidelines

### Sound Parameter

✅ **DO:**
- Provide detailed, descriptive prompts (10+ words)
- Use specific musical terminology
- Include genre, instruments, mood, tempo
- Example: "upbeat electronic dance music with energetic synths, pulsing bass, and driving four-on-the-floor beat"

❌ **DON'T:**
- Use vague text ("music", "song", "test")
- Submit random characters
- Leave empty unless lyrics provided

### Lyrics Parameter

✅ **DO:**
- Provide complete, well-structured lyrics (20-30 words minimum)
- Include verse/chorus markers `[Verse 1]`, `[Chorus]`
- Write meaningful, coherent lyrics

❌ **DON'T:**
- Submit incomplete fragments or single words
- Use nonsensical text
- Submit test strings ("test", "aaa", "123")

**Why This Matters:** Low-quality input may result in task failures and wasted credits.

---

## 💡 Best Practices

### Polling Strategy

- **Recommended interval:** 5-10 seconds
- **Fast completion:** Most tasks complete in 30-60 seconds
- **Timeout:** Consider 2-3 minute timeout
- **Error handling:** Implement exponential backoff

### Optimization Tips

- **Production use:** FUZZ-2.0 Pro for best balance
- **Reproducibility:** Use `seed` parameter for consistent results
- **Fine-tuning:** Adjust `sound_strength` (0.2-1.0) and `lyrics_strength` (0-1.0)
- **Creative control:** Use `weirdness` sparingly (0-1.0)

### Parameter Tuning

**lyrics_strength:**
- 0-0.3: Very loose interpretation, more melodic freedom
- 0.4-0.6: Balanced approach
- 0.7-1.0: Strict lyrical fidelity

**sound_strength:**
- 0.2-0.4: Loose interpretation of style
- 0.5-0.7: Balanced adherence
- 0.8-1.0: Strict adherence

**weirdness:**
- 0-0.3: Conventional, predictable
- 0.4-0.6: Moderate creativity
- 0.7-1.0: Experimental, unconventional

**cover_strength:**
- 0.2-0.5: Subtle reinterpretation
- 0.6-0.8: Moderate transformation
- 0.9-1.0: Dramatic reimagining

---

## 📊 HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Task completed successfully |
| 202 | Accepted | Task still processing |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Invalid/missing API key |
| 403 | Forbidden | Insufficient credits |
| 404 | Not Found | Task not found |
| 500 | Internal Server Error | Server error |

---

## 🎯 Complete Examples

### Example 1: Create Emotional Pop Song

```bash
curl -X POST https://api.sunoapi.com/api/v1/producer/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "create_music",
    "mv": "FUZZ-2.0",
    "sound": "emotional pop with gentle piano, warm synths, and catchy beat",
    "lyrics": "[Verse 1]\nWalking through the city lights\nFeeling the rhythm of the night\n\n[Chorus]\nThis is our moment\nThis is our time\nWe'\''re alive tonight",
    "title": "City Dreams",
    "lyrics_strength": 0.7,
    "sound_strength": 0.6
  }'
```

### Example 2: Extend with Outro

```bash
curl -X POST https://api.sunoapi.com/api/v1/producer/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "extend_music",
    "clip_id": "abc123-clip-id",
    "mv": "FUZZ-2.0",
    "sound": "gradual fade out with ambient reverb",
    "lyrics": "[Outro]\nFading into the night\nHolding on tight",
    "starts_at": 90
  }'
```

### Example 3: Acoustic Cover

```bash
curl -X POST https://api.sunoapi.com/api/v1/producer/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "task_type": "cover_music",
    "clip_id": "abc123-clip-id",
    "mv": "FUZZ-2.0",
    "sound": "stripped down acoustic with fingerpicked guitar and raw vocals",
    "cover_strength": 0.8,
    "title": "Acoustic Version"
  }'
```

### Example 4: Upload and Process

```bash
# Step 1: Upload
curl -X POST https://api.sunoapi.com/api/v1/producer/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/audio/song.mp3"
  }'

# Response: {"message": "success", "task_id": "..."}

# Step 2: Poll for completion
curl -X GET https://api.sunoapi.com/api/v1/producer/task/TASK_ID \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example 5: Download as WAV

```bash
curl -X POST https://api.sunoapi.com/api/v1/producer/download \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "clip_id": "370c650a-88cd-4f4b-960d-801e686c8a7a",
    "format": "wav"
  }'
```

---

## 🔄 Complete Workflow Example

```typescript
// Step 1: Create initial track
const createResponse = await fetch('https://api.sunoapi.com/api/v1/producer/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task_type: 'create_music',
    mv: 'FUZZ-2.0',
    sound: 'indie rock with jangly guitars',
    lyrics: '[Verse 1]\nCity lights...\n\n[Chorus]\nTake me away',
    title: 'City Lights'
  })
});
const { task_id } = await createResponse.json();

// Step 2: Poll for completion
let result;
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`https://api.sunoapi.com/api/v1/producer/task/${task_id}`, {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });
  result = await statusResponse.json();
  
  if (result.code === 200 && result.data[0].state === 'succeeded') {
    clearInterval(pollInterval);
    console.log('Completed!', result.data[0].audio_url);
    
    // Step 3: Create acoustic version
    const coverResponse = await fetch('https://api.sunoapi.com/api/v1/producer/create', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task_type: 'cover_music',
        clip_id: result.data[0].clip_id,
        mv: 'FUZZ-2.0',
        sound: 'intimate acoustic with fingerstyle guitar',
        cover_strength: 0.7
      })
    });
  }
}, 10000); // Poll every 10 seconds
```

---

## 📋 Quick Reference

| Operation | Required Fields | Optional Fields |
|-----------|----------------|-----------------|
| Create | task_type, mv, sound/lyrics | title, make_instrumental, cover_url, seed, strengths |
| Extend | task_type, mv, clip_id, sound/lyrics | starts_at, title |
| Cover | task_type, mv, clip_id, sound/lyrics | cover_strength, cover_url, title |
| Replace | task_type, mv, clip_id, sound/lyrics, starts_at | ends_at |
| Swap Vocals | task_type, mv, clip_id, sound, lyrics | cover_strength |
| Swap Sound | task_type, mv, clip_id, sound, lyrics | cover_strength |
| Variation | task_type, mv, clip_id | - |
| Upload | audio_url | - |
| Download | clip_id, format | - |

---

## 🆘 Support

**Discord:** https://discord.gg/UFT2J2XK7d

---

**End of Producer API Documentation**
