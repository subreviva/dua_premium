"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { CreatePanel } from "@/components/create-panel"
import { WorkspacePanel } from "@/components/workspace-panel"
import { WorkspacesView } from "@/components/workspaces-view"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [currentView, setCurrentView] = useState<"create" | "workspaces">("create")
  const [selectedWorkspace, setSelectedWorkspace] = useState("My Workspace")
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden bg-neutral-900/80 backdrop-blur"
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={`fixed inset-0 bg-black/80 z-40 lg:hidden transition-opacity ${showMobileSidebar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setShowMobileSidebar(false)}
      />
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform lg:relative lg:translate-x-0 ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view)
            setShowMobileSidebar(false)
          }}
          selectedWorkspace={selectedWorkspace}
        />
      </div>

      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        <div className={`${currentView === "workspaces" ? "hidden lg:flex" : "flex"} w-full lg:w-auto`}>
          <CreatePanel />
        </div>

        {currentView === "create" ? (
          <WorkspacePanel workspaceName={selectedWorkspace} />
        ) : (
          <WorkspacesView
            onSelectWorkspace={(name) => {
              setSelectedWorkspace(name)
              setCurrentView("create")
            }}
          />
        )}
      </div>
    </div>
  )
}
