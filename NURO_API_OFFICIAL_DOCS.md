# Nuro API - Complete Official Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication & Endpoints](#authentication--endpoints)
3. [Pricing & Rate Limits](#pricing--rate-limits)
4. [API Operations](#api-operations)
5. [Parameter Reference](#parameter-reference)
6. [Critical Input Guidelines](#critical-input-guidelines)
7. [Best Practices](#best-practices)
8. [HTTP Status Codes](#http-status-codes)
9. [Complete Workflow Examples](#complete-workflow-examples)
10. [Quick Reference](#quick-reference)

---

## Overview

Nuro is a high-efficiency music generation model jointly developed by MusicAPI and a technology company. It can generate a complete 4-minute song in just 30 seconds.

### Key Features
- ⚡ **Rapid Generation**: Complete a 4-minute song in 30 seconds
- 💼 **Commercial Usage**: No copyright restrictions, ready for commercial use
- 🎛️ **High Customization**: Support for multiple parameter adjustments
- 💳 **Credit Consumption**: 10 credits per generation
- 🌐 **Language support**: Currently supports Chinese and English
- 🎵 **Instrumental Music Mode**: Supports generating **pure instrumental tracks** with rich genre and emotional control
- 📦 **Version Support**: v1.0 (Classic) and v2.0 (Enhanced with Structure Control)

### Generation Capabilities
| Music Type | Duration | Generation Time | Credits |
|------------|----------|-----------------|---------|
| Vocal Song | 30-240s | ~30s | 10 |
| BGM v1.0 | 1-60s | ~30s | 10 |
| BGM v2.0 | 30-120s | ~30s | 10 |

---

## Authentication & Endpoints

### Base URLs
- **Primary**: `https://api.aimusicapi.ai/api/v1/nuro`
- **Secondary**: `https://api.sunoapi.com/api/v1/nuro`

### Authentication
```http
Authorization: Bearer YOUR_API_KEY
```

### Available Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/create` | POST | Create vocal song or BGM |
| `/task/{task_id}` | GET | Poll task status (FREE) |

---

## Pricing & Rate Limits

### Credit Costs
- **Create Music**: 10 credits (vocal/bgm, any version)
- **Get Music**: FREE (polling)

### Rate Limits
- Standard API rate limits apply
- Recommend 5-10 second polling intervals

---

## API Operations

### 1. Create Vocal Song

**Purpose**: Generate songs with vocals and lyrics

**Endpoint**: `POST /api/v1/nuro/create`

**Request Body**:
```json
{
  "type": "vocal",
  "lyrics": "Your complete song lyrics here (300-2000 characters)",
  "genre": "Pop",
  "mood": "Happy",
  "gender": "Female",
  "timbre": "Warm",
  "duration": 120
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | ✅ | Must be "vocal" |
| lyrics | string | ✅ | Complete lyrics (300-2000 chars) |
| genre | string | ✅ | Music genre (see reference) |
| mood | string | ✅ | Emotional mood (see reference) |
| gender | string | ✅ | "Female" or "Male" |
| timbre | string | ✅ | Vocal timbre (see reference) |
| duration | integer | ✅ | Duration in seconds (30-240) |

**Response**:
```json
{
  "message": "success",
  "task_id": "b1eac403-06cb-4e58-971d-835d3b321508"
}
```

**curl Example**:
```bash
curl -X POST https://api.sunoapi.com/api/v1/nuro/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "vocal",
    "lyrics": "[verse]\nWe were both young when I first saw you\nI close my eyes and the flashback starts\n[chorus]\nMarry me Juliet\nYou will never have to be alone",
    "genre": "Pop",
    "mood": "Dynamic/Energetic",
    "gender": "Female",
    "timbre": "Sweet_AUDIO_TIMBRE",
    "duration": 180
  }'
```

---

### 2. Create BGM v1.0 (Classic)

**Purpose**: Generate instrumental background music with traditional parameters

**Endpoint**: `POST /api/v1/nuro/create`

**Request Body**:
```json
{
  "type": "bgm",
  "version": "v1.0",
  "description": "Upbeat corporate background music for presentation",
  "duration": 45,
  "genre": ["corporate", "upbeat"],
  "mood": ["positive", "energetic"],
  "instrument": ["piano", "guitar"],
  "theme": ["business", "motivational"]
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | ✅ | Must be "bgm" |
| version | string | ❌ | "v1.0" (default if omitted) |
| description | string | ✅ | Music description |
| duration | integer | ✅ | Duration in seconds (1-60) |
| genre | string[] | ❌ | Up to 5 genres (see reference) |
| mood | string[] | ❌ | Up to 5 moods (see reference) |
| instrument | string[] | ❌ | Up to 5 instruments (see reference) |
| theme | string[] | ❌ | Up to 5 themes (see reference) |

**Response**:
```json
{
  "message": "success",
  "task_id": "c2fbac404-17dc-5f69-082e-946e4c432619"
}
```

**curl Example**:
```bash
curl -X POST https://api.sunoapi.com/api/v1/nuro/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bgm",
    "version": "v1.0",
    "description": "Intense and tense game battle background music with epic momentum",
    "genre": ["video game", "electronic", "epic", "cinematic"],
    "mood": ["powerful", "energetic", "intense", "aggressive"],
    "instrument": ["drums", "synth", "brass", "strings"],
    "theme": ["achievement", "fantasy", "drama"],
    "duration": 35
  }'
```

---

### 3. Create BGM v2.0 (Enhanced with Structure)

**Purpose**: Generate instrumental music with custom segment structure

**Endpoint**: `POST /api/v1/nuro/create`

**Request Body (with segments)**:
```json
{
  "type": "bgm",
  "version": "v2.0",
  "description": "Cinematic trailer music with dramatic build-up",
  "segments": [
    {
      "name": "intro",
      "duration": 15
    },
    {
      "name": "verse",
      "duration": 30
    },
    {
      "name": "chorus",
      "duration": 45
    },
    {
      "name": "outro",
      "duration": 10
    }
  ]
}
```

**Request Body (simple, no segments)**:
```json
{
  "type": "bgm",
  "version": "v2.0",
  "description": "Peaceful meditation music for relaxation app",
  "duration": 60
}
```

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | ✅ | Must be "bgm" |
| version | string | ✅ | Must be "v2.0" for enhanced features |
| description | string | ✅ | Music description (under 200 chars) |
| duration | integer | ⚠️ | Duration (30-120s) - omit if using segments |
| segments | object[] | ❌ | Custom structure segments |
| segments[].name | string | ✅ | Segment type (see reference) |
| segments[].duration | integer | ✅ | Segment duration (5-120s) |

**Available Segment Types**:
- `intro` - Introduction section
- `verse` - Verse section
- `chorus` - Chorus/refrain section
- `inst` - Instrumental section
- `bridge` - Bridge section
- `outro` - Outro/ending section

**Segment Duration Rules**:
- Individual segment: 5-120 seconds (30s minimum if only one segment)
- Total duration: 30-120 seconds
- Multiple segments allowed for complex structures

**Response**:
```json
{
  "message": "success",
  "task_id": "d3gcd515-28ed-6g70-193f-a57f5d543720"
}
```

**curl Example**:
```bash
curl -X POST https://api.sunoapi.com/api/v1/nuro/create \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bgm",
    "version": "v2.0",
    "description": "Cinematic background score",
    "segments": [
      {"name": "intro", "duration": 20},
      {"name": "verse", "duration": 25},
      {"name": "chorus", "duration": 30},
      {"name": "outro", "duration": 15}
    ]
  }'
```

---

### 4. Get Music (Polling)

**Purpose**: Poll task status and retrieve generated music

**Endpoint**: `GET /api/v1/nuro/task/{task_id}`

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| task_id | string | ✅ | Task ID from create response |

**Response (pending/running)**:
```json
{
  "task_id": "4c35433b-1649-433d-b513-8422af70fbaa",
  "status": "running",
  "progress": 45,
  "audio_url": "",
  "lyrics": "",
  "duration": 0,
  "genre": "",
  "mood": "",
  "gender": "",
  "timbre": ""
}
```

**Response (succeeded)**:
```json
{
  "task_id": "4c35433b-1649-433d-b513-8422af70fbaa",
  "status": "succeeded",
  "progress": 100,
  "audio_url": "https://cdn.musicapi.ai/storage/v1/object/public/songs/song-4c35433b-1649-433d-b513-8422af70fbaa.wav",
  "lyrics": "[intro]\n[verse]\nWe were both young when I first saw you...",
  "duration": 199.04325,
  "genre": "Pop",
  "mood": "Dynamic/Energetic",
  "gender": "Female",
  "timbre": "Sweet_AUDIO_TIMBRE"
}
```

**Status Values**:
- `pending` - Task queued
- `running` - Generation in progress
- `succeeded` - Music ready (audio_url available)
- `failed` - Generation failed

**curl Example**:
```bash
curl -X GET https://api.sunoapi.com/api/v1/nuro/task/4c35433b-1649-433d-b513-8422af70fbaa \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Parameter Reference

### Vocal Song Genres (23 options)
| Category | Genres |
|----------|--------|
| Pop Music | Pop, Pop Rock, Pop Punk, Pop Rap |
| Traditional | Folk, Chinese Style, GuFeng Music |
| Electronic | Electronic, DJ, Future Bass, Chinoiserie Electronic |
| Hip-Hop | Hip Hop/Rap, Trap Rap, R&B Rap |
| Others | Rock, Jazz, R&B/Soul, Punk, Reggae, Disco, Jazz Pop, Bossa Nova, Contemporary R&B |

### Vocal Song Moods (13 options)
| Category | Moods |
|----------|-------|
| Positive | Happy, Dynamic/Energetic, Inspirational/Hopeful, Excited |
| Relaxing | Chill, Calm/Relaxing, Dreamy/Ethereal |
| Emotional | Sentimental/Melancholic/Lonely, Nostalgic/Memory, Sorrow/Sad, Romantic, Miss |
| Rhythmic | Groovy/Funky |

### Vocal Song Timbres (9 options)
| Category | Timbres |
|----------|---------|
| Basic | Warm, Bright, Husky |
| Special | Electrified voice, Sweet_AUDIO_TIMBRE, Cute_AUDIO_TIMBRE |
| Power | Loud and sonorous, Powerful |
| Style | Sexy/Lazy |

### BGM Genres (50 options, max 5 per request)
```
corporate, dance/edm, orchestral, chill out, rock, hip hop, folk, funk, ambient,
holiday, jazz, kids, world, travel, commercial, advertising, driving, cinematic,
upbeat, epic, inspiring, business, video game, dark, pop, trailer, modern,
electronic, documentary, soundtrack, fashion, acoustic, movie, tv, high tech,
industrial, dance, video, vlog, marketing, game, radio, promotional, sports,
party, summer, beauty
```

### BGM Moods (52 options, max 5 per request)
```
positive, uplifting, energetic, happy, bright, optimistic, hopeful, cool, dreamy,
fun, light, powerful, calm, confident, joyful, dramatic, peaceful, playful, soft,
groovy, reflective, easy, relaxed, lively, smooth, romantic, intense, elegant,
mellow, emotional, sentimental, cheerful happy, contemplative, soothing, proud,
passionate, sweet, mystical, tranquil, cheerful, casual, beautiful, ethereal,
melancholy, sad, aggressive, haunting, adventure, serene, sincere, funky, funny
```

### BGM Instruments (25 options, max 5 per request)
```
piano, drums, guitar, percussion, synth, electric guitar, acoustic guitar,
bass guitar, brass, violin, cello, flute, organ, trumpet, ukulele, saxophone,
double bass, harp, glockenspiel, synthesizer, keyboard, marimba, bass, banjo, strings
```

### BGM Themes (28 options, max 5 per request)
```
inspirational, motivational, achievement, discovery, every day, love, technology,
lifestyle, journey, meditation, drama, children, hope, fantasy, holiday, health,
family, real estate, media, kids, science, education, progress, world, vacation,
training, christmas, sales
```

---

## Critical Input Guidelines

### For Vocal Songs
| Validation | Requirement | Example |
|------------|-------------|---------|
| Lyrics Length | 300-2000 characters | Full song lyrics with verses/chorus |
| Lyrics Quality | Complete song structure | Use [verse], [chorus], [bridge] tags |
| Genre | From allowed list | "Pop", "Rock", "Hip Hop/Rap" |
| Mood | From allowed list | "Happy", "Dynamic/Energetic" |
| Gender | "Female" or "Male" | Exact string match required |
| Timbre | From allowed list | "Warm", "Sweet_AUDIO_TIMBRE" |
| Duration | 30-240 seconds | Appropriate for lyrics length |

### For BGM v1.0
| Validation | Requirement | Example |
|------------|-------------|---------|
| Description | Clear, descriptive text | "Upbeat corporate background music" |
| Duration | 1-60 seconds | Short background tracks |
| Genre | Max 5 from list | ["corporate", "upbeat", "modern"] |
| Mood | Max 5 from list | ["positive", "energetic", "hopeful"] |
| Instrument | Max 5 from list | ["piano", "guitar", "drums"] |
| Theme | Max 5 from list | ["business", "motivational"] |

### For BGM v2.0
| Validation | Requirement | Example |
|------------|-------------|---------|
| Description | Under 200 characters | "Cinematic trailer music" |
| Version | Must be "v2.0" | Explicit version declaration |
| Duration | 30-120 seconds (if no segments) | Longer than v1.0 |
| Segments | Optional but powerful | Array of segment objects |
| Segment Name | Must be valid type | "intro", "verse", "chorus", "bridge", "inst", "outro" |
| Segment Duration | 5-120s individual, 30-120s total | Balanced structure |

---

## Best Practices

### 1. Polling Strategy
```typescript
async function pollNuroTask(taskId: string, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await nuroClient.getMusic(taskId);
    
    if (status.status === 'succeeded') {
      return status;
    }
    
    if (status.status === 'failed') {
      throw new Error('Generation failed');
    }
    
    // Wait 5 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  throw new Error('Timeout waiting for music generation');
}
```

### 2. Parameter Selection
- **Vocal Songs**: Ensure lyrics match duration (roughly 1 line per 3-4 seconds)
- **BGM v1.0**: Use complementary parameters (e.g., "corporate" + "motivational" + "piano")
- **BGM v2.0**: Design segment structure before submission for natural flow

### 3. Error Handling
```typescript
try {
  const response = await nuroClient.createVocalMusic({
    type: 'vocal',
    lyrics: fullLyrics,
    genre: 'Pop',
    mood: 'Happy',
    gender: 'Female',
    timbre: 'Warm',
    duration: 120
  });
  
  // Poll for result
  const result = await pollNuroTask(response.task_id);
  console.log('Audio URL:', result.audio_url);
  
} catch (error) {
  if (error.statusCode === 400) {
    console.error('Invalid parameters:', error.message);
  } else if (error.statusCode === 403) {
    console.error('Insufficient credits or rate limit');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### 4. Version Selection
- **Use v1.0** when:
  - Need short BGM (1-60s)
  - Traditional parameter control is sufficient
  - Compatibility is priority

- **Use v2.0** when:
  - Need longer BGM (30-120s)
  - Want structural control (intro/verse/chorus/outro)
  - Enhanced description processing is beneficial

---

## HTTP Status Codes

| Status Code | Type | Description |
|-------------|------|-------------|
| 200 | Success | Request successful |
| 202 | Processing | Task accepted, still processing |
| 400 | Bad Request | Invalid parameters or validation error |
| 401 | Unauthorized | Invalid API key or expired token |
| 403 | Forbidden | Insufficient credits or rate limit exceeded |
| 404 | Not Found | Task ID not found |
| 500 | Server Error | Internal API error (eligible for credit refund) |

### Error Response Format
```json
{
  "type": "bad_request",
  "message": "Duration must be between 30 and 240 seconds for vocal songs",
  "refund_processed": false
}
```

### Credit Refund Triggers
Automatic refunds occur for these error types:
- `api_error` - System errors
- `timeout` - Processing timeout
- `bad_request` - Validation errors (in some cases)
- `forbidden` - Queue full or system issues

---

## Complete Workflow Examples

### Example 1: Vocal Song Generation (TypeScript)

```typescript
import { NuroAPIClient } from './lib/nuro-api';

const nuroClient = new NuroAPIClient({
  apiKey: process.env.NURO_API_KEY!
});

async function generateVocalSong() {
  try {
    // Step 1: Create vocal song
    const createResponse = await nuroClient.createVocalMusic({
      type: 'vocal',
      lyrics: `[verse]
We were both young when I first saw you
I close my eyes and the flashback starts
I'm standing there on a balcony in summer air

[chorus]
And I said marry me Juliet
You'll never have to be alone
I love you and that's all I really know

[verse]
You were Romeo, you were throwing pebbles
And my daddy said stay away from Juliet

[chorus]
It's a love story baby just say yes`,
      genre: 'Pop',
      mood: 'Dynamic/Energetic',
      gender: 'Female',
      timbre: 'Sweet_AUDIO_TIMBRE',
      duration: 180
    });

    console.log('Task created:', createResponse.task_id);

    // Step 2: Poll for completion
    let attempts = 0;
    const maxAttempts = 60;

    while (attempts < maxAttempts) {
      const status = await nuroClient.getMusic(createResponse.task_id);
      
      console.log(`Progress: ${status.progress}%`);

      if (status.status === 'succeeded') {
        console.log('✅ Song generated successfully!');
        console.log('Audio URL:', status.audio_url);
        console.log('Duration:', status.duration, 'seconds');
        return status;
      }

      if (status.status === 'failed') {
        throw new Error('Song generation failed');
      }

      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Timeout waiting for song generation');

  } catch (error) {
    console.error('Error generating vocal song:', error);
    throw error;
  }
}

// Run the function
generateVocalSong();
```

### Example 2: BGM v2.0 with Segments (TypeScript)

```typescript
async function generateStructuredBGM() {
  try {
    // Step 1: Create BGM with custom structure
    const createResponse = await nuroClient.createBGMMusic({
      type: 'bgm',
      version: 'v2.0',
      description: 'Epic cinematic trailer music with dramatic build-up and powerful climax',
      segments: [
        { name: 'intro', duration: 15 },
        { name: 'verse', duration: 25 },
        { name: 'chorus', duration: 40 },
        { name: 'bridge', duration: 10 },
        { name: 'outro', duration: 10 }
      ]
    });

    console.log('BGM task created:', createResponse.task_id);

    // Step 2: Poll for completion
    let attempts = 0;
    while (attempts < 60) {
      const status = await nuroClient.getMusic(createResponse.task_id);
      
      if (status.status === 'succeeded') {
        console.log('✅ BGM generated!');
        console.log('Audio URL:', status.audio_url);
        return status;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

  } catch (error) {
    console.error('Error generating BGM:', error);
  }
}
```

### Example 3: BGM v1.0 with Parameters (TypeScript)

```typescript
async function generateGameBGM() {
  try {
    const createResponse = await nuroClient.createBGMMusic({
      type: 'bgm',
      version: 'v1.0',
      description: 'Intense battle music for action game with epic orchestral elements',
      duration: 45,
      genre: ['video game', 'electronic', 'epic', 'cinematic'],
      mood: ['powerful', 'energetic', 'intense', 'aggressive'],
      instrument: ['drums', 'synth', 'brass', 'strings'],
      theme: ['achievement', 'fantasy', 'drama']
    });

    console.log('Task ID:', createResponse.task_id);
    
    // Poll and download
    const result = await pollUntilComplete(createResponse.task_id);
    console.log('BGM ready:', result.audio_url);
    
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## Quick Reference

### Vocal Song Quick Start
```typescript
const result = await nuroClient.createVocalMusic({
  type: 'vocal',
  lyrics: 'Complete lyrics here (300-2000 chars)',
  genre: 'Pop',
  mood: 'Happy',
  gender: 'Female',
  timbre: 'Warm',
  duration: 120
});
```

### BGM v2.0 Quick Start (Simple)
```typescript
const result = await nuroClient.createBGMMusic({
  type: 'bgm',
  version: 'v2.0',
  description: 'Peaceful meditation music',
  duration: 60
});
```

### BGM v2.0 Quick Start (With Segments)
```typescript
const result = await nuroClient.createBGMMusic({
  type: 'bgm',
  version: 'v2.0',
  description: 'Cinematic trailer',
  segments: [
    { name: 'intro', duration: 20 },
    { name: 'chorus', duration: 40 },
    { name: 'outro', duration: 10 }
  ]
});
```

### BGM v1.0 Quick Start
```typescript
const result = await nuroClient.createBGMMusic({
  type: 'bgm',
  version: 'v1.0',
  description: 'Corporate background music',
  duration: 30,
  genre: ['corporate', 'upbeat'],
  mood: ['positive', 'energetic'],
  instrument: ['piano', 'guitar']
});
```

### Polling Quick Start
```typescript
const status = await nuroClient.getMusic(taskId);
if (status.status === 'succeeded') {
  console.log(status.audio_url);
}
```

---

## Migration Guide

### Upgrading from v1.0 to v2.0 BGM

**Minimal Changes Required**:
```typescript
// Add version parameter
{
  type: 'bgm',
  version: 'v2.0',  // Add this line
  description: 'Your description',
  duration: 60
}
```

**To Use New Segment Features**:
```typescript
{
  type: 'bgm',
  version: 'v2.0',
  description: 'Your description',
  segments: [  // Add this for structure control
    { name: 'intro', duration: 15 },
    { name: 'verse', duration: 30 },
    { name: 'outro', duration: 15 }
  ]
  // Remove 'duration' field when using segments
}
```

---

## Summary

Nuro API provides three main music generation modes:

1. **Vocal Songs**: Full songs with lyrics and vocals (30-240s, 10 credits)
2. **BGM v1.0**: Quick instrumental tracks with parameter control (1-60s, 10 credits)
3. **BGM v2.0**: Enhanced instrumental with structural control (30-120s, 10 credits)

All generations complete in ~30 seconds and are ready for commercial use with no copyright restrictions.

For support and updates, refer to the official API documentation or contact MusicAPI support.
