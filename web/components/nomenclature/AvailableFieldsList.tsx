'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppContext } from '@/lib/app-state';
import { getInactiveFieldsForProfile } from '@/lib/profiles';
import type { FieldDefinition } from '@/lib/bim/types';

// ---------------------------------------------------------------------------
// DraggableAvailableItem
// ---------------------------------------------------------------------------

function DraggableAvailableItem({
  field,
  onActivate,
}: {
  field: FieldDefinition;
  onActivate: (fieldId: string) => void;
}) {
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
    opacity: isDragging ? 0.4 : 1,
  };

  const handleActivate = () => {
    if (!isDragging) onActivate(field.id);
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="inline-flex items-center gap-1 rounded border border-line bg-paper-2/50 px-2 py-1 text-[11px] text-ink cursor-grab active:cursor-grabbing hover:border-brick/40 hover:bg-paper-2 hover:text-brick-deep transition-colors select-none"
      title={`${field.name} - cliquer ou glisser pour activer`}
      aria-label={`Champ disponible: ${field.name}. Cliquer ou glisser pour activer.`}
      {...attributes}
      {...listeners}
      onClick={handleActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleActivate();
        }
      }}
    >
      <span className="font-mono text-[10px] text-ink-mute shrink-0">{field.code}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// AvailableFieldsList
// ---------------------------------------------------------------------------

interface AvailableFieldsListProps {
  isOver: boolean;
}

export function AvailableFieldsList({ isOver }: AvailableFieldsListProps) {
  const { state, dispatch } = useAppContext();
  const inactiveFields = getInactiveFieldsForProfile(
    state.fields,
    state.profileId,
    state.profileEntities[state.profileId] ?? [],
  );

  const { setNodeRef } = useDroppable({ id: 'available-fields-zone' });
  const activateField = (fieldId: string) => {
    if (state.fields.activeFieldIds.includes(fieldId)) return;
    dispatch({
      type: 'FIELDS_SET_ACTIVE',
      fieldIds: [...state.fields.activeFieldIds, fieldId],
    });
  };

  if (inactiveFields.length === 0) {
    return (
      <div
        ref={setNodeRef}
        className="rounded-lg border border-dashed border-line bg-paper-2/30 px-4 py-4 text-center"
      >
        <p className="text-xs font-sans text-ink-mute">
          Tous les champs sont actifs. Glissez un champ vers le bas pour le désactiver.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border transition-colors p-1 ${
        isOver
          ? 'border-brick/40 ring-2 ring-brick/20 ring-offset-1 bg-brick/5'
          : 'border-dashed border-line bg-paper-2/30'
      }`}
    >
      <SortableContext
        items={inactiveFields.map((f) => f.id)}
        strategy={rectSortingStrategy}
      >
        <ul className="flex flex-wrap gap-1.5 p-1" aria-label="Champs disponibles">
          {inactiveFields.map((field) => (
            <DraggableAvailableItem
              key={field.id}
              field={field}
              onActivate={activateField}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
}
