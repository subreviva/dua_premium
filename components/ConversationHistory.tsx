"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Clock,
  Edit2,
  Check,
  X,
  MoreVertical
} from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Conversation, GroupedConversations } from '@/hooks/useConversations';

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onExportConversations: () => void;
  groupConversationsByDate: () => GroupedConversations;
  isSyncing: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onRenameConversation,
  onExportConversations,
  groupConversationsByDate,
  isSyncing,
  isOpen,
  onClose
}: ConversationHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agrupar conversas
  const groupedConversations = useMemo(() => groupConversationsByDate(), [groupConversationsByDate]);

  // Focar input quando começa a editar
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startEditing = (conv: Conversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
  };

  const handleNewChat = () => {
    onNewConversation();
    // Fechar sidebar no mobile após criar nova conversa
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    // Fechar sidebar no mobile após selecionar conversa
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja deletar esta conversa?')) {
      onDeleteConversation(id);
      setMenuOpenId(null);
    }
  };

  // Renderizar lista de conversas
  const renderConversationList = (convList: Conversation[], startIndex: number) => {
    return convList.map((conv, idx) => {
      const index = startIndex + idx;
      const isActive = conv.id === currentConversationId;
      const isEditing = editingId === conv.id;
      const hasMenu = menuOpenId === conv.id;

      return (
        <motion.div
          key={conv.id}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ delay: index * 0.03 }}
          className="relative"
        >
          <button
            onClick={() => !isEditing && handleSelectConversation(conv.id)}
            disabled={isEditing}
            className={`
              w-full p-3 rounded-lg text-left transition-all duration-200 group
              ${isActive 
                ? 'bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 border border-purple-500/30' 
                : 'hover:bg-zinc-800/50 border border-transparent'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <MessageSquare className={`
                w-4 h-4 mt-0.5 flex-shrink-0
                ${isActive ? 'text-purple-400' : 'text-zinc-500 group-hover:text-zinc-400'}
              `} />
              
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="flex-1 bg-zinc-900 border border-purple-500 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <button
                      onClick={saveEdit}
                      className="p-1 hover:bg-green-600/20 rounded text-green-400"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 hover:bg-red-600/20 rounded text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`
                      text-sm font-medium truncate
                      ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}
                    `}>
                      {conv.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-xs text-zinc-500">
                        {formatRelativeTime(conv.updatedAt)}
                      </span>
                      <span className="text-xs text-zinc-600">
                        • {conv.messages.length} msg
                      </span>
                    </div>
                  </>
                )}
              </div>

              {!isEditing && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(hasMenu ? null : conv.id);
                    }}
                    className="p-1 rounded hover:bg-zinc-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                  </button>

                  <AnimatePresence>
                    {hasMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => startEditing(conv)}
                          className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                        >
                          <Edit2 className="w-3 h-3" />
                          Renomear
                        </button>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/30 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Deletar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </button>
        </motion.div>
      );
    });
  };

  return (
    <>
      {/* Backdrop para mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          opacity: isOpen ? 1 : 0
        }}
        transition={{ 
          type: 'spring', 
          stiffness: 300, 
          damping: 30 
        }}
        className="fixed top-0 left-0 h-full w-[280px] sm:w-[320px] bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border-r border-zinc-800/50 z-50 md:relative md:opacity-100 flex flex-col"
      >


        {/* Lista de conversas agrupadas por data */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {conversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 px-4"
              >
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
                <p className="text-sm text-zinc-500">Nenhuma conversa ainda</p>
                <p className="text-xs text-zinc-600 mt-1">Clique em "Nova Conversa" para começar</p>
              </motion.div>
            ) : (
              <>
                {/* Grupo: Hoje */}
                {groupedConversations.hoje.length > 0 && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 px-1"
                    >
                      <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                        Hoje
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-purple-500/30 to-transparent"></div>
                      <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {groupedConversations.hoje.length}
                      </span>
                    </motion.div>
                    {renderConversationList(groupedConversations.hoje, 0)}
                  </div>
                )}

                {/* Grupo: Ontem */}
                {groupedConversations.ontem.length > 0 && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 }}
                      className="flex items-center gap-2 px-1"
                    >
                      <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                        Ontem
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent"></div>
                      <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {groupedConversations.ontem.length}
                      </span>
                    </motion.div>
                    {renderConversationList(groupedConversations.ontem, groupedConversations.hoje.length)}
                  </div>
                )}

                {/* Grupo: Últimos 7 dias */}
                {groupedConversations.semana.length > 0 && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-2 px-1"
                    >
                      <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        Últimos 7 dias
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
                      <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {groupedConversations.semana.length}
                      </span>
                    </motion.div>
                    {renderConversationList(groupedConversations.semana, groupedConversations.hoje.length + groupedConversations.ontem.length)}
                  </div>
                )}

                {/* Grupo: Últimos 30 dias */}
                {groupedConversations.mes.length > 0 && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 px-1"
                    >
                      <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        Últimos 30 dias
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 to-transparent"></div>
                      <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {groupedConversations.mes.length}
                      </span>
                    </motion.div>
                    {renderConversationList(groupedConversations.mes, groupedConversations.hoje.length + groupedConversations.ontem.length + groupedConversations.semana.length)}
                  </div>
                )}

                {/* Grupo: Mais antigos */}
                {groupedConversations.antigos.length > 0 && (
                  <div className="space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2 px-1"
                    >
                      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Mais antigos
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-zinc-700/30 to-transparent"></div>
                      <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">
                        {groupedConversations.antigos.length}
                      </span>
                    </motion.div>
                    {renderConversationList(groupedConversations.antigos, groupedConversations.hoje.length + groupedConversations.ontem.length + groupedConversations.semana.length + groupedConversations.mes.length)}
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Footer com export */}
        <div className="flex-shrink-0 p-4 border-t border-zinc-800/50 space-y-3">
          <button
            onClick={onExportConversations}
            className="w-full h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-sm flex items-center justify-center gap-2 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Conversas
          </button>
          
          <p className="text-xs text-zinc-600 text-center">
            {conversations.length} conversa{conversations.length !== 1 ? 's' : ''} • 
            {isSyncing ? ' 🔄 Sincronizando...' : ' ☁️ Sincronizado'}
          </p>
        </div>
      </motion.aside>
    </>
  );
}
