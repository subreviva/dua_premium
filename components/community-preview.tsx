'use client'

import * as React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Stories,
  StoriesContent,
  Story,
  StoryAuthor,
  StoryAuthorImage,
  StoryAuthorName,
  StoryOverlay,
  StoryImage,
} from '@/components/ui/stories-carousel';

// Community stories data with lusophone creators
const communityStories = [
  {
    id: 1,
    author: 'Marta Lisboa',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    fallback: 'ML',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1200&fit=crop&q=80',
    alt: 'Arte Digital Lisboa',
  },
  {
    id: 2,
    author: 'Tiago Porto',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    fallback: 'TP',
    image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=1200&fit=crop&q=80',
    alt: 'Design Português',
  },
  {
    id: 3,
    author: 'Bia São Paulo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    fallback: 'BS',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=1200&fit=crop&q=80',
    alt: 'Arte Brasileira',
  },
  {
    id: 4,
    author: 'Djô Praia',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    fallback: 'DP',
    image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=1200&fit=crop&q=80',
    alt: 'Cabo Verde Digital',
  },
  {
    id: 5,
    author: 'Luana Luanda',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    fallback: 'LL',
    image: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&h=1200&fit=crop&q=80',
    alt: 'Arte Angolana',
  },
  {
    id: 6,
    author: 'Rafa Maputo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    fallback: 'RM',
    image: 'https://images.unsplash.com/photo-1620641788813-04466f872be2?w=800&h=1200&fit=crop&q=80',
    alt: 'Design Moçambicano',
  },
  {
    id: 7,
    author: 'Kátia Bissau',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face',
    fallback: 'KB',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop&q=80',
    alt: 'Criatividade Guiné-Bissau',
  },
  {
    id: 8,
    author: 'Miguel Coimbra',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    fallback: 'MC',
    image: 'https://images.unsplash.com/photo-1605292356183-a77d0a9c9d1d?w=800&h=1200&fit=crop&q=80',
    alt: 'Arte Portuguesa',
  },
  {
    id: 9,
    author: 'Yara Rio',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    fallback: 'YR',
    image: 'https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&h=1200&fit=crop&q=80',
    alt: 'Criação Brasil',
  },
  {
    id: 10,
    author: 'Zé Mindelo',
    avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100&h=100&fit=crop&crop=face',
    fallback: 'ZM',
    image: 'https://images.unsplash.com/photo-1617396900799-f4ec2b43c7ae?w=800&h=1200&fit=crop&q=80',
    alt: 'Design Cabo-verdiano',
  },
];

export const CommunityPreview = () => {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

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
        {/* Stories Carousel - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          viewport={{ once: true, amount: 0.1 }}
          className="px-4"
        >
          <Stories className="overflow-visible">
            <StoriesContent className="gap-4 sm:gap-6 md:gap-8 lg:gap-10">
              {communityStories.map((story, index) => (
                <Story 
                  key={story.id}
                  className="aspect-[3/4] w-[180px] sm:w-[220px] md:w-[240px] lg:w-[260px] hover:shadow-[0_20px_60px_rgba(255,255,255,0.2)] transition-shadow duration-500"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                    className="w-full h-full"
                  >
                    <StoryImage src={story.image} alt={story.alt} />
                    <StoryOverlay className="from-black/40" />
                    <StoryAuthor>
                      <StoryAuthorImage
                        fallback={story.fallback}
                        name={story.author}
                        src={story.avatar}
                        className="size-7 border-2 border-white/30 shadow-lg"
                      />
                      <StoryAuthorName className="text-white/95 font-medium drop-shadow-lg">
                        {story.author}
                      </StoryAuthorName>
                    </StoryAuthor>
                  </motion.div>
                </Story>
              ))}
            </StoriesContent>
          </Stories>
        </motion.div>

        {/* Ver Mais Button - Premium */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
          className="flex justify-center pt-6 sm:pt-10 px-4"
        >
          <Button
            size="lg"
            className="group rounded-full px-10 sm:px-14 py-6 sm:py-8 bg-white hover:bg-white text-black font-semibold text-base sm:text-lg transition-all duration-700 hover:scale-[1.08] hover:shadow-[0_20px_80px_rgba(255,255,255,0.3)] active:scale-95 relative overflow-hidden"
            onClick={() => router.push('/acesso')}
          >
            <span className="relative z-10 flex items-center gap-3">
              Fazer Login para Aceder
              <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
