'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon,
  Music,
  Video,
  File,
  Link2,
  Upload,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface Attachment {
  id: string;
  file?: File;
  url?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'link' | 'other';
  name: string;
  size?: number;
  preview?: string;
}

interface AttachmentInputProps {
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export function AttachmentInput({
  onAttachmentsChange,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt'],
  className
}: AttachmentInputProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): Attachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
      return 'document';
    }
    return 'other';
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'link':
        return <Link2 className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const createPreview = async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    setUploading(true);
    const newAttachments: Attachment[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles - attachments.length); i++) {
      const file = files[i];
      
      // Validar tamanho
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`Arquivo "${file.name}" excede o tamanho máximo de ${maxFileSize}MB`);
        continue;
      }

      const preview = await createPreview(file);
      
      newAttachments.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        type: getFileType(file),
        name: file.name,
        size: file.size,
        preview
      });
    }

    const updated = [...attachments, ...newAttachments];
    setAttachments(updated);
    onAttachmentsChange?.(updated);
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const addLink = () => {
    if (!linkUrl.trim()) return;

    try {
      new URL(linkUrl); // Validar URL
      
      const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        url: linkUrl,
        type: 'link',
        name: linkUrl,
      };

      const updated = [...attachments, newAttachment];
      setAttachments(updated);
      onAttachmentsChange?.(updated);
      setLinkUrl('');
      setShowLinkInput(false);
    } catch {
      alert('URL inválida');
    }
  };

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(a => a.id !== id);
    setAttachments(updated);
    onAttachmentsChange?.(updated);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={attachments.length >= maxFiles || uploading}
          className="h-8 gap-2"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
          <span className="text-xs">Anexar</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          disabled={attachments.length >= maxFiles}
          className="h-8 gap-2"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-xs">Link</span>
        </Button>

        {attachments.length > 0 && (
          <span className="text-xs text-white/40 ml-auto">
            {attachments.length}/{maxFiles}
          </span>
        )}
      </div>

      {/* Input de Link */}
      <AnimatePresence>
        {showLinkInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2"
          >
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addLink()}
              placeholder="Cole o link aqui..."
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-white/20"
            />
            <Button type="button" size="sm" onClick={addLink}>
              Adicionar
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Área de Drop */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-white/40" />
            <p className="text-sm text-white/60">Solte os arquivos aqui</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Anexos */}
      <AnimatePresence mode="popLayout">
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'group relative flex items-center gap-3 p-2 rounded-lg',
                  'bg-white/5 border border-white/10',
                  'hover:bg-white/10 hover:border-white/20 transition-all'
                )}
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-white/10 flex items-center justify-center overflow-hidden">
                  {attachment.preview ? (
                    <Image
                      src={attachment.preview}
                      alt={attachment.name}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    getFileIcon(attachment.type)
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate font-medium">
                    {attachment.name}
                  </p>
                  {attachment.size && (
                    <p className="text-xs text-white/40">
                      {formatFileSize(attachment.size)}
                    </p>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="flex-shrink-0 p-1 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
