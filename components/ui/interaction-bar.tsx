"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share2, Bookmark, Sparkles, Lightbulb, ThumbsUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface InteractionBarProps {
  likes?: number
  comments?: number
  shares?: number
  isLiked?: boolean
  isBookmarked?: boolean
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
  onBookmark?: () => void
  onReaction?: (reaction: string) => void
  className?: string
}

export function InteractionBar({
  likes = 0,
  comments = 0,
  shares = 0,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
  onReaction,
  className,
}: InteractionBarProps) {
  const [liked, setLiked] = useState(isLiked)
  const [bookmarked, setBookmarked] = useState(isBookmarked)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    onLike?.()
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
    onBookmark?.()
  }

  const handleReaction = (reaction: string) => {
    onReaction?.(reaction)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Like Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          "gap-1.5 transition-all",
          liked ? "text-pink-500 hover:text-pink-600" : "text-white/70 hover:text-white",
        )}
      >
        <Heart className={cn("w-4 h-4", liked && "fill-current")} />
        <span className="text-xs">{likeCount}</span>
      </Button>

      {/* Comment Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComment}
        className="gap-1.5 text-white/70 hover:text-white transition-all"
      >
        <MessageCircle className="w-4 h-4" />
        <span className="text-xs">{comments}</span>
      </Button>

      {/* Reactions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white transition-all">
            <Sparkles className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-black/95 backdrop-blur-xl border-white/10 text-white">
          <DropdownMenuItem onClick={() => handleReaction("amazing")} className="gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>Incrível</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleReaction("inspiring")} className="gap-2 cursor-pointer">
            <Lightbulb className="w-4 h-4 text-blue-500" />
            <span>Inspirador</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleReaction("useful")} className="gap-2 cursor-pointer">
            <ThumbsUp className="w-4 h-4 text-green-500" />
            <span>Útil</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Share Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onShare}
        className="gap-1.5 text-white/70 hover:text-white transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-xs">{shares}</span>
      </Button>

      {/* Bookmark Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBookmark}
        className={cn(
          "transition-all ml-auto",
          bookmarked ? "text-cyan-500 hover:text-cyan-600" : "text-white/70 hover:text-white",
        )}
      >
        <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
      </Button>
    </div>
  )
}
