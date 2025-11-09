// ===================================================
// COMMUNITY PAGE - PREMIUM EDITION
// ===================================================
// Ultra-premium community experience
// Sophisticated design with luxury aesthetics
// No emojis, no amateur icons - pure elegance
// ===================================================

"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Grid3x3, Image as ImageIcon, Music as MusicIcon, Sparkles, ArrowLeft, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useCommunityPosts, type PostType } from "@/hooks/useCommunityPosts"
import { CommunityPostCard } from "@/components/community/CommunityPostCard"

// ===================================================
// LOADING SKELETON COMPONENT
// ===================================================
function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
          className="relative bg-black/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="aspect-square bg-gradient-to-br from-white/5 to-white/0" />
          <div className="p-4 space-y-3">
            <div className="h-6 bg-white/5 rounded-lg w-3/4" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="h-4 w-28 bg-white/5 rounded-lg" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="h-4 w-12 bg-white/5 rounded-lg" />
              <div className="h-4 w-12 bg-white/5 rounded-lg" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ===================================================
// ERROR MESSAGE COMPONENT
// ===================================================
function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center min-h-[400px]"
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 flex items-center justify-center mx-auto backdrop-blur-sm">
          <div className="text-3xl">⚠</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-light text-white">Something went wrong</h3>
          <p className="text-sm font-light text-zinc-400 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-light transition-all duration-300"
          >
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ===================================================
// EMPTY STATE COMPONENT
// ===================================================
function EmptyState({ type }: { type: PostType }) {
  const config = {
    all: {
      icon: Grid3x3,
      title: "No posts yet",
      description: "Be the first to share your AI creation with the community"
    },
    image: {
      icon: ImageIcon,
      title: "No images yet",
      description: "Create stunning images in our Image Studio and share them here"
    },
    music: {
      icon: MusicIcon,
      title: "No music yet",
      description: "Compose amazing tracks in our Music Studio and share them here"
    }
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[500px]"
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-white/10 flex items-center justify-center mx-auto backdrop-blur-sm">
          <Icon className="w-12 h-12 text-white/40" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-light text-white">{title}</h3>
          <p className="text-sm font-light text-zinc-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ===================================================
// MAIN COMPONENT
// ===================================================
export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<PostType>("all");
  const { posts, loading, error, hasMore, loadMore, refresh } = useCommunityPosts({ type: activeTab });

  return (
    <div className="min-h-screen bg-black">
      {/* Simple Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/chat" 
            className="text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-light text-white">DUA Community</h1>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 pt-32">
        {/* ===================================================
            HEADER - PREMIUM
            =================================================== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
            <span className="text-sm font-light text-zinc-400 tracking-wide">
              Creator Community
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white">
            Discover
            <span className="block mt-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Creations
            </span>
          </h1>

          <p className="text-lg font-light text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Explore extraordinary content created by our community of AI artists and creators
          </p>
        </motion.div>

        {/* ===================================================
            TABS - PREMIUM
            =================================================== */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PostType)} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-full">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full px-6 py-2 font-light transition-all"
              >
                <Grid3x3 className="w-4 h-4 mr-2" strokeWidth={1.5} />
                All
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full px-6 py-2 font-light transition-all"
              >
                <ImageIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Images
              </TabsTrigger>
              <TabsTrigger
                value="music"
                className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full px-6 py-2 font-light transition-all"
              >
                <MusicIcon className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Music
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ===================================================
              ALL CONTENT TAB
              =================================================== */}
          <TabsContent value="all">
            {loading && <LoadingSkeleton />}
            {error && <ErrorMessage message={error} onRetry={refresh} />}
            {!loading && !error && posts.length === 0 && <EmptyState type="all" />}
            {!loading && !error && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CommunityPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadMore}
                      disabled={loading}
                      className="group px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all font-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <span>Load More</span>
                          <Grid3x3 className="w-4 h-4 ml-2 inline-block group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ===================================================
              IMAGES TAB
              =================================================== */}
          <TabsContent value="image">
            {loading && <LoadingSkeleton />}
            {error && <ErrorMessage message={error} onRetry={refresh} />}
            {!loading && !error && posts.length === 0 && <EmptyState type="image" />}
            {!loading && !error && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CommunityPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadMore}
                      disabled={loading}
                      className="group px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all font-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <span>Load More</span>
                          <ImageIcon className="w-4 h-4 ml-2 inline-block group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>

          {/* ===================================================
              MUSIC TAB
              =================================================== */}
          <TabsContent value="music">
            {loading && <LoadingSkeleton />}
            {error && <ErrorMessage message={error} onRetry={refresh} />}
            {!loading && !error && posts.length === 0 && <EmptyState type="music" />}
            {!loading && !error && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CommunityPostCard post={post} />
                    </motion.div>
                  ))}
                </div>
                
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={loadMore}
                      disabled={loading}
                      className="group px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all font-light text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 inline-block animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <span>Load More</span>
                          <MusicIcon className="w-4 h-4 ml-2 inline-block group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
