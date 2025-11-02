
import React, { useState, useRef, useEffect } from 'react';
import { ApiFunctions, ChatMessage } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Spinner from '../ui/Spinner';
import { Chat } from '@google/genai';

interface DesignAssistantPanelProps {
  api: ApiFunctions;
  isLoading: boolean;
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
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Assistente de Design</h2>
        <p className="text-sm text-gray-400">Converse com DUA. Peça ideias, códigos de cor, pares de fontes, ou ajuda para refinar uma instrução.</p>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-600'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}{isLoading && msg.id === messages[messages.length - 1].id && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" />}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Textarea
          id="chat-input"
          label=""
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="A sua mensagem..."
          rows={1}
          className="resize-none"
          disabled={isLoading}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
        />
        <Button type="submit" disabled={isLoading || !input.trim()} className="px-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </Button>
      </form>
    </div>
  );
};

export default DesignAssistantPanel;
