# Suno AI Music Creation Platform

A premium AI-powered music creation platform built with Next.js 16 and the Suno API.

## 📚 Quick Links

### Development Setup
- **[Setup Guide](./SETUP.md)** - Basic project setup and environment variables
- **[MCP Quick Start](./MCP_QUICK_START.md)** - 🚀 **NEW!** Access AI Music API docs in your IDE (2-minute setup)

### API Documentation & Integration
- **[MCP AI Music API](./MCP_AI_MUSIC_API.md)** - Detailed Model Context Protocol guide
- **[Gooey.AI Integration](./GOOEY_INTEGRATION.md)** - Alternative Suno API via Gooey.AI (v5, v4.5, v3.5)

## Features

- **Music Generation**: Create AI-generated music from text prompts
- **Custom & Simple Modes**: Choose between simple prompts or detailed custom parameters
- **Advanced Controls**: Fine-tune vocal gender, weirdness, style influence, and more
- **Lyrics Generation**: Generate lyrics separately or as part of music creation
- **Audio Processing**: 
  - Vocal/instrumental separation
  - WAV format conversion
  - Audio extension
  - Cover creation
- **Music Video Generation**: Create videos for your generated music
- **Persona System**: Generate and use vocal personas
- **Style Boosting**: Enhance and remaster existing tracks
- **Multiple Model Versions**: Support for V3.5, V4, V4.5, V4.5+, and V5 models
- **Credits Display**: Real-time monitoring of API credits and usage

## Setup

### Prerequisites
- Node.js >= 18 (required for MCP server)
- npm or pnpm

### Installation Steps

1. Clone the repository

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file and add your Suno API key:
   ```env
   SUNO_API_KEY=your_api_key_here
   ```
   Get your API key from: https://sunoapi.org/

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Optional: MCP Setup for API Documentation

Want to access AI Music API documentation directly in your IDE? 

👉 **[Follow the MCP Quick Start Guide](./MCP_QUICK_START.md)** (2 minutes)

This lets you query API endpoints, schemas, and examples using `@AI Music API` in GitHub Copilot or Claude.

## API Integration

This project uses the official Suno API (https://docs.sunoapi.org/) with complete implementation of:

- Music generation and extension
- Lyrics creation
- Audio processing (WAV conversion, vocal separation)
- Video generation
- File uploads (base64, stream, URL)
- Credit management

All API endpoints are properly configured and follow the official documentation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19.2, Tailwind CSS v4
- **Components**: shadcn/ui
- **API**: Suno API v1
- **TypeScript**: Full type safety

## Environment Variables

Required environment variables:

- `SUNO_API_KEY`: Your Suno API key (required)

## License

MIT
