# 🎵 Suno API - Official Documentation Reference

**Base URL:** `https://api.aimusicapi.ai/api/v1`  
**Alternative (sunoapi.com):** `https://api.sunoapi.com/api/v1`  
**Documentation:** https://docs.sunoapi.com/create-suno-music

---

## 📋 Field Reference Guide

### Core Fields

#### `custom_mode` (boolean) **REQUIRED**
- **Description:** Switch for enabling custom mode
- **Custom Mode (`true`):** Control song's title, style, and lyrics via `title`, `tags`, `prompt`
- **Non-Custom Mode (`false`):** Only need `gpt_description_prompt` to describe the music

#### `mv` (string) **REQUIRED**
- **Description:** Model version for generation
- **Values:** `chirp-v3-5`, `chirp-v4`, `chirp-v4-5`, `chirp-v4-5-plus`, `chirp-v5`
- **Recommended:** `chirp-v5` (8 min duration, best quality)

---

### Custom Mode Fields (when `custom_mode = true`)

#### `prompt` (string)
- **Description:** Song lyrics
- **Required:** YES (if `custom_mode = true` and not using `auto_lyrics`)
- **Max Length:**
  - v4 and below: **3000 characters**
  - v4.5+, v4.5-plus, v5: **5000 characters**

#### `title` (string)
- **Description:** Song title
- **Required:** NO
- **Max Length:** **80 characters** (max 120 in some endpoints)

#### `tags` (string)
- **Description:** Song's style or genre
- **Required:** NO
- **Max Length:**
  - v4 and below: **200 characters**
  - v4.5+, v4.5-plus, v5: **1000 characters**

---

### Non-Custom Mode Field (when `custom_mode = false`)

#### `gpt_description_prompt` (string)
- **Description:** Description of the song
- **Required:** YES (if `custom_mode = false`)
- **Max Length:** **400 characters**

---

### Optional Fields (All Modes)

#### `make_instrumental` (boolean)
- **Description:** Generate instrumental-only music
- **Default:** `false`

#### `style_weight` (number)
- **Description:** Weight of the tags field (style)
- **Range:** `0` to `1`

#### `weirdness_constraint` (number)
- **Description:** Randomness or weirdness of the song
- **Range:** `0` to `1`

#### `negative_tags` (string)
- **Description:** Elements to avoid in your songs

#### `vocal_gender` (string)
- **Description:** Control vocal gender
- **Values:** `"f"` (Female) or `"m"` (Male)
- **Support:** `chirp-v4-5`, `chirp-v4-5-plus`, `chirp-v5`

#### `auto_lyrics` (boolean)
- **Description:** Auto generate lyrics and style
- **Requirement:** Must be used with `custom_mode: true`

#### `persona_id` (string)
- **Description:** ID of a persona created via "create persona" API
- **Usage:** Generate music based on specified persona

---

## 🎼 Task Types

#### `task_type` (string) **REQUIRED**
- **Values:**
  - `create_music` - Create new music
  - `extend_music` - Extend existing music
  - `concat_music` - Concatenate music
  - `cover_music` - Cover existing song
  - `cover_upload_music` - Cover uploaded music
  - `extend_upload_music` - Extend uploaded music
  - `persona_music` - Generate with persona

---

## 📝 API Examples

### 1️⃣ Create Music (Custom Mode)

**Endpoint:** `POST /api/v1/suno/create`

```json
{
  "custom_mode": true,
  "prompt": "[Verse]\nStars they shine above me\nMoonlight softly glows\n\n[Chorus]\nStarry night starry night\nLet your light ignite ignite",
  "title": "Starry Night",
  "tags": "pop, dreamy",
  "style_weight": 0.5,
  "weirdness_constraint": 0.5,
  "negative_tags": "piano",
  "make_instrumental": false,
  "mv": "chirp-v5"
}
```

**Response:**
```json
{
  "message": "success",
  "task_id": "468d0e42-f7a6-40ce-9a4c-37db56b13b99"
}
```

---

### 2️⃣ Create Music (No-Custom Mode)

**Endpoint:** `POST /api/v1/suno/create`

```json
{
  "custom_mode": false,
  "gpt_description_prompt": "Create a happy upbeat pop song about summer",
  "make_instrumental": false,
  "mv": "chirp-v5"
}
```

---

### 3️⃣ Create Music (Control Singer Gender)

**Endpoint:** `POST /api/v1/suno/create`

```json
{
  "custom_mode": false,
  "gpt_description_prompt": "happy song",
  "make_instrumental": false,
  "vocal_gender": "m",
  "mv": "chirp-v5"
}
```

**Note:** `vocal_gender` only supported by `chirp-v4-5`, `chirp-v4-5-plus`, `chirp-v5`

---

### 4️⃣ Create Music (Auto Lyrics Mode)

**Endpoint:** `POST /api/v1/suno/create`

```json
{
  "custom_mode": true,
  "auto_lyrics": true,
  "prompt": "happy song about friendship",
  "tags": "pop, upbeat",
  "title": "Best Friends",
  "make_instrumental": false,
  "mv": "chirp-v5"
}
```

**Note:** With `auto_lyrics: true`, you can control:
- Lyrics description (via `prompt`)
- Style description (via `tags`)
- Other advanced parameters separately

---

### 5️⃣ Extend Music

**Endpoint:** `POST /api/v1/suno/create`

**Description:** Use the clip id of the song generated on the platform to extend the song

```json
{
  "task_type": "extend_music",
  "custom_mode": true,
  "prompt": "[Verse]\nStars they shine above me\nMoonlight softly glows\n\n[Chorus]\nStarry night starry night\nLet your light ignite",
  "title": "Starry Night Extended",
  "tags": "pop",
  "continue_clip_id": "a533515b-56c9-4eb2-8cb8-7f3dfa165eb8",
  "continue_at": 30,
  "mv": "chirp-v5"
}
```

**Required Fields:**
- `task_type`: "extend_music" ✅
- `custom_mode`: true ✅
- `prompt`: Song lyrics ✅
- `continue_clip_id`: Clip ID of song to extend ✅
- `continue_at`: Starting number of seconds to extend ✅
- `mv`: Model version ✅

**Optional Fields:**
- `title`: Song title (max 120 characters)
- `tags`: Song style/genre

**Response:**
```json
{
  "message": "success",
  "task_id": "468d0e42-f7a6-40ce-9a4c-37db56b13b99"
}
```

---

### 6️⃣ Concat Music

**Endpoint:** `POST /api/v1/suno/create`

**Description:** Get the complete song corresponding to the extend operation

```json
{
  "task_type": "concat_music",
  "continue_clip_id": "a533515b-56c9-4eb2-8cb8-7f3dfa165eb8"
}
```

**Required Fields:**
- `task_type`: "concat_music" ✅
- `continue_clip_id`: The clip id you get after extend ✅

**Response:**
```json
{
  "message": "success",
  "task_id": "51bc6dd0-508a-414d-9ef3-71f7bad81cf7"
}
```

---

### 7️⃣ Cover Music

**Endpoint:** `POST /api/v1/suno/create`

**Description:** Cover the specified song (must be generated on the platform)

```json
{
  "task_type": "cover_music",
  "custom_mode": true,
  "continue_clip_id": "a2632456-62b0-405c-9de8-2ba509cf24fe",
  "prompt": "[Verse]\nStars they shine above me\nMoonlight softly glows\n\n[Chorus]\nStarry night starry night",
  "title": "Starry Night Cover",
  "tags": "pop",
  "mv": "chirp-v5"
}
```

**Required Fields:**
- `task_type`: "cover_music" ✅
- `custom_mode`: true ✅
- `continue_clip_id`: Clip ID of original song you want to cover ✅
- `prompt`: Song lyrics ✅
- `mv`: Model version ✅

**Optional Fields:**
- `title`: Song title (max 120 characters)
- `tags`: Song style/genre

**Response:**
```json
{
  "message": "success",
  "task_id": "81ed9f60-56ae-48c1-9c46-33a8220dfca7"
}
```

---

### 8️⃣ Stems Basic

**Endpoint:** `POST /api/v1/suno/stems/basic`

**Description:** Convert songs generated on the platform into 2 tracks (vocals and instruments)

```json
{
  "clip_id": "8ce9770b-ec3b-4029-a3e3-4b8db20da7d1"
}
```

**Required Fields:**
- `clip_id`: Song ID you want to get stems from ✅

**Response:**
```json
{
  "message": "success",
  "task_id": "af0b3e97-0905-4827-a3c9-a31976873120"
}
```

**Output:** 2 tracks (vocals + instruments)

---

### 9️⃣ Stems Full

**Endpoint:** `POST /api/v1/suno/stems/full`

**Description:** Convert songs generated on the platform into 12 tracks (vocals and instruments)

```json
{
  "clip_id": "8ce9770b-ec3b-4029-a3e3-4b8db20da7d1"
}
```

**Required Fields:**
- `clip_id`: Song ID you want to get stems from ✅

**Response:**
```json
{
  "message": "success",
  "task_id": "af0b3e97-0905-4827-a3c9-a31976873120"
}
```

**Output:** 12 tracks (backing vocals, drums, bass, guitar, keyboard, percussion, strings, synth, fx, brass, woodwinds, etc.)

---

### 🔟 Create Persona

**Endpoint:** `POST /api/v1/suno/persona`

**Description:** Get the virtual singer for the corresponding song

```json
{
  "clip_id": "4538ed06-ccdd-452d-b90f-c35d29150050",
  "name": "My Virtual Singer"
}
```

**Required Fields:**
- `clip_id`: Clip ID you want to make a persona from ✅
- `name`: Name for the persona ✅

**Response:**
```json
{
  "code": 200,
  "persona_id": "c08806c1-34fa-4290-a78d-0c623eb1dd1c",
  "message": "success"
}
```

**Note:** The `persona_id` can be used to create music with that virtual singer

---

### 1️⃣1️⃣ Create Music with Persona

**Endpoint:** `POST /api/v1/suno/create`

**Description:** Use the created persona id (virtual singer) to create a new song

```json
{
  "task_type": "persona_music",
  "custom_mode": true,
  "prompt": "[Verse]\nStars they shine above me\nMoonlight softly glows\n\n[Chorus]\nStarry night starry night",
  "title": "Starry Night",
  "tags": "pop",
  "persona_id": "b4ecf452-60d8-4dbd-abee-7e772f36042b",
  "mv": "chirp-v5"
}
```

**Required Fields:**
- `task_type`: "persona_music" ✅
- `custom_mode`: true ✅
- `prompt`: Song lyrics ✅
- `persona_id`: Persona ID generated by create persona endpoint ✅
- `mv`: Model version (chirp-v3-5 to chirp-v5) ✅

**Optional Fields:**
- `title`: Song title (max 120 characters)
- `tags`: Song style/genre

**Response:**
```json
{
  "message": "success",
  "task_id": "81ed9f60-56ae-48c1-9c46-33a8220dfca7"
}
```

**Note:** Persona models support chirp-v3-5, chirp-v4, chirp-v4-5, chirp-v4-5-plus (chirp-v5 may have limited support)

---

## 🔄 Model Comparison

| Model | Duration | Quality | Character Limits | Vocal Gender | Recommended |
|-------|----------|---------|------------------|--------------|-------------|
| **chirp-v3-5** | 4 min | Standard | prompt: 3000, tags: 200 | ❌ | Legacy |
| **chirp-v4** | 4 min | High | prompt: 3000, tags: 200 | ❌ | Legacy |
| **chirp-v4-5** | 8 min | Very High | prompt: 5000, tags: 1000 | ✅ | Good |
| **chirp-v4-5-plus** | 8 min | Premium | prompt: 5000, tags: 1000 | ✅ | Better |
| **chirp-v5** | 8 min | Best | prompt: 5000, tags: 1000 | ✅ | **✅ BEST** |

---

## ⚠️ Validation Rules

### Character Limits

| Field | v4 and below | v4.5+ | Notes |
|-------|--------------|-------|-------|
| `prompt` (custom mode) | 3000 | 5000 | Song lyrics |
| `tags` | 200 | 1000 | Style/genre |
| `title` | 80 | 80 | Song title (max 120 in some endpoints) |
| `gpt_description_prompt` | 400 | 400 | Non-custom mode description |

### Range Parameters

| Parameter | Range | Description |
|-----------|-------|-------------|
| `style_weight` | 0-1 | Weight of tags field |
| `weirdness_constraint` | 0-1 | Randomness/weirdness |

### Required Fields

**Custom Mode (`custom_mode = true`):**
- ✅ `mv` (model)
- ✅ `prompt` (lyrics) - unless using `auto_lyrics`
- ⚠️ `title` (recommended)
- ⚠️ `tags` (recommended)

**Non-Custom Mode (`custom_mode = false`):**
- ✅ `mv` (model)
- ✅ `gpt_description_prompt` (description)

---

## 🎯 Quick Reference

### ✅ When to use Custom Mode (`custom_mode = true`)
- You have specific lyrics (use `prompt`)
- You want exact style/genre control (use `tags`)
- You need precise title (use `title`)
- You want auto-generated lyrics from description (use `auto_lyrics + prompt`)

### ✅ When to use Non-Custom Mode (`custom_mode = false`)
- You just have an idea/description
- You want AI to generate everything
- Quick song creation (use `gpt_description_prompt`)

---

## 🔗 Official Resources

- **Dashboard:** https://aimusicapi.ai/dashboard
- **API Keys:** https://aimusicapi.ai/dashboard/apikey
- **Documentation:** https://docs.sunoapi.com/create-suno-music
- **Alternative URL:** https://api.sunoapi.com

---

**Last Updated:** October 30, 2025  
**API Version:** v1  
**Status:** ✅ Production Ready
