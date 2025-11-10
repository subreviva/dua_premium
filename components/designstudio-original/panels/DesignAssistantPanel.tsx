
import React, { useState, useRef, useEffect } from 'react';
import { ApiFunctions, ChatMessage } from '@/types/designstudio';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Spinner from '../ui/Spinner';
import { Chat } from '@google/genai';
import PremiumPanelHeader from '../ui/PremiumPanelHeader';
import { MessageSquare, Send } from 'lucide-react';

interface DesignAssistantPanelProps {
  api: ApiFunctions;
  isLoading: boolean;
  templatePrompt?: string;
  styleSuffixes?: string;
}

const DesignAssistantPanel: React.FC<DesignAssistantPanelProps> = ({ api, isLoading }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (api.startChat) {
      setChat(api.startChat());
    }
  }, [api.startChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || !api.sendMessageStream || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const modelMessageId = Date.now() + 1;
    setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

    await api.sendMessageStream(chat, input, (chunk) => {
      setMessages(prev => prev.map(msg => 
        msg.id === modelMessageId ? { ...msg, text: msg.text + chunk } : msg
      ));
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <PremiumPanelHeader
        icon={MessageSquare}
        title="Assistente de Design"
        description="Converse com DUA. Peça ideias, códigos de cor, combinações de fontes ou refine as suas instruções."
        gradient="from-indigo-500/20 to-violet-500/20"
      />
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 px-6">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-sm text-white/40">Comece uma conversa sobre design</p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-4 py-3 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-white/5 backdrop-blur-sm border border-white/10'
            }`}>
              <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                {msg.text}
                {isLoading && msg.id === messages[messages.length - 1].id && (
                  <span className="inline-block w-1.5 h-4 bg-white/80 animate-pulse ml-1 rounded-sm" />
                )}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 pt-2 border-t border-white/5">
        <div className="flex-grow">
          <Textarea
            id="chat-input"
            label=""
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escreva a sua mensagem..."
            rows={2}
            className="resize-none"
            disabled={isLoading}
            onKeyDown={(e) => { 
              if (e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSubmit(e); 
              } 
            }}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim()} 
          className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-lg shadow-indigo-500/25"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default DesignAssistantPanel;
