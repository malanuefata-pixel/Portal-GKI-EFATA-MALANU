import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';

interface EmblemProps {
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function normalizeDriveImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const fileMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }
  const openMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([^&#]+)/);
  if (openMatch && openMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${openMatch[1]}`;
  }
  return trimmed;
}

export const ChurchEmblem: React.FC<EmblemProps> = ({ logoUrl, size = 'md' }) => {
  const customUrl = normalizeDriveImageUrl(logoUrl);
  const hasCustom = Boolean(customUrl && customUrl !== '/Logo_GKI_Big.png');
  const [stage, setStage] = useState<'custom' | 'local' | 'svg'>(hasCustom ? 'custom' : 'local');

  useEffect(() => {
    setStage(hasCustom ? 'custom' : 'local');
  }, [hasCustom, customUrl]);

  const dims =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-14 h-14'
      : size === 'xl'
      ? 'w-24 h-24 sm:w-28 sm:h-28'
      : 'w-10 h-10';

  if (stage === 'custom' && customUrl) {
    return (
      <img
        src={customUrl}
        alt="Logo GKI di Tanah Papua"
        referrerPolicy="no-referrer"
        onError={() => setStage('local')}
        className={`${dims} object-contain drop-shadow-sm shrink-0`}
      />
    );
  }

  if (stage === 'local') {
    return (
      <img
        src="/Logo_GKI_Big.png"
        alt="Logo GKI di Tanah Papua"
        onError={() => setStage('svg')}
        className={`${dims} object-contain drop-shadow-sm shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${dims} rounded-full bg-[#0F2C59] border border-[#D4AF37]/70 flex items-center justify-center shrink-0 shadow-sm`}
      aria-label="Logo GKI di Tanah Papua"
    >
      <svg viewBox="0 0 80 80" className="w-[82%] h-[82%]" fill="none">
        <circle cx="40" cy="40" r="35" stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.9" />
        <circle cx="40" cy="40" r="30.5" stroke="#D4AF37" strokeWidth="0.9" strokeOpacity="0.45" />
        <rect x="37" y="13" width="6" height="36" rx="1.5" fill="#D4AF37" />
        <rect x="25" y="23" width="30" height="6" rx="1.5" fill="#D4AF37" />
        <path
          d="M19 50 C26.5 47, 34 47.5, 40 51.5 C46 47.5, 53.5 47, 61 50 L61 62 C53.5 59.5, 46 60, 40 63.5 C34 60, 26.5 59.5, 19 62 Z"
          fill="#F8FAFC"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1="40" y1="51.5" x2="40" y2="63.5" stroke="#0F2C59" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

interface GalleryImageProps {
  imageUrl?: string;
  title: string;
  category: string;
}

export const GalleryCardMedia: React.FC<GalleryImageProps> = ({ imageUrl, title, category }) => {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = normalizeDriveImageUrl(imageUrl);

  useEffect(() => {
    setFailed(false);
  }, [resolvedUrl]);

  if (resolvedUrl && !failed) {
    return (
      <img
        src={resolvedUrl}
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className="w-full h-44 object-cover"
      />
    );
  }

  return (
    <div className="w-full h-44 bg-gradient-to-br from-[#0F2C59] to-[#1B365D] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <svg viewBox="0 0 240 160" className="w-full h-full">
          <circle cx="120" cy="80" r="62" stroke="#D4AF37" strokeWidth="1.5" fill="none" />
          <line x1="120" y1="30" x2="120" y2="130" stroke="#D4AF37" strokeWidth="2" />
          <line x1="86" y1="64" x2="154" y2="64" stroke="#D4AF37" strokeWidth="2" />
        </svg>
      </div>
      <Camera className="w-6 h-6 text-[#D4AF37] mb-2 relative z-10" />
      <p className="text-xs font-medium text-[#F8FAFC]/90 relative z-10 line-clamp-2">{title}</p>
      <span className="text-[11px] text-[#D4AF37] mt-1 relative z-10">{category}</span>
    </div>
  );
};
