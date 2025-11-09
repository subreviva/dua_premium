// ===================================================
// COMPONENT: CommunityPostCard - PREMIUM
// ===================================================
// Card elegante para exibir posts da comunidade
// Features: Likes, comments, preview, glassmorphism
// ===================================================

'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLike } from '@/hooks/useLike';
import type { CommunityPost } from '@/hooks/useCommunityPosts';

interface CommunityPostCardProps {
  post: CommunityPost;
  onOpenDetails?: (post: CommunityPost) => void;
}

export function CommunityPostCard({ post, onOpenDetails }: CommunityPostCardProps) {
  const { liked, likesCount, toggleLike, loading: likeLoading } = useLike(
    post.id,
    false, // TODO: Check if current user liked
    post.likes_count
  );
  
  const [playing, setPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (!audioElement) return;
    
    if (playing) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setPlaying(!playing);
  };

  const handleCardClick = () => {
    if (onOpenDetails) {
      onOpenDetails(post);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Gradient glow on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/20 group-hover:to-blue-600/20 rounded-2xl blur transition-all duration-500" />
      
      {/* Card */}
      <div className="relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:border-white/10 transition-all duration-300">
        
        {/* Media */}
        <div className="relative aspect-square overflow-hidden">
          {post.type === 'image' ? (
            <img
              src={post.media_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full bg-gradient-to-br from-purple-950/50 to-blue-950/50 flex items-center justify-center">
              {/* Music visualization placeholder */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
              
              {/* Play button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all"
              >
                {playing ? (
                  <Pause className="w-8 h-8 text-white" strokeWidth={1.5} />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" strokeWidth={1.5} />
                )}
              </button>

              {/* Hidden audio element */}
              <audio
                ref={setAudioElement}
                src={post.media_url}
                onEnded={() => setPlaying(false)}
                className="hidden"
              />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-light text-white text-lg tracking-wide truncate">
            {post.title}
          </h3>

          {/* Author */}
          <div className="flex items-center gap-2">
            <img
              src={post.user.avatar}
              alt={post.user.name}
              className="w-6 h-6 rounded-full border border-white/10"
            />
            <span className="text-sm font-light text-zinc-400">
              {post.user.name}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-white/5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
              disabled={likeLoading}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors group/btn disabled:opacity-50"
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  liked 
                    ? 'fill-red-500 text-red-500 scale-110' 
                    : 'group-hover/btn:scale-110'
                }`}
                strokeWidth={1.5}
              />
              <span className="font-light">{likesCount}</span>
            </button>

            <button
              onClick={handleCardClick}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors group/btn"
            >
              <MessageCircle 
                className="w-4 h-4 group-hover/btn:scale-110 transition-transform" 
                strokeWidth={1.5} 
              />
              <span className="font-light">{post.comments_count}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
