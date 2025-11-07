"use client"

import * as React from "react"
import { X } from "lucide-react"

export default function KeyboardShortcutsOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcuts = [
    {
      category: "Playback",
      items: [
        { key: "Space", description: "Play/Pause all tracks" },
        { key: "L", description: "Toggle loop" },
        { key: "Home", description: "Go to start" },
        { key: "End", description: "Go to end" },
      ],
    },
    {
      category: "Track Control",
      items: [
        { key: "M", description: "Mute selected track" },
        { key: "S", description: "Solo selected track" },
        { key: "R", description: "Reset track controls" },
        { key: "E", description: "Toggle effects panel" },
      ],
    },
    {
      category: "Mixing",
      items: [
        { key: "↑/↓", description: "Adjust volume" },
        { key: "←/→", description: "Adjust pan" },
        { key: "Shift + R", description: "Reset all tracks" },
      ],
    },
    {
      category: "Navigation",
      items: [
        { key: "1-9", description: "Select track 1-9" },
        { key: "Cmd/Ctrl + M", description: "Add marker" },
        { key: "?", description: "Show/hide shortcuts" },
      ],
    },
    { category: "Export", items: [{ key: "Cmd/Ctrl + E", description: "Export mix" }] },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 bg-zinc-950 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950">
          <h2 className="text-xl font-semibold text-zinc-100">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-all text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((section) => (
              <div key={section.category} className="space-y-3">
                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-zinc-400">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded text-zinc-300 whitespace-nowrap">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 text-center">
          <p className="text-xs text-zinc-500">
            Press <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-400">?</kbd> or{" "}
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 rounded text-zinc-400">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  )
}
