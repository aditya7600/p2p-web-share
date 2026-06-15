import React from 'react';
import { File, FileText, Image, Video, Music, Archive } from 'lucide-react';
import { formatBytes } from './DragDropZone';

export default function FileCard({ name, size, type }) {
  const getFileIcon = () => {
    const ext = name.split('.').pop().toLowerCase();
    const mime = type ? type.toLowerCase() : '';
    
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || mime.startsWith('image/')) {
      return <Image className="h-6 w-6 text-indigo-400" />;
    }
    if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext) || mime.startsWith('video/')) {
      return <Video className="h-6 w-6 text-fuchsia-400" />;
    }
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || mime.startsWith('audio/')) {
      return <Music className="h-6 w-6 text-pink-400" />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'csv', 'xlsx'].includes(ext) || mime.startsWith('text/') || mime.includes('document')) {
      return <FileText className="h-6 w-6 text-emerald-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
      return <Archive className="h-6 w-6 text-amber-400" />;
    }
    return <File className="h-6 w-6 text-violet-400" />;
  };

  return (
    <div className="flex items-center gap-3.5 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xs">
      <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center shrink-0">
        {getFileIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-outfit font-semibold text-zinc-800 dark:text-zinc-100 truncate text-sm" title={name}>
          {name}
        </div>
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          {formatBytes(size)}
        </div>
      </div>
    </div>
  );
}
