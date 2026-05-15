'use client';

import { useState, useCallback, useRef } from 'react';
import type { DragEvent } from 'react';

export interface UseFileDropOptions {
  onFiles: (files: File[]) => void;
  accept?: string[];
}

export interface UseFileDropReturn {
  isDragging: boolean;
  handleDragEnter: (e: DragEvent<HTMLElement>) => void;
  handleDragOver: (e: DragEvent<HTMLElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLElement>) => void;
  handleDrop: (e: DragEvent<HTMLElement>) => void;
  openFilePicker: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * Drag-and-drop + click-to-browse hook.
 * Returns event handlers + a hidden <input> ref for the click-to-browse path.
 */
export function useFileDrop({ onFiles }: UseFileDropOptions): UseFileDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) {
        onFiles(dropped);
      }
    },
    [onFiles],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    isDragging,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    openFilePicker,
    inputRef,
  };
}
