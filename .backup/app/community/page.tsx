"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, ImageIcon, Video, Heart, MessageCircle, Share2, User } from "lucide-react"
import { BeamsBackground } from "@/components/ui/beams-background"
import { OrbitingAvatarsCTA } from "@/components/ui/orbiting-avatars"
import { MasonryGrid } from "@/components/ui/image-testimonial-grid"
import { MusicPlayerCard } from "@/components/ui/music-player-card"
import { GlassmorphismProfileCard } from "@/components/ui/glassmorphism-profile-card"
import { PremiumNavbar } from "@/components/ui/premium-navbar"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const mockImages = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    title: "Cidade Cyberpunk",
    artist: "Maria Silva",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    likes: 234,
    comments: 45,
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
    title: "Retrato Artístico",
    artist: "Ana Santos",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
    likes: 892,
    comments: 123,
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&q=80",
    title: "Paisagem Futurista",
    artist: "Pedro Costa",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro",
    likes: 456,
    comments: 67,
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&q=80",
    title: "Arte Abstrata",
    artist: "Sofia Oliveira",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    likes: 678,
    comments: 89,
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=800&q=80",
    title: "Natureza Digital",
    artist: "Lucas Ferreira",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
    likes: 345,
    comments: 56,
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1620641788813-04466f872be2?w=800&q=80",
    title: "Espaço Sideral",
    artist: "Beatriz Lima",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beatriz",
    likes: 567,
    comments: 78,
  },
]

const mockMusic = [
  {
    id: "1",
    albumArt: "https://images.unsplash.com/photo-1470225628813-04466f872be2?w=800&q=80",
    songTitle: "Melodia Ambiente",
    artistName: "João Costa",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    likes: 567,
    comments: 89,
  },
  {
    id: "2",
    albumArt: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    songTitle: "Ritmo Eletrônico",
    artistName: "Carla Mendes",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carla",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    likes: 789,
    comments: 123,
  },
  {
    id: "3",
    albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    songTitle: "Jazz Suave",
    artistName: "Ricardo Alves",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ricardo",
    audioSrc: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    likes: 432,
    comments: 67,
  },
]

const mockVideos = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&q=80",
    title: "Animação 3D Futurista",
    artist: "Miguel Santos",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
    duration: "2:34",
    likes: 1234,
    comments: 234,
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    title: "Motion Graphics",
    artist: "Inês Rodrigues",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ines",
    duration: "1:45",
    likes: 987,
    comments: 156,
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    title: "Visualização de Dados",
    artist: "Tiago Pereira",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tiago",
    duration: "3:12",
    likes: 765,
    comments: 98,
  },
  {
    id: "4",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    title: "Arte Generativa",
    artist: "Catarina Lopes",
    artistAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Catarina",
    duration: "2:56",
    likes: 543,
    comments: 87,
  },
]

const ImageCard = ({ image }: { image: (typeof mockImages)[0] }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(image.likes)
  const [showProfile, setShowProfile] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1)
  }

  return (
    <>
      <motion.div
        className="relative rounded-2xl overflow-hidden group bg-card/40 backdrop-blur-xl border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-auto object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-0 left-0 p-4 text-white">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={image.artistAvatar || "/placeholder.svg"}
              className="w-8 h-8 rounded-full border-2 border-white/80"
              alt={image.artist}
            />
            <span className="font-semibold text-sm drop-shadow-md">{image.artist}</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between text-white">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 ${isLiked ? "text-red-500" : ""}`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{localLikes}</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{image.comments}</span>
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showProfile && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProfile(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GlassmorphismProfileCard
              avatarUrl={image.artistAvatar}
              name={image.artist}
              title="Artista Digital"
              bio="Criador de arte digital e fotografia gerada por IA. Apaixonado por explorar novos estilos visuais."
              socialLinks={[
                {
                  id: "profile",
                  icon: User,
                  label: "Ver Perfil",
                  href: `/profile/${image.artist.toLowerCase().replace(" ", "")}`,
                },
              ]}
              actionButton={{
                text: "Ver Perfil Completo",
                href: `/profile/${image.artist.toLowerCase().replace(" ", "")}`,
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

const VideoCard = ({ video }: { video: (typeof mockVideos)[0] }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [localLikes, setLocalLikes] = useState(video.likes)
  const [showProfile, setShowProfile] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLocalLikes(isLiked ? localLikes - 1 : localLikes + 1)
  }

  return (
    <>
      <motion.div
        className="relative rounded-2xl overflow-hidden group bg-card/40 backdrop-blur-xl border border-white/10"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative aspect-video">
          <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Video className="w-8 h-8 text-black" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
            {video.duration}
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity w-full"
          >
            <img src={video.artistAvatar || "/placeholder.svg"} className="w-10 h-10 rounded-full" alt={video.artist} />
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-sm text-foreground">{video.artist}</h3>
              <p className="text-xs text-muted-foreground">Há 3 horas</p>
            </div>
          </button>

          <h2 className="text-base font-bold mb-3">{video.title}</h2>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${isLiked ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm font-medium">{localLikes}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">{video.comments}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showProfile && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProfile(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GlassmorphismProfileCard
              avatarUrl={video.artistAvatar}
              name={video.artist}
              title="Criador de Vídeo"
              bio="Especialista em motion graphics e animação 3D. Transformando ideias em experiências visuais."
              socialLinks={[
                {
                  id: "profile",
                  icon: User,
                  label: "Ver Perfil",
                  href: `/profile/${video.artist.toLowerCase().replace(" ", "")}`,
                },
              ]}
              actionButton={{
                text: "Ver Perfil Completo",
                href: `/profile/${video.artist.toLowerCase().replace(" ", "")}`,
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default function CommunityPage() {
  const [hasAccessedCommunity, setHasAccessedCommunity] = useState(false)
  const [columns, setColumns] = useState(3)
  const router = useRouter()

  useEffect(() => {
    const getColumns = (width: number) => {
      if (width < 640) return 1
      if (width < 1024) return 2
      return 3
    }

    const handleResize = () => {
      setColumns(getColumns(window.innerWidth))
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const communityAvatars = [
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop", alt: "Criador 1" },
    { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop", alt: "Criador 2" },
    { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop", alt: "Criador 3" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", alt: "Criador 4" },
    { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop", alt: "Criador 5" },
    { src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150&h=150&fit=crop", alt: "Criador 6" },
  ]

  if (!hasAccessedCommunity) {
    return (
      <div className="relative w-full min-h-screen">
        <div className="fixed inset-0 z-0">
          <BeamsBackground intensity="medium" />
        </div>

        <PremiumNavbar variant="transparent" credits={undefined} />

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <OrbitingAvatarsCTA
            title="Bem-vindo à Comunidade DUA"
            description="Explore milhares de criações de arte geradas por IA. Descubra galerias de imagens, vídeos e músicas criadas pela nossa comunidade vibrante."
            buttonText="Explorar Comunidade"
            buttonProps={{
              onClick: () => setHasAccessedCommunity(true),
              className:
                "bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/50 active:scale-95 h-11 sm:h-10 text-sm sm:text-base",
            }}
            avatars={communityAvatars}
            orbitRadius={22}
            orbitDuration={50}
            className="bg-transparent"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 z-0">
        <BeamsBackground intensity="subtle" />
      </div>

      <PremiumNavbar showBackButton={true} backLink="/" variant="solid" credits={undefined} />

      <div className="relative z-10 min-h-screen pt-4 sm:pt-6 lg:pt-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2 px-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Comunidade DUA</h1>
            <p className="text-sm sm:text-base text-white/70">
              Explore criações de imagens, músicas e vídeos da comunidade
            </p>
          </div>

          <Tabs defaultValue="imagem" className="w-full">
            <TabsList className="bg-black/40 backdrop-blur-xl border border-white/10 w-full sm:w-auto h-auto p-1">
              <TabsTrigger
                value="imagem"
                className="gap-1.5 sm:gap-2 flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Imagem</span>
              </TabsTrigger>
              <TabsTrigger
                value="musica"
                className="gap-1.5 sm:gap-2 flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Música</span>
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="gap-1.5 sm:gap-2 flex-1 sm:flex-none h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Vídeo</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="imagem" className="mt-4 sm:mt-6">
              <MasonryGrid columns={columns} gap={3}>
                {mockImages.map((image) => (
                  <ImageCard key={image.id} image={image} />
                ))}
              </MasonryGrid>
            </TabsContent>

            <TabsContent value="musica" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {mockMusic.map((music) => (
                  <MusicPlayerCard key={music.id} {...music} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="video" className="mt-4 sm:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {mockVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
