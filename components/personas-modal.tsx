"use client"

import { useState } from "react"
import { X, Search, Heart, Link2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

import { safeParse } from '@/lib/fetch-utils';

interface Persona {
  id: string
  name: string
  description: string
  liked: boolean
}

interface PersonasModalProps {
  onClose: () => void
  songContext?: {
    taskId: string
    musicIndex: number
    title: string
    genre: string
  }
}

const mockPersonas = [
  {
    id: "1",
    name: "paulo",
    description: "romantic 80' punkrock blues- voz em português de portuga...",
    liked: false,
  },
  {
    id: "2",
    name: "Untitled Persona",
    description: "Começa com guitarra flamenca solando livre, acompanhad...",
    liked: false,
  },
  {
    id: "3",
    name: "Untitled Persona",
    description: "Começa com guitarra flamenca solando livre, acompanhad...",
    liked: false,
  },
  {
    id: "4",
    name: "Untitled Persona",
    description: "Estilo: Hip-hop trap melódico com influência cigana/flamen...",
    liked: false,
  },
  {
    id: "5",
    name: "Untitled Persona",
    description: "Estilo: Hip-hop trap melódico com influência cigana/flamen...",
    liked: false,
  },
]

export function PersonasModal({ onClose, songContext }: PersonasModalProps) {
  const [activeTab, setActiveTab] = useState<"my" | "favorites">("my")
  const [searchQuery, setSearchQuery] = useState("")
  const [personas, setPersonas] = useState(mockPersonas)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [personaName, setPersonaName] = useState("")
  const [personaDescription, setPersonaDescription] = useState("")

  const handleCreatePersona = async () => {
    if (songContext) {
      // Create persona directly from song context
      setIsCreating(true)
      try {
        const response = await fetch("/api/suno/persona/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: songContext.taskId,
            musicIndex: songContext.musicIndex,
            name: songContext.title || "Untitled Persona",
            description: songContext.genre || "A unique musical persona with distinctive style",
          }),
        })

        const data = await safeParse<{ code: number; data?: { personaId: string; name: string; description: string }; msg?: string }>(response)
        if (!data) {
          throw new Error('Invalid response from persona API');
        }
        // console.log("[v0] Persona created:", data)

        if (data.code === 200 && data.data?.personaId) {
          const newPersona = {
            id: data.data.personaId,
            name: data.data.name,
            description: data.data.description,
            liked: false,
          }
          setPersonas([newPersona, ...personas])
          alert(`Persona "${data.data.name}" created successfully!`)
        } else if (data.code === 409) {
          alert("A persona already exists for this music")
        } else {
          alert(`Error creating persona: ${data.msg}`)
        }
      } catch (error) {
        // console.error("[v0] Create persona error:", error)
        alert("Failed to create persona. Please try again.")
      } finally {
        setIsCreating(false)
      }
    } else {
      // Show dialog to enter custom persona details
      setShowCreateDialog(true)
    }
  }

  const handleCustomPersonaCreate = async () => {
    if (!personaName || !personaDescription) {
      alert("Please enter both name and description")
      return
    }

    alert("To create a persona, you need to generate music first. The persona will be based on your generated music.")
    setShowCreateDialog(false)
    setPersonaName("")
    setPersonaDescription("")
  }

  const handleLikePersona = (personaId: string) => {
    setPersonas(personas.map((p) => (p.id === personaId ? { ...p, liked: !p.liked } : p)))
    // console.log("[v0] Toggled like for persona:", personaId)
  }

  const handleCopyLink = (personaId: string) => {
    const link = `${window.location.origin}/persona/${personaId}`
    navigator.clipboard.writeText(link)
    // console.log("[v0] Copied persona link:", link)
    alert("Persona link copied to clipboard!")
  }

  const filteredPersonas = personas.filter((persona) => {
    if (activeTab === "favorites" && !persona.liked) return false
    if (searchQuery && !persona.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div
          className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Personas</h2>
            <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-4 flex gap-2">
            <Button
              variant={activeTab === "my" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("my")}
              className={`flex-1 ${activeTab === "my" ? "bg-neutral-800" : ""}`}
            >
              My Personas
            </Button>
            <Button
              variant={activeTab === "favorites" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 ${activeTab === "favorites" ? "bg-neutral-800" : ""}`}
            >
              Favorites
            </Button>
          </div>

          {/* Search */}
          <div className="px-6 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-neutral-800 border-neutral-700"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {/* Create New Persona */}
            <button
              className="w-full p-4 bg-neutral-800 hover:bg-neutral-750 rounded-lg flex items-center gap-3 transition-colors disabled:opacity-50"
              onClick={handleCreatePersona}
              disabled={isCreating}
            >
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium block">
                  {isCreating ? "Creating..." : songContext ? "Create Persona from Song" : "Create New Persona"}
                </span>
                {songContext && <span className="text-xs text-neutral-400">Based on: {songContext.title}</span>}
              </div>
            </button>

            {/* Personas List */}
            {filteredPersonas.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <p>No personas found</p>
              </div>
            ) : (
              filteredPersonas.map((persona) => (
                <div
                  key={persona.id}
                  className="p-4 bg-neutral-800 hover:bg-neutral-750 rounded-lg flex items-start gap-3 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{persona.name}</h3>
                    <p className="text-sm text-neutral-400 line-clamp-2">{persona.description}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className={`transition-colors ${persona.liked ? "text-pink-500" : "text-neutral-400 hover:text-pink-500"}`}
                      onClick={() => handleLikePersona(persona.id)}
                    >
                      <Heart className="h-5 w-5" fill={persona.liked ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="text-neutral-400 hover:text-white transition-colors"
                      onClick={() => handleCopyLink(persona.id)}
                    >
                      <Link2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="glass-effect border-white/10">
          <DialogHeader>
            <DialogTitle>Create New Persona</DialogTitle>
            <DialogDescription>
              Personas are created from generated music. Generate a song first, then create a persona from it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Persona Name</label>
              <Input
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="e.g., Electronic Pop Singer"
                className="bg-neutral-800 border-neutral-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={personaDescription}
                onChange={(e) => setPersonaDescription(e.target.value)}
                placeholder="Describe the musical style, characteristics, and personality..."
                className="bg-neutral-800 border-neutral-700 min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCustomPersonaCreate} className="flex-1 bg-purple-600 hover:bg-purple-700">
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
