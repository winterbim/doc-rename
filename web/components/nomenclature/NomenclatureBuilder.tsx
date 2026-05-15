'use client';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState } from 'react';

import { useAppContext } from '@/lib/app-state';
import { exportFieldsState, importFieldsState } from '@/lib/bim/fields';
import { getActiveFieldsForProfile, getInactiveFieldsForProfile } from '@/lib/profiles';

import { TemplatePicker } from './TemplatePicker';
import { SeparatorPicker } from './SeparatorPicker';
import { ActiveFieldsList } from './ActiveFieldsList';
import { AvailableFieldsList } from './AvailableFieldsList';
import { LivePreview } from './LivePreview';
import { ProfilePicker } from '@/components/profiles/ProfilePicker';
import { EntityImportPanel } from '@/components/profiles/EntityImportPanel';
import type { FieldDefinition } from '@/lib/bim/types';

// ---------------------------------------------------------------------------
// Compact overlay card (shown while dragging)
// ---------------------------------------------------------------------------

function OverlayCard({ field }: { field: FieldDefinition }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-brick/40 bg-white px-3 py-2 text-sm text-ink shadow-lg cursor-grabbing select-none opacity-95">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5 shrink-0 text-ink-mute"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
      </svg>
      <span className="font-mono text-xs text-ink-mute shrink-0">{field.code}</span>
      <span className="flex-1 truncate font-medium">{field.name}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NomenclatureBuilder
// ---------------------------------------------------------------------------

export function NomenclatureBuilder() {
  const { state, dispatch } = useAppContext();
  const profileEntities = state.profileEntities[state.profileId] ?? [];
  const activeFields = getActiveFieldsForProfile(state.fields, state.profileId, profileEntities);
  const inactiveFields = getInactiveFieldsForProfile(state.fields, state.profileId, profileEntities);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<'active' | 'available' | null>(null);

  const allFields = [...activeFields, ...inactiveFields];
  const draggingField = activeId ? allFields.find((f) => f.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverZone(null);
      return;
    }
    const overId = String(over.id);
    if (overId === 'active-fields-zone' || activeFields.some((f) => f.id === overId)) {
      setOverZone('active');
    } else if (overId === 'available-fields-zone' || inactiveFields.some((f) => f.id === overId)) {
      setOverZone('available');
    } else {
      setOverZone(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverZone(null);

    if (!over) return;

    const draggedId = String(active.id);
    const overId = String(over.id);

    const isActiveField = activeFields.some((f) => f.id === draggedId);
    const isAvailableField = inactiveFields.some((f) => f.id === draggedId);

    const overIsActive =
      overId === 'active-fields-zone' || activeFields.some((f) => f.id === overId);
    const overIsAvailable =
      overId === 'available-fields-zone' || inactiveFields.some((f) => f.id === overId);

    if (isActiveField && overIsActive) {
      // Reorder within active list
      if (draggedId === overId) return;
      const oldIdx = activeFields.findIndex((f) => f.id === draggedId);
      const newIdx = activeFields.findIndex((f) => f.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(activeFields, oldIdx, newIdx);
      dispatch({ type: 'FIELDS_SET_ACTIVE', fieldIds: reordered.map((f) => f.id) });
    } else if (isActiveField && overIsAvailable) {
      // Move from active → available (deactivate)
      const newActive = activeFields.filter((f) => f.id !== draggedId).map((f) => f.id);
      dispatch({ type: 'FIELDS_SET_ACTIVE', fieldIds: newActive });
    } else if (isAvailableField && overIsActive) {
      // Move from available → active (activate), insert at the end or near overId
      const insertAfterIdx = activeFields.findIndex((f) => f.id === overId);
      const newActive = [...activeFields.map((f) => f.id)];
      if (insertAfterIdx >= 0) {
        newActive.splice(insertAfterIdx + 1, 0, draggedId);
      } else {
        newActive.push(draggedId);
      }
      dispatch({ type: 'FIELDS_SET_ACTIVE', fieldIds: newActive });
    }
    // available → available: no-op (we don't sort available list)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-3">
        {/* Import / Export JSON row */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              const json = exportFieldsState(state.fields);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'bimdoc-template.json';
              a.click();
              setTimeout(() => URL.revokeObjectURL(url), 0);
            }}
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors"
            aria-label="Exporter le modèle en JSON"
            title="Télécharger la configuration de nomenclature au format JSON"
          >
            ↓ Exporter
          </button>
          <label
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors cursor-pointer"
            title="Importer une configuration de nomenclature au format JSON"
          >
            ↑ Importer
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const text = await f.text();
                  const next = importFieldsState(text);
                  dispatch({
                    type: 'STATE_HYDRATE',
                    slices: { fields: { activeFieldIds: next.activeFieldIds, values: next.values } },
                  });
                } catch {
                  alert("Fichier JSON invalide.");
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>

        <ProfilePicker />
        <EntityImportPanel />

        {/* Section: Template + Separator on one row when both fit */}
        <div className="flex flex-col gap-3">
          <section aria-labelledby="section-template">
            <h2 id="section-template" className="sr-only">
              Modèle de nomenclature
            </h2>
            <TemplatePicker />
          </section>

          <section aria-labelledby="section-sep">
            <h2 id="section-sep" className="sr-only">
              Séparateur
            </h2>
            <SeparatorPicker />
          </section>
        </div>

        <hr className="border-line" />

        {/* Section: Active fields */}
        <section aria-labelledby="section-active-fields">
          <h2 id="section-active-fields" className="mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
            Champs actifs
          </h2>
          <SortableContext
            items={activeFields.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <ActiveFieldsList
              activeId={activeId}
              isOver={overZone === 'active'}
            />
          </SortableContext>
        </section>

        {/* Divider */}
        <div className="flex items-center gap-2">
          <hr className="flex-1 border-line" />
          <span className="text-[10px] font-sans text-ink-mute whitespace-nowrap px-1">
            Glisser pour ajouter
          </span>
          <hr className="flex-1 border-line" />
        </div>

        {/* Section: Available fields */}
        <section aria-labelledby="section-available-fields">
          <h2 id="section-available-fields" className="mb-1.5 text-[11px] font-sans font-semibold uppercase tracking-[0.12em] text-ink-mute">
            Champs disponibles
          </h2>
          <AvailableFieldsList isOver={overZone === 'available'} />
        </section>

        <hr className="border-line" />

        {/* Section: Live preview */}
        <section aria-labelledby="section-preview">
          <h2 id="section-preview" className="sr-only">
            Aperçu
          </h2>
          <LivePreview />
        </section>
      </div>

      <DragOverlay>
        {draggingField ? <OverlayCard field={draggingField} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
