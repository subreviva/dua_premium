// ===================================================
// MODAL: PUBLISH TO COMMUNITY - PREMIUM EDITION
// ===================================================
// Ultra-premium modal for publishing AI-generated content
// Sophisticated design with luxury aesthetics
// ===================================================

'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle2, AlertCircle, Loader2, Music as MusicIcon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { MediaType } from '@/lib/firebase';

// ===================================================
// TYPES
// ===================================================
interface PublishToCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: MediaType;
  defaultTitle?: string;
  defaultDescription?: string;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

// ===================================================
// TYPE LABELS - PREMIUM
// ===================================================
const TYPE_LABELS = {
  image: 'Visual Art',
  music: 'Audio Creation',
  video: 'Motion Picture',
  design: 'Digital Design'
} as const;

const TYPE_CATEGORIES = {
  image: 'Photography & Art',
  music: 'Sound & Music',
  video: 'Film & Video',
  design: 'Design & Graphics'
} as const;

// ===================================================
// COMPONENT
// ===================================================
export function PublishToCommunityModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType,
  defaultTitle = '',
  defaultDescription = ''
}: PublishToCommunityModalProps) {
  // ===================================================
  // STATE
  // ===================================================
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // ===================================================
  // SUPABASE CLIENT
  // ===================================================
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ===================================================
  // RESET FORM
  // ===================================================
  const resetForm = useCallback(() => {
    setTitle(defaultTitle);
    setDescription(defaultDescription);
    setUploadState('idle');
    setProgress(0);
    setError(null);
  }, [defaultTitle, defaultDescription]);

  // ===================================================
  // HANDLE CLOSE
  // ===================================================
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // ===================================================
  // VALIDATE FORM
  // ===================================================
  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Title is required');
      return false;
    }

    if (title.length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }

    if (title.length > 100) {
      setError('Title must be less than 100 characters');
      return false;
    }

    if (description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }

    return true;
  };

  // ===================================================
  // HANDLE PUBLISH
  // ===================================================
  const handlePublish = useCallback(async () => {
    // Validation
    if (!validateForm()) {
      return;
    }

    setUploadState('uploading');
    setProgress(0);
    setError(null);

    try {
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Authentication required. Please sign in.');
      }

      setProgress(20);

      // Fetch file from URL
      const response = await fetch(mediaUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch media file');
      }

      setProgress(40);

      const blob = await response.blob();
      const fileExtension = mediaType === 'image' ? 'png' : 
                          mediaType === 'music' ? 'mp3' : 
                          mediaType === 'video' ? 'mp4' : 'webp';
      const file = new File([blob], `media.${fileExtension}`, { type: blob.type });

      setProgress(60);

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaType);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      const uploadResponse = await fetch('/api/community/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      setProgress(80);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || `Upload failed with status ${uploadResponse.status}`);
      }

      const result = await uploadResponse.json();

      setProgress(100);
      setUploadState('success');

      // Redirect after success
      setTimeout(() => {
        handleClose();
        window.location.href = '/community';
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setUploadState('error');
      setProgress(0);
    }
  }, [mediaUrl, mediaType, title, description, supabase, handleClose]);

  // ===================================================
  // RENDER
  // ===================================================
  const isLoading = uploadState === 'uploading';
  const isSuccess = uploadState === 'success';
  const isError = uploadState === 'error';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="
        max-w-2xl 
        bg-gradient-to-br from-black via-zinc-950 to-black
        border border-white/5
        shadow-2xl shadow-black/50
        backdrop-blur-xl
      ">
        {/* ===================================================
            HEADER - PREMIUM
            =================================================== */}
        <DialogHeader className="space-y-3 border-b border-white/5 pb-6">
          <DialogTitle className="text-2xl font-light tracking-tight text-white">
            Publish to Community
          </DialogTitle>
          <DialogDescription className="text-sm font-light text-zinc-400">
            Share your {TYPE_LABELS[mediaType]} with the community
          </DialogDescription>
          <div className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 bg-white/5 rounded-full px-3 py-1 w-fit">
            {TYPE_CATEGORIES[mediaType]}
          </div>
        </DialogHeader>

        {/* ===================================================
            MEDIA PREVIEW - PREMIUM
            =================================================== */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition" />
          <div className="relative bg-black/40 border border-white/5 rounded-xl overflow-hidden aspect-video">
            {mediaType === 'image' && (
              <img
                src={mediaUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            {mediaType === 'music' && (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-950/50 to-blue-950/50">
                <MusicIcon className="w-16 h-16 text-white/20" strokeWidth={1} />
              </div>
            )}
            {mediaType === 'video' && (
              <video
                src={mediaUrl}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* ===================================================
            FORM - PREMIUM
            =================================================== */}
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 tracking-wide">
              Title
            </label>
            <Input
              placeholder="Enter a descriptive title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading || isSuccess}
              maxLength={100}
              className="
                bg-white/5 
                border-white/10 
                text-white 
                placeholder:text-zinc-500
                focus:border-white/20
                focus:ring-white/10
                transition-all
                font-light
              "
            />
            <div className="text-xs text-zinc-500 text-right">
              {title.length}/100
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 tracking-wide">
              Description
              <span className="text-zinc-500 font-light ml-2">(optional)</span>
            </label>
            <Textarea
              placeholder="Add details about your creation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading || isSuccess}
              maxLength={500}
              rows={3}
              className="
                bg-white/5 
                border-white/10 
                text-white 
                placeholder:text-zinc-500
                focus:border-white/20
                focus:ring-white/10
                transition-all
                resize-none
                font-light
              "
            />
            <div className="text-xs text-zinc-500 text-right">
              {description.length}/500
            </div>
          </div>
        </div>

        {/* ===================================================
            PROGRESS - PREMIUM
            =================================================== */}
        {isLoading && (
          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400 font-light">Uploading...</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-white/5" />
          </div>
        )}

        {/* ===================================================
            SUCCESS STATE - PREMIUM
            =================================================== */}
        {isSuccess && (
          <Alert className="bg-emerald-950/30 border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="font-light">
              Published successfully. Redirecting to community...
            </AlertDescription>
          </Alert>
        )}

        {/* ===================================================
            ERROR STATE - PREMIUM
            =================================================== */}
        {isError && error && (
          <Alert className="bg-red-950/30 border-red-500/20 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-light">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* ===================================================
            ACTIONS - PREMIUM
            =================================================== */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="
              flex-1
              bg-white/5 
              border-white/10 
              text-white 
              hover:bg-white/10
              hover:border-white/20
              transition-all
              font-light
            "
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isLoading || isSuccess || !title.trim()}
            className="
              flex-1
              bg-gradient-to-r from-purple-600 to-blue-600
              hover:from-purple-500 hover:to-blue-500
              text-white 
              border-0
              shadow-lg shadow-purple-900/30
              transition-all
              font-medium
            "
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSuccess && <CheckCircle2 className="w-4 h-4 mr-2" />}
            {!isLoading && !isSuccess && <Upload className="w-4 h-4 mr-2" />}
            {isLoading ? 'Publishing...' : isSuccess ? 'Published' : 'Publish'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
