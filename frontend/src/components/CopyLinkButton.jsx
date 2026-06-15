import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CopyLinkButton({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Link copied successfully!', {
        id: 'copy-link-toast', // prevent duplicates
        style: {
          borderRadius: '16px',
          background: '#18181b',
          color: '#f4f4f5',
          border: '1px solid rgba(255,255,255,0.08)',
        },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md ${
        copied
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/10 hover:shadow-lg hover:shadow-violet-600/20 active:scale-[0.98]'
      }`}
    >
      {copied ? (
        <>
          <Check className="h-5 w-5" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-5 w-5" />
          <span>Copy Link</span>
        </>
      )}
    </button>
  );
}
