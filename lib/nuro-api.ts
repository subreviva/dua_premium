/**
 * Nuro API Client for Music Generation
 * 
 * Official API: https://api.aimusicapi.ai/api/v1/nuro
 * Alternative: https://api.sunoapi.com/api/v1/nuro
 * 
 * Features:
 * - Vocal song generation with lyrics (30-240s)
 * - BGM v1.0: Classic instrumental with parameters (1-60s)
 * - BGM v2.0: Enhanced with structural control (30-120s)
 * - Rapid generation: Complete 4-minute song in 30 seconds
 * - Commercial usage: No copyright restrictions
 * - Cost: 10 credits per generation, FREE polling
 */

// ============================================================================
// Configuration
// ============================================================================

export interface NuroConfig {
  /** API key for authentication */
  apiKey: string;
  /** Base URL for API (defaults to primary endpoint) */
  baseUrl?: string;
}

// ============================================================================
// Vocal Song Types
// ============================================================================

/** Vocal song genre options (23 available) */
export type NuroVocalGenre = 
  // Pop Music
  | "Pop" | "Pop Rock" | "Pop Punk" | "Pop Rap"
  // Traditional
  | "Folk" | "Chinese Style" | "GuFeng Music"
  // Electronic
  | "Electronic" | "DJ" | "Future Bass" | "Chinoiserie Electronic"
  // Hip-Hop
  | "Hip Hop/Rap" | "Trap Rap" | "R&B Rap"
  // Others
  | "Rock" | "Jazz" | "R&B/Soul" | "Punk" | "Reggae" | "Disco" 
  | "Jazz Pop" | "Bossa Nova" | "Contemporary R&B";

/** Vocal song mood options (13 available) */
export type NuroVocalMood = 
  // Positive
  | "Happy" | "Dynamic/Energetic" | "Inspirational/Hopeful" | "Excited"
  // Relaxing
  | "Chill" | "Calm/Relaxing" | "Dreamy/Ethereal"
  // Emotional
  | "Sentimental/Melancholic/Lonely" | "Nostalgic/Memory" | "Sorrow/Sad" 
  | "Romantic" | "Miss"
  // Rhythmic
  | "Groovy/Funky";

/** Vocal gender options */
export type NuroVocalGender = "Female" | "Male";

/** Vocal timbre options (9 available) */
export type NuroVocalTimbre = 
  // Basic
  | "Warm" | "Bright" | "Husky"
  // Special
  | "Electrified voice" | "Sweet_AUDIO_TIMBRE" | "Cute_AUDIO_TIMBRE"
  // Power
  | "Loud and sonorous" | "Powerful"
  // Style
  | "Sexy/Lazy";

/**
 * Parameters for creating a vocal song
 * 
 * @example
 * ```typescript
 * {
 *   type: 'vocal',
 *   lyrics: '[verse]\nWe were young...\n[chorus]\nMarry me Juliet...',
 *   genre: 'Pop',
 *   mood: 'Dynamic/Energetic',
 *   gender: 'Female',
 *   timbre: 'Sweet_AUDIO_TIMBRE',
 *   duration: 180
 * }
 * ```
 */
export interface NuroVocalMusicParams {
  /** Music type - must be 'vocal' */
  type: 'vocal';
  /** Complete song lyrics (300-2000 characters) - use [verse], [chorus], [bridge] tags */
  lyrics: string;
  /** Music genre */
  genre: NuroVocalGenre;
  /** Emotional mood */
  mood: NuroVocalMood;
  /** Vocal gender */
  gender: NuroVocalGender;
  /** Vocal timbre/voice characteristic */
  timbre: NuroVocalTimbre;
  /** Song duration in seconds (30-240) */
  duration: number;
}

// ============================================================================
// BGM (Instrumental) Types
// ============================================================================

/** BGM genre options (50 available, max 5 per request) */
export type NuroBGMGenre = 
  | "corporate" | "dance/edm" | "orchestral" | "chill out" | "rock" | "hip hop"
  | "folk" | "funk" | "ambient" | "holiday" | "jazz" | "kids" | "world"
  | "travel" | "commercial" | "advertising" | "driving" | "cinematic" | "upbeat"
  | "epic" | "inspiring" | "business" | "video game" | "dark" | "pop" | "trailer"
  | "modern" | "electronic" | "documentary" | "soundtrack" | "fashion" | "acoustic"
  | "movie" | "tv" | "high tech" | "industrial" | "dance" | "video" | "vlog"
  | "marketing" | "game" | "radio" | "promotional" | "sports" | "party" 
  | "summer" | "beauty";

/** BGM mood options (52 available, max 5 per request) */
export type NuroBGMMood = 
  | "positive" | "uplifting" | "energetic" | "happy" | "bright" | "optimistic"
  | "hopeful" | "cool" | "dreamy" | "fun" | "light" | "powerful" | "calm"
  | "confident" | "joyful" | "dramatic" | "peaceful" | "playful" | "soft"
  | "groovy" | "reflective" | "easy" | "relaxed" | "lively" | "smooth"
  | "romantic" | "intense" | "elegant" | "mellow" | "emotional" | "sentimental"
  | "cheerful happy" | "contemplative" | "soothing" | "proud" | "passionate"
  | "sweet" | "mystical" | "tranquil" | "cheerful" | "casual" | "beautiful"
  | "ethereal" | "melancholy" | "sad" | "aggressive" | "haunting" | "adventure"
  | "serene" | "sincere" | "funky" | "funny";

/** BGM instrument options (25 available, max 5 per request) */
export type NuroBGMInstrument = 
  | "piano" | "drums" | "guitar" | "percussion" | "synth" | "electric guitar"
  | "acoustic guitar" | "bass guitar" | "brass" | "violin" | "cello" | "flute"
  | "organ" | "trumpet" | "ukulele" | "saxophone" | "double bass" | "harp"
  | "glockenspiel" | "synthesizer" | "keyboard" | "marimba" | "bass" 
  | "banjo" | "strings";

/** BGM theme options (28 available, max 5 per request) */
export type NuroBGMTheme = 
  | "inspirational" | "motivational" | "achievement" | "discovery" | "every day"
  | "love" | "technology" | "lifestyle" | "journey" | "meditation" | "drama"
  | "children" | "hope" | "fantasy" | "holiday" | "health" | "family"
  | "real estate" | "media" | "kids" | "science" | "education" | "progress"
  | "world" | "vacation" | "training" | "christmas" | "sales";

/** BGM segment types for v2.0 structural control */
export type NuroBGMSegmentName = 
  | "intro"   // Introduction section
  | "verse"   // Verse section
  | "chorus"  // Chorus/refrain section
  | "inst"    // Instrumental section
  | "bridge"  // Bridge section
  | "outro";  // Outro/ending section

/** BGM segment definition */
export interface NuroBGMSegment {
  /** Segment type */
  name: NuroBGMSegmentName;
  /** Segment duration in seconds (5-120, 30s minimum if only one segment) */
  duration: number;
}

/**
 * Parameters for creating BGM v1.0 (classic)
 * Duration: 1-60 seconds
 * 
 * @example
 * ```typescript
 * {
 *   type: 'bgm',
 *   version: 'v1.0',
 *   description: 'Upbeat corporate background music',
 *   duration: 45,
 *   genre: ['corporate', 'upbeat'],
 *   mood: ['positive', 'energetic'],
 *   instrument: ['piano', 'guitar'],
 *   theme: ['business', 'motivational']
 * }
 * ```
 */
export interface NuroBGMv1Params {
  /** Music type - must be 'bgm' */
  type: 'bgm';
  /** Version - 'v1.0' for classic (default if omitted) */
  version?: 'v1.0';
  /** Music description */
  description: string;
  /** Duration in seconds (1-60) */
  duration: number;
  /** Music genres (max 5) */
  genre?: NuroBGMGenre[];
  /** Music moods (max 5) */
  mood?: NuroBGMMood[];
  /** Musical instruments (max 5) */
  instrument?: NuroBGMInstrument[];
  /** Music themes (max 5) */
  theme?: NuroBGMTheme[];
}

/**
 * Parameters for creating BGM v2.0 (enhanced with structure)
 * Duration: 30-120 seconds (or calculated from segments)
 * 
 * @example Simple (no segments):
 * ```typescript
 * {
 *   type: 'bgm',
 *   version: 'v2.0',
 *   description: 'Peaceful meditation music',
 *   duration: 60
 * }
 * ```
 * 
 * @example With segments:
 * ```typescript
 * {
 *   type: 'bgm',
 *   version: 'v2.0',
 *   description: 'Cinematic trailer music',
 *   segments: [
 *     { name: 'intro', duration: 15 },
 *     { name: 'verse', duration: 30 },
 *     { name: 'chorus', duration: 45 },
 *     { name: 'outro', duration: 10 }
 *   ]
 * }
 * ```
 */
export interface NuroBGMv2Params {
  /** Music type - must be 'bgm' */
  type: 'bgm';
  /** Version - must be 'v2.0' for enhanced features */
  version: 'v2.0';
  /** Music description (under 200 characters recommended) */
  description: string;
  /** Duration in seconds (30-120) - omit if using segments */
  duration?: number;
  /** Custom music structure segments (optional) */
  segments?: NuroBGMSegment[];
}

/** Union type for all BGM parameters */
export type NuroBGMMusicParams = NuroBGMv1Params | NuroBGMv2Params;

// ============================================================================
// Response Types
// ============================================================================

/** Task creation response */
export interface NuroTaskResponse {
  /** Success message */
  message: string;
  /** Unique task identifier for polling */
  task_id: string;
}

/** Task status values */
export type NuroTaskStatus = 
  | 'pending'    // Task queued
  | 'running'    // Generation in progress
  | 'succeeded'  // Music ready
  | 'failed';    // Generation failed

/**
 * Music data returned when polling task status
 */
export interface NuroMusicData {
  /** Task ID */
  task_id: string;
  /** Current task status */
  status: NuroTaskStatus;
  /** Generation progress (0-100) */
  progress: number;
  /** Audio file URL (WAV format, available when status='succeeded') */
  audio_url: string;
  /** Song lyrics (for vocal songs) */
  lyrics: string;
  /** Song duration in seconds */
  duration: number;
  /** Music genre */
  genre: string;
  /** Music mood */
  mood: string;
  /** Vocal gender (for vocal songs) */
  gender: string;
  /** Vocal timbre (for vocal songs) */
  timbre: string;
}

/** Generic API response wrapper */
export interface NuroApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Custom error class for Nuro API errors
 */
export class NuroAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'NuroAPIError';
  }
}

// ============================================================================
// Main API Client
// ============================================================================

/**
 * Nuro API Client
 * 
 * Provides methods for:
 * - Creating vocal songs with lyrics
 * - Creating BGM (instrumental) music v1.0 and v2.0
 * - Polling task status
 * 
 * @example
 * ```typescript
 * const client = new NuroAPIClient({
 *   apiKey: process.env.NURO_API_KEY!
 * });
 * 
 * // Create vocal song
 * const task = await client.createVocalMusic({
 *   type: 'vocal',
 *   lyrics: '[verse]\nComplete lyrics here...',
 *   genre: 'Pop',
 *   mood: 'Happy',
 *   gender: 'Female',
 *   timbre: 'Warm',
 *   duration: 120
 * });
 * 
 * // Poll for result
 * const result = await client.getMusic(task.data.task_id);
 * if (result.data.status === 'succeeded') {
 *   console.log('Audio:', result.data.audio_url);
 * }
 * ```
 */
export class NuroAPIClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: NuroConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.aimusicapi.ai/api/v1/nuro';
  }

  /**
   * Create a vocal song with lyrics
   * 
   * Cost: 10 credits
   * Generation time: ~30 seconds
   * Duration: 30-240 seconds
   * 
   * @param params Vocal song parameters
   * @returns Task response with task_id for polling
   * 
   * @example
   * ```typescript
   * const response = await client.createVocalMusic({
   *   type: 'vocal',
   *   lyrics: '[verse]\nWe were both young when I first saw you\n[chorus]\nMarry me Juliet',
   *   genre: 'Pop',
   *   mood: 'Dynamic/Energetic',
   *   gender: 'Female',
   *   timbre: 'Sweet_AUDIO_TIMBRE',
   *   duration: 180
   * });
   * ```
   */
  async createVocalMusic(
    params: NuroVocalMusicParams
  ): Promise<NuroApiResponse<NuroTaskResponse>> {
    // Validate type
    if (params.type !== 'vocal') {
      throw new NuroAPIError('type must be "vocal" for vocal music creation', 400, 'bad_request');
    }

    // Validate lyrics
    if (!params.lyrics || params.lyrics.trim().length < 300) {
      throw new NuroAPIError('lyrics must be at least 300 characters', 400, 'bad_request');
    }
    if (params.lyrics.length > 2000) {
      throw new NuroAPIError('lyrics must not exceed 2000 characters', 400, 'bad_request');
    }

    // Validate duration
    if (params.duration < 30 || params.duration > 240) {
      throw new NuroAPIError('duration must be between 30 and 240 seconds for vocal songs', 400, 'bad_request');
    }

    // Validate required fields
    if (!params.genre) {
      throw new NuroAPIError('genre is required for vocal songs', 400, 'bad_request');
    }
    if (!params.mood) {
      throw new NuroAPIError('mood is required for vocal songs', 400, 'bad_request');
    }
    if (!params.gender || !['Female', 'Male'].includes(params.gender)) {
      throw new NuroAPIError('gender must be "Female" or "Male"', 400, 'bad_request');
    }
    if (!params.timbre) {
      throw new NuroAPIError('timbre is required for vocal songs', 400, 'bad_request');
    }

    return this.makeRequest<NuroTaskResponse>('/create', 'POST', params);
  }

  /**
   * Create background music (instrumental)
   * 
   * Supports both v1.0 (classic) and v2.0 (enhanced with structure):
   * - v1.0: 1-60 seconds, traditional parameters
   * - v2.0: 30-120 seconds, structural control with segments
   * 
   * Cost: 10 credits
   * Generation time: ~30 seconds
   * 
   * @param params BGM parameters (v1.0 or v2.0)
   * @returns Task response with task_id for polling
   * 
   * @example v1.0 (Classic):
   * ```typescript
   * const response = await client.createBGMMusic({
   *   type: 'bgm',
   *   version: 'v1.0',
   *   description: 'Upbeat corporate background music',
   *   duration: 45,
   *   genre: ['corporate', 'upbeat'],
   *   mood: ['positive', 'energetic']
   * });
   * ```
   * 
   * @example v2.0 (Enhanced with segments):
   * ```typescript
   * const response = await client.createBGMMusic({
   *   type: 'bgm',
   *   version: 'v2.0',
   *   description: 'Cinematic trailer music',
   *   segments: [
   *     { name: 'intro', duration: 15 },
   *     { name: 'verse', duration: 30 },
   *     { name: 'chorus', duration: 45 },
   *     { name: 'outro', duration: 10 }
   *   ]
   * });
   * ```
   */
  async createBGMMusic(
    params: NuroBGMMusicParams
  ): Promise<NuroApiResponse<NuroTaskResponse>> {
    // Validate type
    if (params.type !== 'bgm') {
      throw new NuroAPIError('type must be "bgm" for BGM music creation', 400, 'bad_request');
    }

    // Validate description
    if (!params.description || params.description.trim().length === 0) {
      throw new NuroAPIError('description is required for BGM', 400, 'bad_request');
    }
    if (params.description.length > 200) {
      throw new NuroAPIError('description should be under 200 characters', 400, 'bad_request');
    }

    const version = params.version || 'v1.0';

    // Version-specific validation
    if (version === 'v1.0') {
      const v1Params = params as NuroBGMv1Params;
      
      // Validate duration for v1.0
      if (!v1Params.duration || v1Params.duration < 1 || v1Params.duration > 60) {
        throw new NuroAPIError('duration must be between 1 and 60 seconds for BGM v1.0', 400, 'bad_request');
      }

      // Validate array parameters (max 5 each)
      if (v1Params.genre && v1Params.genre.length > 5) {
        throw new NuroAPIError('genre array must contain at most 5 values', 400, 'bad_request');
      }
      if (v1Params.mood && v1Params.mood.length > 5) {
        throw new NuroAPIError('mood array must contain at most 5 values', 400, 'bad_request');
      }
      if (v1Params.instrument && v1Params.instrument.length > 5) {
        throw new NuroAPIError('instrument array must contain at most 5 values', 400, 'bad_request');
      }
      if (v1Params.theme && v1Params.theme.length > 5) {
        throw new NuroAPIError('theme array must contain at most 5 values', 400, 'bad_request');
      }

    } else if (version === 'v2.0') {
      const v2Params = params as NuroBGMv2Params;
      
      // v2.0 requires either duration OR segments
      if (!v2Params.duration && !v2Params.segments) {
        throw new NuroAPIError('either duration or segments is required for BGM v2.0', 400, 'bad_request');
      }

      // If using duration (no segments)
      if (v2Params.duration && !v2Params.segments) {
        if (v2Params.duration < 30 || v2Params.duration > 120) {
          throw new NuroAPIError('duration must be between 30 and 120 seconds for BGM v2.0', 400, 'bad_request');
        }
      }

      // If using segments
      if (v2Params.segments) {
        if (!Array.isArray(v2Params.segments) || v2Params.segments.length === 0) {
          throw new NuroAPIError('segments must be a non-empty array', 400, 'bad_request');
        }

        let totalDuration = 0;
        const validSegmentNames: NuroBGMSegmentName[] = ['intro', 'verse', 'chorus', 'inst', 'bridge', 'outro'];

        for (const segment of v2Params.segments) {
          // Validate segment name
          if (!validSegmentNames.includes(segment.name)) {
            throw new NuroAPIError(
              `invalid segment name "${segment.name}". Must be one of: ${validSegmentNames.join(', ')}`,
              400,
              'bad_request'
            );
          }

          // Validate segment duration
          const minSegmentDuration = v2Params.segments.length === 1 ? 30 : 5;
          if (segment.duration < minSegmentDuration || segment.duration > 120) {
            throw new NuroAPIError(
              `segment duration must be between ${minSegmentDuration} and 120 seconds`,
              400,
              'bad_request'
            );
          }

          totalDuration += segment.duration;
        }

        // Validate total duration
        if (totalDuration < 30 || totalDuration > 120) {
          throw new NuroAPIError(
            'total segments duration must be between 30 and 120 seconds',
            400,
            'bad_request'
          );
        }
      }
    } else {
      throw new NuroAPIError('version must be "v1.0" or "v2.0"', 400, 'bad_request');
    }

    return this.makeRequest<NuroTaskResponse>('/create', 'POST', params);
  }

  /**
   * Get music generation status and result
   * 
   * Poll this endpoint to check task progress and retrieve the audio URL.
   * 
   * Cost: FREE
   * Recommended polling interval: 5-10 seconds
   * 
   * @param taskId Task ID from create response
   * @returns Music data with status and audio URL (when succeeded)
   * 
   * @example
   * ```typescript
   * const result = await client.getMusic(taskId);
   * 
   * if (result.data.status === 'succeeded') {
   *   console.log('Audio ready:', result.data.audio_url);
   *   console.log('Duration:', result.data.duration, 'seconds');
   * } else if (result.data.status === 'running') {
   *   console.log('Progress:', result.data.progress, '%');
   * }
   * ```
   */
  async getMusic(taskId: string): Promise<NuroApiResponse<NuroMusicData>> {
    if (!taskId || taskId.trim().length === 0) {
      throw new NuroAPIError('taskId is required', 400, 'bad_request');
    }

    return this.makeRequest<NuroMusicData>(`/task/${taskId}`, 'GET');
  }

  /**
   * Make HTTP request to Nuro API
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: any
  ): Promise<NuroApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new NuroAPIError(
          data.message || `API request failed with status ${response.status}`,
          response.status,
          data.type || 'api_error'
        );
      }

      return {
        data: data as T,
        statusCode: response.status,
      };
    } catch (error) {
      if (error instanceof NuroAPIError) {
        throw error;
      }

      throw new NuroAPIError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'network_error'
      );
    }
  }
}

// ============================================================================
// Convenience Function
// ============================================================================

/**
 * Create a Nuro API client instance
 * 
 * @param config Client configuration
 * @returns Configured NuroAPIClient instance
 * 
 * @example
 * ```typescript
 * const nuroClient = createNuroClient({
 *   apiKey: process.env.NURO_API_KEY!
 * });
 * ```
 */
export function createNuroClient(config: NuroConfig): NuroAPIClient {
  return new NuroAPIClient(config);
}
