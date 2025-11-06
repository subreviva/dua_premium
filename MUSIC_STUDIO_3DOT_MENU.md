# Music Studio - 3-Dot Menu Features Implementation Guide

## 📋 Overview
This document provides guidance for implementing the advanced track-level options available through the 3-dot menu in the Music Studio Library.

## 🎯 Menu Location
Found next to each track in:
- Library/History section
- Search results
- Explore page
- Radio section
- Shared links

---

## 🛠️ Feature Implementation Status

### ✅ Implemented Features

#### 1. **Download (MP3)**
- **Status**: ✅ Fully Implemented
- **Location**: `handleTrackAction` → `case "download-mp3"`
- **Functionality**: Opens track MP3 URL in new tab for download
- **Code**:
```typescript
case "download-mp3":
  if (track.audio_url) window.open(track.audio_url, "_blank")
  break
```

#### 2. **Share**
- **Status**: ✅ Fully Implemented
- **Location**: `handleTrackAction` → `case "share"`
- **Functionality**: 
  - Uses Web Share API if available
  - Falls back to clipboard copy
  - Generates shareable URL: `/track/{trackId}`
- **Code**:
```typescript
case "share":
  const shareUrl = `${window.location.origin}/track/${trackId}`
  if (navigator.share) {
    navigator.share({ title: track.title || "My Suno Music", url: shareUrl })
  } else {
    navigator.clipboard.writeText(shareUrl)
    alert("Share link copied!")
  }
  break
```

#### 3. **Trash/Delete**
- **Status**: ✅ Fully Implemented
- **Location**: `handleTrackAction` → `case "trash"`
- **Functionality**:
  - Confirms deletion with user
  - Removes from tracks state
  - Stops playback if currently playing
  - Removes from localStorage automatically
- **Code**:
```typescript
case "trash":
  if (confirm("Move this track to trash?")) {
    setTracks(prev => prev.filter(t => t.id !== trackId))
    if (currentlyPlaying?.id === trackId) {
      audioRef.current?.pause()
      setCurrentlyPlaying(null)
      setIsPlaying(false)
    }
  }
  break
```

---

### 🚧 Pending Implementation

#### 4. **Download (WAV)** 
- **Status**: ⏳ Partially Implemented (Placeholder)
- **Priority**: HIGH
- **Requirements**:
  - Call `/api/music/convert-wav` endpoint
  - Use Suno API `POST /api/v1/gateway/wav` endpoint
  - Handle async conversion
  - Download resulting WAV file
  
- **Implementation Plan**:
```typescript
case "download-wav":
  try {
    setLoading(true)
    const response = await fetch("/api/music/convert-wav", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        audioId: trackId,
        callBackUrl: `${window.location.origin}/api/music/callback`
      }),
    })
    const data = await response.json()
    if (data.success && data.taskId) {
      // Poll for completion
      pollWavConversion(data.taskId)
    }
  } catch (error) {
    console.error("WAV conversion error:", error)
    alert("Failed to convert to WAV")
  } finally {
    setLoading(false)
  }
  break
```

- **API Endpoint Needed**: `app/api/music/convert-wav/route.ts`
```typescript
export async function POST(req: Request) {
  const { audioId, callBackUrl } = await req.json()
  const result = await convertToWav(audioId, callBackUrl)
  return NextResponse.json(result)
}
```

#### 5. **Remix / Edit**
- **Status**: ⏳ Placeholder Only
- **Priority**: HIGH
- **Description**: Generates new variation using original prompt
- **Known Issues**: May produce nearly identical outputs
- **Pro Tip**: Adjust 1-2 descriptors for unique results

- **Implementation Plan**:
```typescript
case "remix":
  // Open modal with original prompt pre-filled
  setRemixModalOpen(true)
  setRemixTrack(track)
  // Allow user to tweak prompt, style, or settings
  // Call generateMusic with modified parameters
  break
```

- **UI Components Needed**:
  - Remix Modal Dialog
  - Pre-filled form with original parameters
  - Parameter adjustment controls (style, mood, etc.)
  - "Generate Remix" button

#### 6. **Replace Section**
- **Status**: ⏳ Not Implemented
- **Priority**: MEDIUM
- **Description**: Rebuilds specific part of track (intro, chorus, bridge)
- **Known Issues**: 
  - Timing drift
  - Misaligned lyrics
  - Unpredictable energy shifts
- **Requirements**: Pro or Premier account

- **Implementation Plan**:
```typescript
case "replace-section":
  // Open section editor modal
  setReplaceSectionModalOpen(true)
  setEditingTrack(track)
  // Show waveform with section markers
  // Allow user to:
  //   1. Select section (start/end time)
  //   2. Write micro-prompt for new section
  //   3. Preview transition
  // Call Suno API replace section endpoint
  break
```

- **API Endpoint**: Use Suno API endpoint (if available)
- **Alternative**: Use `extend` + `crop` combination

- **UI Components Needed**:
  - Waveform visualizer
  - Section selector (draggable markers)
  - Micro-prompt input
  - Preview player
  - Replace button

#### 7. **Extend**
- **Status**: ⏳ Placeholder Only
- **Priority**: HIGH
- **Description**: Adds +15s or +30s segments to track
- **Known Issues**: Loses tonal/rhythmic consistency after multiple extensions
- **Best Practice**: Limit to 1-2 extensions, refine with Replace

- **Implementation Plan**:
```typescript
case "extend":
  // Open extend modal
  setExtendModalOpen(true)
  setExtendingTrack(track)
  // Options:
  //   - Duration: 15s or 30s
  //   - Continue At: timestamp (seconds)
  //   - Prompt adjustment (optional)
  // Call /api/music/extend
  break
```

- **API Endpoint Needed**: Already exists! `app/api/music/extend/route.ts`
```typescript
export async function POST(req: Request) {
  const { audioId, prompt, continueAt, callBackUrl } = await req.json()
  const result = await extendMusic(audioId, prompt, continueAt, callBackUrl)
  return NextResponse.json(result)
}
```

- **UI Components Needed**:
  - Extend Modal Dialog
  - Duration selector (15s / 30s radio buttons)
  - Timestamp input for `continueAt`
  - Optional prompt adjustment field
  - "Extend Track" button

#### 8. **Crop + Fade**
- **Status**: ⏳ Not Implemented
- **Priority**: MEDIUM
- **Description**: Trims unwanted sections and applies fade-outs
- **Limitation**: Limited fade control (consider DAW for precise edits)

- **Implementation Plan**:
```typescript
case "crop-fade":
  // Open crop/fade editor
  setCropFadeModalOpen(true)
  setCroppingTrack(track)
  // Show waveform with trim handles
  // Allow user to:
  //   1. Set start/end trim points
  //   2. Configure fade-in duration (0-5s)
  //   3. Configure fade-out duration (0-5s)
  //   4. Preview edited version
  // Process client-side with Web Audio API OR
  // Call server endpoint for processing
  break
```

- **Implementation Options**:
  
  **Option A: Client-Side (Web Audio API)**
  ```typescript
  async function cropAndFade(
    audioUrl: string,
    startTime: number,
    endTime: number,
    fadeInDuration: number,
    fadeOutDuration: number
  ): Promise<Blob> {
    const audioContext = new AudioContext()
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Create offline context for rendering
    const duration = endTime - startTime
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      duration * audioBuffer.sampleRate,
      audioBuffer.sampleRate
    )
    
    // Create source and gain nodes for fading
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer
    const gainNode = offlineContext.createGain()
    
    // Apply fade curves
    gainNode.gain.setValueAtTime(0, 0)
    gainNode.gain.linearRampToValueAtTime(1, fadeInDuration)
    gainNode.gain.setValueAtTime(1, duration - fadeOutDuration)
    gainNode.gain.linearRampToValueAtTime(0, duration)
    
    source.connect(gainNode)
    gainNode.connect(offlineContext.destination)
    source.start(0, startTime)
    
    const renderedBuffer = await offlineContext.startRendering()
    return audioBufferToWav(renderedBuffer)
  }
  ```

  **Option B: Server-Side (FFmpeg)**
  - Create `/api/music/crop-fade` endpoint
  - Use FFmpeg for processing
  - Return processed audio URL

- **UI Components Needed**:
  - Waveform visualizer with zoom
  - Draggable trim handles (start/end)
  - Fade duration sliders (in/out)
  - Real-time preview player
  - "Apply & Download" button

---

## 🎯 Priority Roadmap

### Phase 1: Essential Features (Next Sprint)
1. ✅ Complete WAV Download
   - Implement API endpoint
   - Add polling for conversion
   - Test download flow

2. ✅ Complete Extend Feature
   - Build modal UI
   - Wire up existing API
   - Add continuation prompt support

3. ✅ Complete Remix/Edit
   - Build remix modal
   - Pre-fill original parameters
   - Add prompt tweaking UI

### Phase 2: Advanced Editing (Following Sprint)
4. ⏳ Implement Crop + Fade
   - Choose implementation approach
   - Build waveform editor
   - Add fade controls

5. ⏳ Implement Replace Section
   - Research Suno API endpoint
   - Build section selector
   - Add micro-prompt input

### Phase 3: Polish & Refinement
6. ⏳ Add progress indicators for long operations
7. ⏳ Implement undo/redo for edits
8. ⏳ Add batch operations (multi-select tracks)
9. ⏳ Improve error handling and user feedback
10. ⏳ Add track versioning system

---

## 📊 Known Limitations & Workarounds

| Feature | Known Issue | Pro Tip / Workaround |
|---------|-------------|---------------------|
| **Replace Section** | Lyrics/timing inconsistencies | Use precise micro-prompts; test transitions carefully |
| **Remix/Edit** | Nearly identical outputs | Tweak descriptors for variation ("softer vocals", "darker synths") |
| **Extend** | Mood/tempo drift after 2+ extensions | Limit to 1-2 extensions; refine with Replace |
| **Crop + Fade** | Limited fade control options | Use DAW (Audacity, Logic, Ableton) for detailed trimming |
| **Download WAV** | Export delays under heavy load | Wait before retrying to avoid duplicates |
| **Share** | Links expire if track deleted/altered | Keep offline masters for sharing |
| **Trash** | Permanent after retention period | Backup promising takes before deletion |

---

## 🔧 Technical Architecture

### Component Structure
```
app/musicstudio/page.tsx
├── CreateSection (generation)
├── LibrarySection (track list)
│   └── MusicCard (individual track)
│       └── 3-Dot Menu (DropdownMenu)
│           ├── Remix/Edit
│           ├── Replace Section
│           ├── Extend
│           ├── Crop + Fade
│           ├── Download MP3
│           ├── Download WAV
│           ├── Share
│           └── Trash
├── CreditsPanel (credits info)
└── GlobalAudioPlayer (playback)
```

### State Management
```typescript
// Track state
const [tracks, setTracks] = useState<SunoSong[]>([])

// Modal states
const [remixModalOpen, setRemixModalOpen] = useState(false)
const [extendModalOpen, setExtendModalOpen] = useState(false)
const [replaceSectionModalOpen, setReplaceSectionModalOpen] = useState(false)
const [cropFadeModalOpen, setCropFadeModalOpen] = useState(false)

// Editing state
const [editingTrack, setEditingTrack] = useState<SunoSong | null>(null)

// Operation states
const [isProcessing, setIsProcessing] = useState(false)
const [operationProgress, setOperationProgress] = useState(0)
```

### API Endpoints Required
```
POST /api/music/generate      ✅ Implemented
POST /api/music/extend         ✅ Implemented
GET  /api/music/status         ✅ Implemented
POST /api/music/convert-wav    ⏳ To Implement
POST /api/music/remix          ⏳ To Implement
POST /api/music/replace        ⏳ To Implement
POST /api/music/crop-fade      ⏳ To Implement
```

---

## 🚀 Pro Workflow (Full Implementation)

Once all features are implemented, the complete workflow will be:

1. **Generate Base Versions**: Create 2-3 promising takes
2. **Remix Variants**: Explore tonal differences with prompt tweaks
3. **Replace Section**: Improve key sections without full regeneration
4. **Extend**: Build desired length and structure
5. **Crop + Fade**: Polish intros and endings
6. **Export WAV**: Use proper naming conventions and versioning
7. **Share for Feedback**: Collect input from trusted listeners
8. **Archive or Trash**: Keep clean Library with only final selections

---

## 📝 Notes for Development

### Testing Checklist
- [ ] Test each action with different track states (pending/complete/error)
- [ ] Verify localStorage persistence after operations
- [ ] Test with slow network (loading states)
- [ ] Test error scenarios (API failures, invalid tracks)
- [ ] Verify playback stops correctly during operations
- [ ] Test mobile responsiveness of modals
- [ ] Verify accessibility (keyboard navigation, ARIA labels)

### Performance Considerations
- Use debouncing for waveform interactions
- Lazy load heavy components (waveform visualizers)
- Cache processed audio locally (IndexedDB)
- Implement progressive loading for long tracks
- Add cancel operations for long-running tasks

### User Experience
- Show clear progress indicators
- Provide estimated completion times
- Allow cancellation of in-progress operations
- Save draft states for interrupted operations
- Provide helpful tooltips and hints
- Show before/after previews when possible

---

## 🎵 Current Status Summary

**Total Features**: 8  
**✅ Implemented**: 3 (Download MP3, Share, Trash)  
**⏳ Pending**: 5 (WAV Download, Remix, Extend, Replace Section, Crop+Fade)

**Next Steps**:
1. Implement WAV download with polling
2. Build Extend modal and wire up existing API
3. Create Remix modal with parameter tweaking
4. Research and implement Replace Section
5. Build Crop+Fade editor (client-side preferred)

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0  
**Maintainer**: Music Studio Development Team
