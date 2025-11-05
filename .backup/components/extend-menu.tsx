"use client"

interface ExtendMenuProps {
  onClose: () => void
}

export function ExtendMenu({ onClose }: ExtendMenuProps) {
  const options = [
    { id: "cover", label: "Cover", icon: "🎵" },
    { id: "extend", label: "Extend", icon: "➡️" },
    { id: "add-vocals", label: "Add Vocals", icon: "🎤" },
    { id: "add-instrumental", label: "Add Instrumental", icon: "🎸" },
    { id: "use-styles", label: "Use Styles & Lyrics", icon: "📝" },
  ]

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-56 glass-effect border border-white/10 rounded-lg shadow-xl z-50 py-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              // console.log(`[v0] ${option.label} selected`)
              onClose()
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
          >
            <span className="text-lg">{option.icon}</span>
            <span className="text-sm font-medium">{option.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
