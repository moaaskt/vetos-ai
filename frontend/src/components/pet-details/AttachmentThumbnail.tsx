import { useState, useEffect } from 'react';
import { FileText, Loader2, ImageIcon } from 'lucide-react';
import { api, type ClinicalAttachment } from '../../lib/api';

export function AttachmentThumbnail({ att }: { att: ClinicalAttachment }) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;
    const isImage = att.mimeType.startsWith('image/');

    if (!isImage) return;

    async function fetchThumbnail() {
      setLoading(true);
      setError(false);
      try {
        const response = await api.get(`/attachments/${att.id}/download`, {
          responseType: 'blob',
        });
        if (!active) return;
        const blob = new Blob([response.data], { type: att.mimeType });
        createdUrl = window.URL.createObjectURL(blob);
        setThumbUrl(createdUrl);
      } catch (err) {
        if (active) {
          setError(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchThumbnail();

    return () => {
      active = false;
      if (createdUrl) {
        window.URL.revokeObjectURL(createdUrl);
      }
    };
  }, [att.id, att.mimeType]);

  const isImage = att.mimeType.startsWith('image/');

  if (!isImage) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 border border-rose-500/20 text-rose-500 shadow-sm transition-all group-hover/card:scale-105 duration-200">
        <FileText className="h-6.5 w-6.5" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted animate-pulse border border-border shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  if (error || !thumbUrl) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 text-primary shadow-sm">
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }

  return (
    <img
      src={thumbUrl}
      alt={att.originalFileName}
      className="h-14 w-14 shrink-0 rounded-xl object-cover border border-border/80 shadow-sm transition-all group-hover/card:scale-105 duration-200"
    />
  );
}
