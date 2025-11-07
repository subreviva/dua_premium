interface Track {
  id: string
  audioId: string
  title: string
  prompt: string
  tags: string
  duration: number
  audioUrl: string
  streamAudioUrl: string
  imageUrl: string
  modelName: string
  createTime: string
  taskId: string
  wavUrl?: string
}

class TrackDatabase {
  private tracks: Map<string, Track[]> = new Map()

  addTrack(taskId: string, track: Track) {
    const existing = this.tracks.get(taskId) || []
    this.tracks.set(taskId, [...existing, track])
  }

  getTracksByTaskId(taskId: string): Track[] {
    return this.tracks.get(taskId) || []
  }

  getAllTracks(): Track[] {
    const allTracks: Track[] = []
    this.tracks.forEach((tracks) => allTracks.push(...tracks))
    return allTracks.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
  }

  getTrackByAudioId(audioId: string): Track | undefined {
    for (const tracks of this.tracks.values()) {
      const track = tracks.find((t) => t.audioId === audioId)
      if (track) return track
    }
    return undefined
  }

  updateTrackWavUrl(audioId: string, wavUrl: string): boolean {
    for (const tracks of this.tracks.values()) {
      const track = tracks.find((t) => t.audioId === audioId)
      if (track) {
        track.wavUrl = wavUrl
        console.log(`[v0] Updated track ${audioId} with WAV URL`)
        return true
      }
    }
    console.error(`[v0] Track not found for audioId: ${audioId}`)
    return false
  }
}

export const trackDB = new TrackDatabase()
