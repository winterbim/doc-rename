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
  useDroppable,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useAppContext } from '@/lib/app-state';
import { getActiveFieldsForProfile } from '@/lib/profiles';
import { FieldInput } from './FieldInput';
import type { FieldDefinition } from '@/lib/bim/types';

// ---------------------------------------------------------------------------
// DragHandle icon
// ---------------------------------------------------------------------------

function DragHandle({ listeners, attributes }: {
  listeners: DraggableSyntheticListeners;
  attributes: DraggableAttributes;
}) {
  return (
    <button
      type="button"
      className="shrink-0 mt-5 cursor-grab active:cursor-grabbing rounded p-0.5 text-ink-mute hover:text-ink-soft hover:bg-paper-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick transition-colors"
      aria-label="Réordonner ce champ"
      {...listeners}
      {...attributes}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
      </svg>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SortableFieldItem
// ---------------------------------------------------------------------------

interface SortableFieldItemProps {
  field: FieldDefinition;
  index: number;
  isDraggingOverlay?: boolean;
}

function SortableFieldItem({ field, index, isDraggingOverlay = false }: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isDraggingOverlay ? 0.4 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2"
    >
      <DragHandle listeners={listeners} attributes={attributes} />
      {/* Position badge */}
      <span
        className="mt-5 flex h-4 w-4 shrink-0 items-center justify-center rounded font-mono text-[9px] text-ink-mute"
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <div className="flex-1">
        <FieldInput field={field} />
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// FieldCard for the DragOverlay (static, no dnd hooks)
// ---------------------------------------------------------------------------

function FieldCard({ field, index }: { field: FieldDefinition; index: number }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-brick/40 bg-white shadow-lg px-1 py-1 opacity-95 cursor-grabbing">
      <button
        type="button"
        className="shrink-0 mt-5 cursor-grabbing rounded p-0.5 text-ink-mute"
        aria-hidden="true"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <span className="mt-5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-gold/20 text-[9px] font-sans font-semibold text-brick-deep">
        {index + 1}
      </span>
      <div className="flex-1">
        <FieldInput field={field} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActiveDropZone (droppable zone for items coming from AvailableFieldsList)
// ---------------------------------------------------------------------------

interface ActiveDropZoneProps {
  children: React.ReactNode;
  isOver: boolean;
}

function ActiveDropZone({ children, isOver }: ActiveDropZoneProps) {
  const { setNodeRef } = useDroppable({ id: 'active-fields-zone' });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-colors min-h-12 ${
        isOver ? 'ring-2 ring-brick/40 ring-offset-1 bg-brick/5' : ''
      }`}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActiveFieldsList — the exported component
// ---------------------------------------------------------------------------

interface ActiveFieldsListProps {
  /** If true, render as a standalone DndContext (legacy / single-pane mode).
   *  If false (default), expect an outer DndContext from NomenclatureBuilder. */
  standalone?: boolean;
  activeId?: string | null;
  isOver?: boolean;
}

export function ActiveFieldsList({
  standalone = false,
  activeId,
  isOver = false,
}: ActiveFieldsListProps) {
  const { state, dispatch } = useAppContext();
  const activeFields = getActiveFieldsForProfile(
    state.fields,
    state.profileId,
    state.profileEntities[state.profileId] ?? [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const [localActiveId, setLocalActiveId] = useState<string | null>(null);

  const effectiveActiveId = standalone ? localActiveId : (activeId ?? null);
  const draggingField = activeFields.find((f) => f.id === effectiveActiveId);
  const draggingIndex = draggingField
    ? activeFields.findIndex((f) => f.id === effectiveActiveId)
    : 0;

  function handleDragStart(event: DragStartEvent) {
    setLocalActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setLocalActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = activeFields.findIndex((f) => f.id === active.id);
    const newIndex = activeFields.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(activeFields, oldIndex, newIndex);
    dispatch({ type: 'FIELDS_SET_ACTIVE', fieldIds: reordered.map((f) => f.id) });
  }

  const content = (
    <>
      {activeFields.length === 0 ? (
        <p className="text-sm font-sans text-ink-mute py-2">
          Aucun champ actif. Glissez un champ depuis la liste ci-dessous ou sélectionnez un modèle.
        </p>
      ) : (
        <SortableContext
          items={activeFields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2" aria-label="Champs de nomenclature actifs">
            {activeFields.map((field, idx) => (
              <SortableFieldItem key={field.id} field={field} index={idx} />
            ))}
          </ul>
        </SortableContext>
      )}
    </>
  );

  if (standalone) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ActiveDropZone isOver={isOver}>
          {content}
        </ActiveDropZone>
        <DragOverlay>
          {draggingField ? (
            <FieldCard field={draggingField} index={draggingIndex} />
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  }

  // When inside a shared DndContext (NomenclatureBuilder manages it)
  return (
    <ActiveDropZone isOver={isOver}>
      {content}
    </ActiveDropZone>
  );
}
