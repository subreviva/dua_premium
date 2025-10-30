# Suno Clone Setup Instructions

## Prerequisites

- **Node.js**: Version >= 18 (required for MCP server and development)
- **npm** or **pnpm**: Package manager

Check your Node.js version:
```bash
node --version
```

If needed, install/update from [nodejs.org](https://nodejs.org/)

---

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

---

## Optional: MCP Setup (Model Context Protocol)

Want to access AI Music API documentation directly in your IDE?

**MCP** allows you to query API endpoints, schemas, parameters, and examples using `@AI Music API` in:
- GitHub Copilot (VS Code)
- Claude Desktop

### Quick Setup (2 minutes)

Follow the detailed guide: **[MCP_QUICK_START.md](./MCP_QUICK_START.md)**

**What you get:**
- Instant API documentation access
- Query endpoints: `@AI Music API list all endpoints`
- Get examples: `@AI Music API curl example for v5 model`
- Check schemas: `@AI Music API response schema for /status`
- Debug help: `@AI Music API what error codes can /generate return`

**Requirements:**
- Node.js >= 18
- GitHub Copilot or Claude Desktop
