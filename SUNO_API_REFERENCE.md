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
- Status Polling ✅
- Callbacks ✅
- All Models ✅

---

## 📚 Docs

- [SETUP.md](./SETUP.md) - Configuration
- [SUNO_CALLBACKS.md](./SUNO_CALLBACKS.md) - Callback details
- [Official Docs](https://docs.sunoapi.org/) - Suno API

---

**Updated**: Oct 30, 2025 | **API**: v1 | **Status**: Complete ✅
