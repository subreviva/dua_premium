/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ytimg.com', // YouTube thumbnails
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // YouTube thumbnails
      },
      {
        protocol: 'https',
        hostname: '**.scdn.co', // Spotify images
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // Spotify images
      },
      {
        protocol: 'https',
        hostname: '**.twimg.com', // Twitter images
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Twitter images
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com', // GitHub
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub
      },
      {
        protocol: 'https',
        hostname: '**.vimeocdn.com', // Vimeo
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com', // Vimeo
      },
      {
        protocol: 'https',
        hostname: '**', // Permitir todos os domínios (fallback)
      },
    ],
  },
}

export default nextConfig