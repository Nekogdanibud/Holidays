// src/components/activities/PhotoViewerModal.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export default function PhotoViewerModal({
  memories = [],
  initialIndex = 0,
  onClose
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const touchRef = useRef({
    startX: 0,
    startY: 0,
    startScale: 1,
    startDist: 0,
    isPinch: false
  });

  // Валидация индекса
  useEffect(() => {
    const valid = Math.max(0, Math.min(initialIndex, memories.length - 1));
    setCurrentIndex(valid);
  }, [initialIndex, memories.length]);

  // Предзагрузка соседних фото
  useEffect(() => {
    if (memories.length <= 1) return;

    const preload = (url) => {
      if (!url) return;
      const img = new Image();
      img.src = url;
    };

    const prev = memories[currentIndex - 1];
    const next = memories[currentIndex + 1];

    preload(prev?.imageUrl);
    preload(next?.imageUrl);
  }, [currentIndex, memories]);

  // Отключаем скролл
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = orig; };
  }, []);

  // Клавиатура
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(-1);
      if (e.key === 'ArrowRight') goTo(1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, memories.length]);

  const goTo = useCallback((delta) => {
    setCurrentIndex((i) => (i + delta + memories.length) % memories.length);
    resetZoom();
  }, [memories.length]);

  const resetZoom = useCallback(() => {
    if (!imgRef.current) return;
    const img = imgRef.current;
    img.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
    img.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
  }, []);

  // === НАТИВНЫЙ PINCH-TO-ZOOM ===
  const handleTouchStart = useCallback((e) => {
    const t = touchRef.current;
    if (e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      t.startDist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      t.startScale = 1;
      t.isPinch = true;
    } else if (e.touches.length === 1) {
      t.startX = e.touches[0].pageX;
      t.startY = e.touches[0].pageY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const t = touchRef.current;
    if (e.touches.length === 2 && t.isPinch) {
      e.preventDefault();
      const [t1, t2] = e.touches;
      const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
      const scale = Math.max(0.5, Math.min(4, dist / t.startDist));

      if (imgRef.current) {
        imgRef.current.style.transition = 'none';
        imgRef.current.style.transform = `translate3d(0px, 0px, 0) scale(${scale})`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const t = touchRef.current;
    if (t.isPinch) {
      t.isPinch = false;
      if (imgRef.current) {
        const currentScale = getComputedStyle(imgRef.current).transform;
        const scale = currentScale === 'none' ? 1 : parseFloat(currentScale.split(',')[3]) || 1;
        if (scale < 1.2) {
          resetZoom();
        }
      }
    } else if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].pageX - t.startX;
      if (Math.abs(deltaX) > 50) {
        deltaX > 0 ? goTo(-1) : goTo(1);
      }
    }
  }, [goTo, resetZoom]);

  // === ЗАКРЫТИЕ ===
  const handleClose = useCallback(() => {
    resetZoom();
    setTimeout(onClose, 100);
  }, [onClose, resetZoom]);

  if (memories.length === 0) return null;
  const memory = memories[currentIndex];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex flex-col"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Шапка */}
      <div className="relative z-10 flex items-center justify-between p-4 text-white">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">
            {memory.activity?.title || formatDate(memory.takenAt || memory.createdAt)}
          </h2>
          <div className="text-sm opacity-75">
            {currentIndex + 1} / {memories.length}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          Close
        </button>
      </div>

      {/* Фото */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <img
            ref={imgRef}
            src={memory.imageUrl}
            alt={memory.title || 'Фото'}
            className="max-w-full max-h-full object-contain select-none pointer-events-none"
            style={{
              willChange: 'transform',
              transform: 'translate3d(0px, 0px, 0) scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
            }}
            loading="eager"
            draggable={false}
            onDoubleClick={resetZoom}
          />
        </div>

        {/* Навигация */}
        {memories.length > 1 && (
          <>
            <button
              onClick={() => goTo(-1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center hover:bg-opacity-70 transition-opacity"
            >
              Previous
            </button>
            <button
              onClick={() => goTo(1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 text-white flex items-center justify-center hover:bg-opacity-70 transition-opacity"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Утилита
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};
