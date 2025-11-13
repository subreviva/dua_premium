'use client'

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';

// Community stories data with lusophone creators + real music from Music Studio
const communityStories = [
  {
    id: 1,
    author: 'Riicky',
    avatar: 'https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg',
    fallback: 'RI',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=800&fit=crop&q=80',
    alt: 'Artista Português',
    musicUrl: `/audio/featured/ainda-nao-acabou.mp3`,
    musicTitle: 'Ainda Não Acabou',
    genre: 'Portuguese Pop',
  },
  {
    id: 2,
    author: 'Joana_Goncalves',
    avatar: 'https://cdn2.suno.ai/image_b132bd86-120b-45bd-af5d-54ec65b471aa.jpeg',
    fallback: 'JG',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=800&fit=crop&q=80',
    alt: 'Artista Cabo-verdiana',
    musicUrl: `/audio/featured/bo-surrize.mp3`,
    musicTitle: 'Bo Surrize Ta Alegra-m Nha Dia',
    genre: 'Cabo Verde',
  },
  {
    id: 3,
    author: 'FabyJunior',
    avatar: 'https://cdn2.suno.ai/image_cb01ecb0-2e67-430c-bdae-d235fa14808a.jpeg',
    fallback: 'FJ',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&h=800&fit=crop&q=80',
    alt: 'Músico Brasileiro',
    musicUrl: `/audio/featured/struggle-symphony.mp3`,
    musicTitle: 'Struggle Symphony',
    genre: 'Orchestral Rock',
  },
  {
    id: 4,
    author: 'Riicky',
    avatar: 'https://cdn2.suno.ai/image_76f26d38-5ef4-4510-bcab-e4f50d4c7125.jpeg',
    fallback: 'RI',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    alt: 'Artista Português',
    musicUrl: `/audio/featured/amor-e-paz.mp3`,
    musicTitle: 'Amor e Paz',
    genre: 'Reggae',
  },
  {
    id: 5,
    author: 'Joana_Goncalves',
    avatar: 'https://cdn2.suno.ai/image_b132bd86-120b-45bd-af5d-54ec65b471aa.jpeg',
    fallback: 'JG',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=800&fit=crop&q=80',
    alt: 'Artista Rock',
    musicUrl: `/audio/featured/revolution-in-the-air.mp3`,
    musicTitle: 'Revolution in the Air',
    genre: 'Rock Anthem',
  },
];

export const CommunityPreview = () => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = React.useState<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="h-[400px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-12 sm:space-y-16">
        {/* Music carousel - Músicas reais da comunidade Music Studio */}
        <div className="px-4">
          <Carousel
            opts={{ align: 'start', loop: true, dragFree: true, skipSnaps: false }}
            className="w-full touch-pan-x"
          >
            <CarouselContent className="ml-4">
              {communityStories.map((story) => (
                <CarouselItem key={story.id} className="pl-4 basis-[90%] sm:basis-[85%] md:basis-[45%] lg:basis-[30%]">
                  <div className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl h-[460px]">
                    <div className="relative h-[240px] overflow-hidden">
                      <img src={story.image} alt={story.alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                      
                      {/* Genre Badge */}
                      {story.genre && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/20 text-xs font-medium text-white shadow-lg">
                          {story.genre}
                        </div>
                      )}
                      
                      {/* Avatar */}
                      <div className="absolute top-4 left-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md overflow-hidden border-2 border-white/20">
                        <img src={story.avatar} alt={story.author} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    <div className="p-6 flex flex-col justify-between h-[220px]">
                      <div className="space-y-3">
                        <h4 className="text-xl font-extralight text-white tracking-tight leading-tight">{story.musicTitle}</h4>
                        <p className="text-sm text-white/70 font-light">{story.author}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          aria-label={playingId === story.id ? 'Pausar' : 'Reproduzir'}
                          className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 border border-white/10 min-h-[44px] touch-manipulation"
                          onClick={() => {
                            if (!story.musicUrl) return;
                            if (playingId === story.id) {
                              audioRef.current?.pause();
                              setPlayingId(null);
                              return;
                            }
                            if (!audioRef.current) audioRef.current = new Audio();
                            if (audioRef.current.src !== story.musicUrl) {
                              audioRef.current.src = story.musicUrl;
                              audioRef.current.load();
                            }
                            audioRef.current.play();
                            setPlayingId(story.id);
                            audioRef.current.onended = () => setPlayingId(null);
                          }}
                        >
                          {playingId === story.id ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white ml-0.5" />}
                        </button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{story.musicTitle}</div>
                          <div className="text-xs text-white/60">{story.author}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Ver Mais Button - Hero Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center pt-6 sm:pt-10 px-4"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto gap-2.5 bg-white text-black hover:bg-white/95 active:bg-white/90 font-normal text-[15px] px-6 py-5 sm:px-10 sm:py-7 rounded-[18px] sm:rounded-full transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:shadow-[0_8px_40px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_56px_rgba(255,255,255,0.3)] active:scale-[0.98] sm:hover:scale-[1.02] touch-manipulation tracking-tight"
            onClick={() => router.push('/acesso')}
          >
            Fazer Login para Aceder
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
