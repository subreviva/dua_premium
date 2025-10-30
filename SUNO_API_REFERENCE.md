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

### 4. Check Status
**GET** `/api/music/status?ids=task1,task2`

Poll task status with comma-separated IDs.

---

### 5. Get Credits
**GET** `/api/music/credits`

Check remaining API credits.

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
