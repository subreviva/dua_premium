# Suno Clone Setup Instructions

## Environment Variables

To use the Suno API integration, you need to add your API key as an environment variable:

1. Click on the **Vars** section in the in-chat sidebar (left side of the screen)
2. Add a new environment variable:
   - **Name**: `SUNO_API_KEY`
   - **Value**: Your Suno API key from https://sunoapi.org
3. Save the variable

**Important**: Do NOT use the `NEXT_PUBLIC_` prefix for this variable, as it would expose your API key to the client side, which is a security risk.

## Getting Your API Key

1. Sign up at https://sunoapi.org
2. Navigate to your dashboard
3. Copy your API key
4. Add it to the Vars section as described above

## Features

This implementation includes all Suno API features:
- Music generation (Simple & Custom modes)
- Multiple model versions (v3.5, v4, v4.5, v4.5+, v5)
- Advanced options (vocal gender, weirdness, style influence)
- Lyrics generation
- Music extension
- Audio processing (WAV conversion, vocal separation)
- Music video generation
- Credits management
