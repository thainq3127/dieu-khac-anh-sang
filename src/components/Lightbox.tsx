'use client';

import { useEffect, useState } from 'react';
import { Fancybox } from '@fancyapps/ui';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

function isLocalVideoFile(url: string | null): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(lowerUrl)) {
    return true;
  }
  
  if ((lowerUrl.includes('uploads/') || lowerUrl.includes('storage/')) && !lowerUrl.includes('youtube.com') && !lowerUrl.includes('youtu.be') && !lowerUrl.includes('matterport.com')) {
    return true;
  }
  
  return false;
}

export default function Lightbox() {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  useEffect(() => {
    // 1. Bind Fancybox to all data-fancybox image galleries
    Fancybox.bind('[data-fancybox]', {
      Hash: false,
      Thumbs: false,
      Toolbar: {
        display: {
          left: [],
          middle: [],
          right: ['close'],
        },
      },
      dragToClose: true,
      showClass: 'f-fadeIn',
      hideClass: 'f-fadeOut',
    } as unknown as Parameters<typeof Fancybox.bind>[1]);

    // 2. Programmatic triggers for 3D Matterport & YouTube videos
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Matterport 3D frame trigger
      const trigger3d = target.closest('[data-3d-trigger]');
      if (trigger3d) {
        e.preventDefault();
        const url = trigger3d.getAttribute('data-3d-trigger');
        if (url) {
          const src = `${url}${url.includes('?') ? '&' : '?'}play=1&qs=1&brand=0`;
          setIframeUrl(src);
        }
        return;
      }

      // YouTube / Local Video trigger
      const triggerVideo = target.closest('[data-video-embed]');
      if (triggerVideo) {
        e.preventDefault();
        const url = triggerVideo.getAttribute('data-video-embed');
        if (url) {
          const src = isLocalVideoFile(url) ? url : `${url}?autoplay=1&rel=0`;
          setIframeUrl(src);
        }
        return;
      }
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      Fancybox.destroy();
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (iframeUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [iframeUrl]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIframeUrl(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {iframeUrl && (
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-0 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIframeUrl(null)}
              className="absolute inset-0 bg-[#080f0d]/60"
            />

            {/* Wrapper: same size as modal, relative so button anchors to its corner */}
            <div className="relative z-10 w-full max-sm:h-full md:w-[95vw] md:aspect-video md:h-[95vh]">
              {/* Modal Dialog */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full h-full bg-black overflow-hidden max-sm:rounded-none max-sm:border-0 max-sm:shadow-none md:rounded-[14px] md:border md:border-white/12 md:shadow-[0_28px_72px_rgba(0,0,0,0.8)]"
              >
                {/* Iframe or Video */}
                {isLocalVideoFile(iframeUrl) ? (
                  <video
                    src={iframeUrl ?? ''}
                    className="w-full h-full border-0 object-contain animate-in fade-in duration-200"
                    controls
                    autoPlay
                  />
                ) : (
                  <iframe
                    src={iframeUrl ?? ''}
                    className="w-full h-full border-0"
                    allowFullScreen
                    allow="autoplay; fullscreen; xr-spatial-tracking; gyroscope; accelerometer"
                  />
                )}
              </motion.div>

              {/* Close Button — absolute relative to wrapper, not viewport */}
              <button
                onClick={() => setIframeUrl(null)}
                className="absolute -top-4 -right-4 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-terra text-white border border-white/20 hover:border-white flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md group cursor-pointer"
                title="Close"
                type="button"
              >
                <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
