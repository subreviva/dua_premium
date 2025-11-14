"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquarePlus, 
  Search, 
  MoreVertical, 
  Trash2, 
  Archive, 
  Edit2, 
  Check, 
  X,
  Clock,
  MessageSquare,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  isActive: boolean;
  isArchived: boolean;
  messageCount: number;
  modelUsed?: string;
}

interface ChatSessionsSidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  className?: string;
}

export function ChatSessionsSidebar({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onArchiveSession,
  onDeleteSession,
  className,
}: ChatSessionsSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Filtrar sessões por busca
  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupar por data
  const groupedSessions = {
    hoje: filteredSessions.filter(s => isToday(s.lastMessageAt || s.createdAt)),
    ontem: filteredSessions.filter(s => isYesterday(s.lastMessageAt || s.createdAt)),
    semana: filteredSessions.filter(s => isThisWeek(s.lastMessageAt || s.createdAt) && !isToday(s.lastMessageAt || s.createdAt) && !isYesterday(s.lastMessageAt || s.createdAt)),
    antigas: filteredSessions.filter(s => !isThisWeek(s.lastMessageAt || s.createdAt)),
  };

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <div className={cn("flex flex-col h-full bg-black/40 border-r border-white/10", className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <Button
          onClick={onNewSession}
          className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
        >
          <MessageSquarePlus className="w-4 h-4 mr-2" />
          Nova Conversa
        </Button>

        {/* Busca */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Lista de sessões */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Hoje */}
          {groupedSessions.hoje.length > 0 && (
            <SessionGroup
              title="Hoje"
              sessions={groupedSessions.hoje}
              currentSession={currentSession}
              editingId={editingId}
              editTitle={editTitle}
              onSelectSession={onSelectSession}
              onStartEdit={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onEditTitleChange={setEditTitle}
              onArchiveSession={onArchiveSession}
              onDeleteSession={onDeleteSession}
            />
          )}

          {/* Ontem */}
          {groupedSessions.ontem.length > 0 && (
            <SessionGroup
              title="Ontem"
              sessions={groupedSessions.ontem}
              currentSession={currentSession}
              editingId={editingId}
              editTitle={editTitle}
              onSelectSession={onSelectSession}
              onStartEdit={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onEditTitleChange={setEditTitle}
              onArchiveSession={onArchiveSession}
              onDeleteSession={onDeleteSession}
            />
          )}

          {/* Esta Semana */}
          {groupedSessions.semana.length > 0 && (
            <SessionGroup
              title="Esta Semana"
              sessions={groupedSessions.semana}
              currentSession={currentSession}
              editingId={editingId}
              editTitle={editTitle}
              onSelectSession={onSelectSession}
              onStartEdit={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onEditTitleChange={setEditTitle}
              onArchiveSession={onArchiveSession}
              onDeleteSession={onDeleteSession}
            />
          )}

          {/* Antigas */}
          {groupedSessions.antigas.length > 0 && (
            <SessionGroup
              title="Antigas"
              sessions={groupedSessions.antigas}
              currentSession={currentSession}
              editingId={editingId}
              editTitle={editTitle}
              onSelectSession={onSelectSession}
              onStartEdit={startEditing}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
              onEditTitleChange={setEditTitle}
              onArchiveSession={onArchiveSession}
              onDeleteSession={onDeleteSession}
            />
          )}

          {/* Mensagem vazia */}
          {filteredSessions.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-white/20" />
              <p className="text-white/40 text-sm">
                {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Componente de grupo de sessões
interface SessionGroupProps {
  title: string;
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  editingId: string | null;
  editTitle: string;
  onSelectSession: (id: string) => void;
  onStartEdit: (session: ChatSession) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onArchiveSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

function SessionGroup({
  title,
  sessions,
  currentSession,
  editingId,
  editTitle,
  onSelectSession,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onArchiveSession,
  onDeleteSession,
}: SessionGroupProps) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-white/40 mb-2 px-2">{title}</h3>
      <div className="space-y-1">
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            isActive={currentSession?.id === session.id}
            isEditing={editingId === session.id}
            editTitle={editTitle}
            onSelect={() => onSelectSession(session.id)}
            onStartEdit={() => onStartEdit(session)}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
            onEditTitleChange={onEditTitleChange}
            onArchive={() => onArchiveSession(session.id)}
            onDelete={() => onDeleteSession(session.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Item individual de sessão
interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSelect: () => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onArchive: () => void;
  onDelete: () => void;
}

function SessionItem({
  session,
  isActive,
  isEditing,
  editTitle,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onArchive,
  onDelete,
}: SessionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "group relative rounded-lg transition-all",
        isActive && "bg-white/10 border border-white/20"
      )}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 p-2">
          <Input
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit();
              if (e.key === 'Escape') onCancelEdit();
            }}
            className="h-8 text-sm bg-white/5 border-white/20"
            autoFocus
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onSaveEdit}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onCancelEdit}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-white/5",
            isActive && "bg-white/5"
          )}
          onClick={onSelect}
        >
          <MessageSquare className="w-4 h-4 mt-0.5 text-white/60 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{session.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(session.lastMessageAt || session.createdAt)}
              </span>
              {session.messageCount > 0 && (
                <span className="text-xs text-white/40">
                  {session.messageCount} {session.messageCount === 1 ? 'msg' : 'msgs'}
                </span>
              )}
            </div>
          </div>

          {/* Menu de opções */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/20">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartEdit(); }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </motion.div>
  );
}

// Funções auxiliares de data
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function isThisWeek(date: Date): boolean {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return date > weekAgo;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}
