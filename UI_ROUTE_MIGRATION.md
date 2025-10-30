# 🎯 UI Route Updates - Complete Migration

**Date:** October 30, 2025  
**Status:** ✅ All routes migrated from `/api/suno/*` to `/api/music/*`

---

## 🔄 Routes Updated

### 1. Credits Endpoint
**Before:**
```typescript
await fetch("/api/suno/credits")
// Response: { code: 200, data: { credits: 500 } }
```

**After:**
```typescript
await fetch("/api/music/credits")
// Response: { success: true, data: { credits: 500 } }
```

---

### 2. Generate/Create Music
**Before:**
```typescript
await fetch("/api/suno/generate", {
  method: "POST",
  body: JSON.stringify(params)
})
// Response: { code: 200, data: { taskId: "..." } }
```

**After:**
```typescript
await fetch("/api/music/custom", {
  method: "POST",
  body: JSON.stringify(params)
})
// Response: { success: true, data: { task_id: "..." } }
```

---

### 3. Upload Audio (Cover/Extend)
**Before:**
```typescript
// Two different endpoints
const endpoint = mode === "custom" 
  ? "/api/suno/upload/cover" 
  : "/api/suno/upload/extend"
  
await fetch(endpoint, {
  method: "POST",
  body: JSON.stringify({ uploadUrl, prompt, ... })
})
```

**After:**
```typescript
// Unified upload endpoint
await fetch("/api/music/upload", {
  method: "POST",
  body: JSON.stringify({ url, prompt, ... })
})
// Response: { success: true, data: { task_id: "..." } }
```

---

### 4. Task Polling (Get Music Status)
**Before:**
```typescript
await fetch(`/api/suno/details/${taskId}`)
// Response: { 
//   code: 200, 
//   data: { 
//     status: "SUCCESS", 
//     response: { data: [...] } 
//   } 
// }
```

**After:**
```typescript
await fetch(`/api/music/task/${taskId}`)
// Response: { 
//   success: true, 
//   data: [
//     { clip_id, title, audio_url, state: "succeeded", ... }
//   ] 
// }
```

---

## 🛠️ Response Format Standardization

All `/api/music/*` endpoints now return a consistent format:

### Success Response
```typescript
{
  success: true,
  message: "success",
  data: { ... } // or [...] for arrays
}
```

### Error Response
```typescript
{
  success: false,
  error: "Error message"
}
```

---

## 📋 Migration Changes in `components/create-panel.tsx`

### 1. **fetchCredits()** - Line 86
```diff
- const response = await fetch("/api/suno/credits")
+ const response = await fetch("/api/music/credits")
- if (result.code === 200 && result.data?.credits !== undefined)
+ if (result.success && result.data?.credits !== undefined)
```

### 2. **handleCreate()** - Upload Branch (Line 260)
```diff
- uploadUrl: uploadedAudioUrl,
+ url: uploadedAudioUrl,
- const endpoint = mode === "custom" ? "/api/suno/upload/cover" : "/api/suno/upload/extend"
- await fetch(endpoint, ...)
+ await fetch("/api/music/upload", ...)
- if (result.code === 200 && result.data?.taskId)
+ if (result.success && result.data?.task_id)
-   pollForResults(result.data.taskId)
+   pollForResults(result.data.task_id)
```

### 3. **handleCreate()** - Generate Branch (Line 283)
```diff
- await fetch("/api/suno/generate", ...)
+ await fetch("/api/music/custom", ...)
- if (result.code === 200 && result.data?.taskId)
+ if (result.success && result.data?.task_id)
-   pollForResults(result.data.taskId)
+   pollForResults(result.data.task_id)
```

### 4. **pollForResults()** - Line 310
```diff
- await fetch(`/api/suno/details/${taskId}`)
+ await fetch(`/api/music/task/${taskId}`)

- if (result.code === 200 && result.data?.status === "SUCCESS")
+ const allSucceeded = result.success && 
+   Array.isArray(result.data) && 
+   result.data.every((track: any) => track.state === "succeeded")
+ if (allSucceeded)

- const generatedSongs = result.data.response?.data || []
+ const generatedSongs = result.data || []

Song field mapping:
- song.id → song.clip_id
- song.model_name → song.mv
- song.lyric → song.lyrics
- song.prompt → song.gpt_description_prompt
- Removed: stream_audio_url, image_large_url
```

---

## ✅ All 12 Endpoints Accessible via UI

| # | Endpoint | UI Access | Status |
|---|----------|-----------|--------|
| 1 | Create Music | ✅ Main "Create" button | Working |
| 2 | Extend Music | ✅ Upload + Extend mode | Working |
| 3 | Concat Music | 🔄 Backend ready | Not in UI |
| 4 | Cover Music | ✅ Upload + Cover mode | Working |
| 5 | Stems Basic | 🔄 Backend ready | Not in UI |
| 6 | Stems Full | 🔄 Backend ready | Not in UI |
| 7 | Create Persona | 🔄 Backend ready | Not in UI |
| 8 | Persona Music | 🔄 Backend ready | Not in UI |
| 9 | Upload Music | ✅ Upload button | Working |
| 10 | Get WAV | 🔄 Backend ready | Not in UI |
| 11 | Get MIDI | 🔄 Backend ready | Not in UI |
| 12 | Get Music (Task) | ✅ Auto-polling | Working |

---

## 🚀 Next Phase: UI Features

To expose endpoints 3-11 in the UI, consider adding:

### Song Context Menu (Right-click or 3-dot menu)
```typescript
<DropdownMenu>
  <DropdownMenuItem onClick={() => handleSeparateStems(song.id)}>
    🎵 Separate Stems
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleDownloadWAV(song.id)}>
    💿 Download WAV
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleDownloadMIDI(song.id)}>
    🎹 Download MIDI
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => handleConcatSongs([song.id, otherId])}>
    🔗 Concat with Another
  </DropdownMenuItem>
</DropdownMenu>
```

### Persona Management Panel
```typescript
<PersonaManager>
  <Button onClick={handleCreatePersona}>
    Create Voice Persona
  </Button>
  <Button onClick={handleGenerateWithPersona}>
    Generate with Persona
  </Button>
</PersonaManager>
```

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Credits display loads correctly
- [x] Simple mode music generation works
- [x] Custom mode music generation works
- [x] Audio upload + generation works
- [x] Task polling completes successfully
- [x] Generated songs save to localStorage
- [x] No TypeScript errors

### API Testing with curl
```bash
# Test create music
curl -X POST http://localhost:3000/api/music/custom \
  -H "Content-Type: application/json" \
  -d '{"prompt":"happy song","mv":"chirp-v5"}'

# Test task polling
curl http://localhost:3000/api/music/task/YOUR_TASK_ID

# Test MIDI extraction
curl -X POST http://localhost:3000/api/music/midi \
  -H "Content-Type: application/json" \
  -d '{"clip_id":"YOUR_CLIP_ID"}'
```

---

## 📚 Related Documentation

- **WEBHOOK_INTEGRATION.md** - Complete endpoint audit and webhook specs
- **lib/suno-api.ts** - TypeScript client with all 12 methods
- **SUNO_API_OFFICIAL_DOCS.md** - Full OpenAPI specification

---

**Status:** ✅ Migration Complete  
**Last Updated:** 2025-10-30  
**Files Modified:** 1 (`components/create-panel.tsx`)  
**Lines Changed:** ~80 lines
