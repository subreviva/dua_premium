"use client"

import { Search, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface WorkspacesViewProps {
  onSelectWorkspace: (name: string) => void
}

export function WorkspacesView({ onSelectWorkspace }: WorkspacesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [workspaces, setWorkspaces] = useState([
    {
      name: "My Workspace",
      songCount: 994,
      lastUpdated: "Last updated 26 de outubro de 2025 às 18:15",
      gradient: "from-pink-500 via-red-500 to-yellow-500",
    },
  ])

  const handleNewWorkspace = () => {
    const newWorkspace = {
      name: `Workspace ${workspaces.length + 1}`,
      songCount: 0,
      lastUpdated: `Last updated ${new Date().toLocaleString()}`,
      gradient: "from-blue-500 via-purple-500 to-pink-500",
    }
    setWorkspaces([...workspaces, newWorkspace])
    console.log("[v0] Created new workspace:", newWorkspace.name)
  }

  const handleDeleteWorkspace = () => {
    if (workspaces.length > 1) {
      setWorkspaces(workspaces.slice(0, -1))
      console.log("[v0] Deleted last workspace")
    } else {
      console.log("[v0] Cannot delete the last workspace")
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("[v0] Searching workspaces:", query)
  }

  const filteredWorkspaces = workspaces.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex-1 bg-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Workspaces ({workspaces.length})</h2>
        <div className="flex items-center gap-2">
          <Button className="bg-white text-black hover:bg-neutral-200" onClick={handleNewWorkspace}>
            <Plus className="mr-2 h-4 w-4" />
            New Workspace
          </Button>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={handleDeleteWorkspace}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search"
          className="pl-10 bg-neutral-900 border-neutral-800"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkspaces.map((workspace) => (
          <button key={workspace.name} onClick={() => onSelectWorkspace(workspace.name)} className="group text-left">
            <div
              className={`aspect-square rounded-2xl bg-gradient-to-br ${workspace.gradient} mb-3 relative overflow-hidden`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-6xl font-bold opacity-20">{workspace.songCount}</span>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-medium">{workspace.songCount} Songs</span>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-neutral-300 transition-colors">
              {workspace.name}
            </h3>
            <p className="text-sm text-neutral-400">{workspace.lastUpdated}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
