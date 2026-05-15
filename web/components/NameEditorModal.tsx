'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { BimFile } from '@/lib/bim/types';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEPARATOR_OPTIONS = [
  { value: '_', label: '_ Underscore' },
  { value: '-', label: '- Tiret' },
  { value: '.', label: '. Point' },
];

function splitIntoSegments(
  filename: string,
  separator: string
): { segments: string[]; extension: string } {
  const dotIdx = filename.lastIndexOf('.');
  const baseName = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  const extension = dotIdx > 0 ? filename.slice(dotIdx) : '';
  const segs = baseName.split(separator).filter((s) => s.length > 0);
  // If separator not present, the whole baseName is one segment
  const segments = segs.length > 0 ? segs : [baseName];
  return { segments, extension };
}

// ---------------------------------------------------------------------------
// Segment item types
// ---------------------------------------------------------------------------

interface Segment {
  id: string; // stable key for dnd
  text: string;
}

// ---------------------------------------------------------------------------
// SortableSegment
// ---------------------------------------------------------------------------

interface SortableSegmentProps {
  segment: Segment;
  index: number;
  onTextChange: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  isDraggingOverlay?: boolean;
}

function SortableSegment({
  segment,
  index,
  onTextChange,
  onDelete,
  isDraggingOverlay = false,
}: SortableSegmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: segment.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDraggingOverlay ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5 shadow-xs"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="shrink-0 cursor-grab active:cursor-grabbing rounded p-0.5 text-ink-mute hover:text-ink-soft hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brick transition-colors"
        aria-label={`Réordonner le segment ${index + 1}`}
        {...listeners}
        {...attributes}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>

      {/* Segment number */}
      <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded font-mono text-[10px] text-ink-mute select-none">
        {index + 1}
      </span>

      {/* Editable text */}
      <input
        type="text"
        value={segment.text}
        onChange={(e) => onTextChange(segment.id, e.target.value)}
        aria-label={`Segment ${index + 1}`}
        className="flex-1 min-w-0 rounded border border-line bg-paper/60 px-2 py-0.5 text-sm font-mono text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus:border-brick"
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(segment.id)}
        aria-label={`Supprimer le segment ${index + 1}`}
        className="shrink-0 rounded p-0.5 text-ink-mute hover:bg-brick/10 hover:text-brick-deep focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brick transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// SegmentOverlayCard
// ---------------------------------------------------------------------------

function SegmentOverlayCard({ segment, index }: { segment: Segment; index: number }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-brick/40 bg-white px-2 py-1.5 shadow-lg opacity-95 cursor-grabbing">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 shrink-0 text-ink-mute"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
      </svg>
      <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded bg-gold/20 text-xs font-sans font-semibold text-brick-deep">
        {index + 1}
      </span>
      <span className="flex-1 min-w-0 truncate text-sm font-mono text-ink px-2">
        {segment.text || <em className="text-gray-400">vide</em>}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NameEditorModal
// ---------------------------------------------------------------------------

interface NameEditorModalProps {
  file: BimFile;
  defaultSeparator: string;
  onApply: (newName: string) => void;
  onClose: () => void;
}

let _segCounter = 0;
function makeSegId(): string {
  return `seg-${++_segCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function NameEditorModal({
  file,
  defaultSeparator,
  onApply,
  onClose,
}: NameEditorModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const newSegInputRef = useRef<HTMLInputElement>(null);

  const [separator, setSeparator] = useState(defaultSeparator);

  // Initialise segments from file name + current separator
  const [segments, setSegments] = useState<Segment[]>(() => {
    const source = file.newName ?? file.original;
    const { segments: parts } = splitIntoSegments(source, defaultSeparator);
    return parts.map((text) => ({ id: makeSegId(), text }));
  });

  const extension = (() => {
    const source = file.newName ?? file.original;
    const dotIdx = source.lastIndexOf('.');
    return dotIdx > 0 ? source.slice(dotIdx) : '';
  })();

  const [newSegText, setNewSegText] = useState('');

  // Re-split when separator changes (only if it differs from current join)
  function handleSeparatorChange(sep: string) {
    // Re-split the current preview using the new separator
    const current = segments.map((s) => s.text).join(separator) + extension;
    const { segments: parts } = splitIntoSegments(current, sep);
    setSeparator(sep);
    setSegments(parts.map((text) => ({ id: makeSegId(), text })));
  }

  const preview = segments.map((s) => s.text).join(separator) + extension;

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const draggingSeg = segments.find((s) => s.id === activeDragId) ?? null;
  const draggingIndex = draggingSeg ? segments.findIndex((s) => s.id === activeDragId) : 0;

  function handleDragStart(e: DragStartEvent) {
    setActiveDragId(String(e.active.id));
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = segments.findIndex((s) => s.id === active.id);
    const newIdx = segments.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    setSegments((prev) => arrayMove(prev, oldIdx, newIdx));
  }

  function handleTextChange(id: string, text: string) {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  function handleDelete(id: string) {
    setSegments((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddSegment() {
    const text = newSegText.trim();
    if (!text) return;
    setSegments((prev) => [...prev, { id: makeSegId(), text }]);
    setNewSegText('');
    newSegInputRef.current?.focus();
  }

  function handleAddKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSegment();
    }
  }

  function handleApply() {
    const name = preview;
    onApply(name);
  }

  // Esc to close
  useEscapeKey(useCallback(() => onClose(), [onClose]));

  // Trap focus inside dialog on mount
  useEffect(() => {
    closeBtnRef.current?.focus();
  }, []);

  // Backdrop click
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="relative flex flex-col w-full max-w-lg rounded-2xl bg-paper border border-line shadow-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-sans font-semibold text-ink">
            Modifier le nom
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1.5 text-ink-mute hover:bg-paper-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Original filename */}
          <div>
            <p className="mb-1 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
              Nom original
            </p>
            <p
              className="rounded-md border border-line bg-paper-2/40 px-3 py-2 text-sm font-mono text-ink-soft truncate select-all"
              title={file.original}
              aria-label={`Nom original: ${file.original}`}
            >
              {file.original}
            </p>
          </div>

          {/* Separator picker */}
          <div>
            <p className="mb-2 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
              Séparateur
            </p>
            <div className="flex gap-2">
              {SEPARATOR_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-sm cursor-pointer transition-colors select-none ${
                    separator === opt.value
                      ? 'border-brick/50 bg-gold/10 text-brick-deep font-medium'
                      : 'border-line bg-white text-ink-soft hover:border-line-2 hover:bg-paper-2/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="modal-separator"
                    value={opt.value}
                    checked={separator === opt.value}
                    onChange={() => handleSeparatorChange(opt.value)}
                    className="sr-only"
                  />
                  <span className="font-mono font-bold">{opt.value}</span>
                  <span className="hidden sm:inline text-xs text-ink-mute">
                    {opt.value === '_' ? 'Underscore' : opt.value === '-' ? 'Tiret' : 'Point'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Segments */}
          <div>
            <p className="mb-2 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
              Segments{' '}
              <span className="font-normal text-ink-mute normal-case">
                (glisser pour réordonner)
              </span>
            </p>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={segments.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-2 mb-3" aria-label="Segments du nom de fichier">
                  {segments.length === 0 ? (
                    <li className="text-xs font-sans text-ink-mute text-center py-2">
                      Aucun segment. Ajoutez-en un ci-dessous.
                    </li>
                  ) : (
                    segments.map((seg, idx) => (
                      <SortableSegment
                        key={seg.id}
                        segment={seg}
                        index={idx}
                        onTextChange={handleTextChange}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </ul>
              </SortableContext>
              <DragOverlay>
                {draggingSeg ? (
                  <SegmentOverlayCard segment={draggingSeg} index={draggingIndex} />
                ) : null}
              </DragOverlay>
            </DndContext>

            {/* Add segment row */}
            <div className="flex gap-2">
              <input
                ref={newSegInputRef}
                type="text"
                value={newSegText}
                onChange={(e) => setNewSegText(e.target.value)}
                onKeyDown={handleAddKeyDown}
                placeholder="Ajouter un segment…"
                aria-label="Nouveau segment"
                className="flex-1 min-w-0 rounded-md border border-line bg-paper/60 px-3 py-1.5 text-sm font-sans text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus:border-brick"
              />
              <button
                type="button"
                onClick={handleAddSegment}
                disabled={!newSegText.trim()}
                aria-label="Ajouter le segment"
                className="shrink-0 flex items-center justify-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 text-brick-deep text-sm font-sans font-medium hover:bg-gold/20 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <p className="mb-1 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
              Aperçu
            </p>
            <p
              className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-mono text-ink truncate dark:bg-paper-2"
              title={preview}
              aria-live="polite"
              aria-label={`Aperçu du nouveau nom: ${preview}`}
            >
              {preview || <span className="text-ink-mute italic">Aucun segment</span>}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-sans font-medium text-ink-soft hover:bg-paper-2 hover:border-line-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!preview || segments.every((s) => !s.text.trim())}
            className="rounded-full bg-ink px-4 py-2 text-sm font-sans font-medium text-paper hover:bg-brick disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus-visible:ring-offset-1 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
