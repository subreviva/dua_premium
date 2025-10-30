# Suno API Examples

Complete implementation examples for Suno API v1 in multiple languages.

## 📁 Files

- **`suno_api_examples.py`** - Python implementation (all 24 endpoints)
- **`suno_api_examples.ts`** - TypeScript/JavaScript implementation (all 24 endpoints)

## 🚀 Quick Start

### Python

```bash
# Install dependencies
pip install requests

# Edit the file and replace YOUR_API_KEY
# Then run:
python examples/suno_api_examples.py
```

### TypeScript/JavaScript

```bash
# For Node.js
npm install node-fetch  # if using Node < 18
npx ts-node examples/suno_api_examples.ts

# For browser
# Just include the file and call the functions
```

## 🔑 Get Your API Key

1. Visit https://sunoapi.org/api-key
2. Copy your API token
3. Replace `YOUR_API_KEY` in the example files

## 📚 Available Functions

### Core Generation
- `generateMusic()` - Create music from text
- `extendMusic()` - Extend existing music
- `generateLyrics()` - Generate lyrics only

### Upload & Transform
- `uploadCover()` - Upload and create cover
- `uploadExtend()` - Upload and extend
- `addInstrumental()` - Add instrumental accompaniment
- `addVocals()` - Add AI vocals

### Status & Info
- `getTaskStatus()` - Check generation status
- `getLyricsStatus()` - Check lyrics status
- `getCredits()` - Get remaining credits

### Advanced Features
- `getTimestampedLyrics()` - Karaoke-style lyrics
- `separateStems()` - Vocal/instrumental separation
- `convertToWav()` - High-quality WAV conversion
- `generateMusicVideo()` - Create music video
- `generateCover()` - Generate cover art
- `boostStyle()` - Enhanced style control
- `generatePersona()` - Create reusable persona

### File Upload
- `uploadBase64()` - Upload via Base64
- `uploadFile()` / `streamUpload()` - Upload binary file
- `uploadFromUrl()` - Upload from URL

## 💡 Usage Examples

### Python Example

```python
from suno_api_examples import generate_music, get_credits

# Check credits
credits = get_credits()
print(f"Credits: {credits.json()['data']}")

# Generate music
params = {
    "prompt": "Relaxing piano music",
    "customMode": False,
    "callBackUrl": "https://your-domain.com/callback"
}
response = generate_music(params)
task_id = response.json()['data']['taskId']
print(f"Task ID: {task_id}")
```

### TypeScript Example

```typescript
import { generateMusic, getCredits } from './suno_api_examples'

// Check credits
const credits = await getCredits()
console.log('Credits:', credits.data)

// Generate music
const result = await generateMusic({
  prompt: 'Relaxing piano music',
  customMode: false,
  callBackUrl: 'https://your-domain.com/callback'
})
console.log('Task ID:', result.data.taskId)
```

## 🎯 Common Patterns

### 1. Simple Music Generation (Non-Custom Mode)

```python
params = {
    "prompt": "Your music description",
    "customMode": False,
    "callBackUrl": "https://your-callback-url.com"
}
result = generate_music(params)
```

### 2. Custom Music with Vocals

```python
params = {
    "prompt": "Your lyrics or theme",
    "customMode": True,
    "instrumental": False,
    "style": "pop, energetic",
    "title": "My Song",
    "model": "V5",
    "callBackUrl": "https://your-callback-url.com"
}
result = generate_music(params)
```

### 3. Instrumental Only

```python
params = {
    "customMode": True,
    "instrumental": True,
    "style": "classical, piano",
    "title": "Piano Instrumental",
    "model": "V5",
    "callBackUrl": "https://your-callback-url.com"
}
result = generate_music(params)
```

### 4. Extend Existing Music

```python
params = {
    "audioId": "your-audio-id",
    "defaultParamFlag": True,
    "prompt": "Continue with upbeat tempo",
    "style": "pop",
    "title": "Extended Version",
    "continueAt": 60,  # seconds
    "model": "V5",
    "callBackUrl": "https://your-callback-url.com"
}
result = extend_music(params)
```

### 5. Polling Status (Alternative to Callback)

```python
import time

task_id = "your-task-id"

while True:
    status = get_task_info(task_id)
    data = status.json()
    
    if data['data']['status'] == 'SUCCESS':
        audio_url = data['data']['sunoData'][0]['audioUrl']
        print(f"Audio ready: {audio_url}")
        break
    elif 'FAILED' in data['data']['status']:
        print("Generation failed")
        break
    
    time.sleep(5)  # Poll every 5 seconds
```

## ⚠️ Important Notes

### Required Fields

- **`callBackUrl`** is REQUIRED for all generation endpoints
- **`customMode`** determines which other fields are required:
  - `False`: Only `prompt` needed
  - `True` + `instrumental=true`: Requires `style` and `title`
  - `True` + `instrumental=false`: Requires `prompt`, `style`, and `title`

### Model Options

- `V3_5` - Legacy model
- `V4` - Legacy model
- `V4_5` - Standard model (up to 2 min, 1000 char style)
- `V4_5PLUS` - Enhanced model
- `V5` - Latest model (best quality)

### Credits Cost

- Music generation/extension: **12 credits**
- Separate vocal: **1 credit**
- Split stem: **5 credits**
- Other operations: Check docs

### Rate Limits

- Max **20 requests per 10 seconds**
- Error 405 if limit exceeded
- Error 429 if insufficient credits

### File Retention

- Generated files: **14-15 days**
- Stems: Download within **12 hours** (recommended)
- WAV files: Download immediately (large files)

## 🔗 Resources

- **Official Docs**: https://docs.sunoapi.org/
- **API Reference**: See `SUNO_API_REFERENCE.md` in root
- **Get API Key**: https://sunoapi.org/api-key

## 🛡️ Security Best Practices

1. **Never expose API key in frontend code**
2. Use environment variables or secrets management
3. Implement rate limiting on your side
4. Validate callback requests
5. Use HTTPS for callbacks
6. Store downloaded files promptly

## 📝 License

These examples are provided as-is for reference. Adjust according to your needs.

## 🤝 Contributing

Feel free to improve these examples or add implementations in other languages!
