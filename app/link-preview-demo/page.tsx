'use client';

import { useState } from 'react';
import { LinkPreview } from '@/components/ui/link-preview';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const EXAMPLE_LINKS = [
  {
    category: '🎵 Música',
    links: [
      {
        name: 'Spotify Track',
        url: 'https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp'
      },
      {
        name: 'Spotify Album',
        url: 'https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3'
      },
      {
        name: 'SoundCloud',
        url: 'https://soundcloud.com/example'
      }
    ]
  },
  {
    category: '🎬 Vídeo',
    links: [
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        name: 'YouTube (youtu.be)',
        url: 'https://youtu.be/dQw4w9WgXcQ'
      },
      {
        name: 'Vimeo',
        url: 'https://vimeo.com/76979871'
      }
    ]
  },
  {
    category: '🌐 Social',
    links: [
      {
        name: 'Twitter',
        url: 'https://twitter.com/vercel'
      },
      {
        name: 'GitHub Repo',
        url: 'https://github.com/vercel/next.js'
      }
    ]
  },
  {
    category: '🔗 Websites',
    links: [
      {
        name: 'Next.js',
        url: 'https://nextjs.org'
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com'
      }
    ]
  }
];

export default function LinkPreviewDemo() {
  const [customUrl, setCustomUrl] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Link Preview Demo
          </h1>
          <p className="text-white/60 text-lg">
            Sistema ultra elegante de previews de links com miniaturas reais
          </p>
        </div>

        {/* Custom Link Tester */}
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <h2 className="text-xl font-semibold">Testar Link Customizado</h2>
          <div className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Cole uma URL aqui (YouTube, Spotify, etc...)"
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customUrl) {
                  setShowCustom(true);
                }
              }}
            />
            <Button
              onClick={() => setShowCustom(true)}
              disabled={!customUrl}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </Button>
          </div>

          {showCustom && customUrl && (
            <div className="pt-4">
              <LinkPreview url={customUrl} />
            </div>
          )}
        </div>

        {/* Examples by Category */}
        {EXAMPLE_LINKS.map((category) => (
          <div key={category.category} className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {category.category}
            </h2>
            <div className="grid gap-4">
              {category.links.map((link) => (
                <div key={link.url} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/60">
                      {link.name}
                    </h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link.url}
                    </a>
                  </div>
                  <LinkPreview url={link.url} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-white/40 text-sm py-8 border-t border-white/10">
          <p>Sistema de Link Preview - DUA IA</p>
          <p className="mt-2">Suporta YouTube, Spotify, Twitter, GitHub e mais!</p>
        </div>
      </div>
    </div>
  );
}
