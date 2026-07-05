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
import {
  exportFieldsState,
  exportFieldsStateCsv,
  importFieldsState,
  importFieldsStateFromTable,
  type FieldsState,
} from '@/lib/bim/fields';
import { getActiveFieldsForProfile, getInactiveFieldsForProfile } from '@/lib/profiles';
import { checkFilename, checkSize } from '@/lib/upload-guard';

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
  const [showTableImport, setShowTableImport] = useState(false);
  const [tableImportText, setTableImportText] = useState('');

  const allFields = [...activeFields, ...inactiveFields];
  const draggingField = activeId ? allFields.find((f) => f.id === activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  function applyImportedFields(next: FieldsState, message: string) {
    dispatch({
      type: 'STATE_HYDRATE',
      slices: { fields: { activeFieldIds: next.activeFieldIds, values: next.values } },
    });
    dispatch({ type: 'TOAST_SHOW', msg: message });
  }

  function downloadTextFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function importFieldsFile(file: File) {
    const filenameCheck = checkFilename(file.name);
    if (!filenameCheck.ok) throw new Error(filenameCheck.reason);

    const sizeCheck = checkSize(file.size);
    if (!sizeCheck.ok) throw new Error(sizeCheck.reason);

    const lowerName = file.name.toLowerCase();
    if (lowerName.endsWith('.json')) {
      applyImportedFields(importFieldsState(await file.text()), 'Modèle de nomenclature JSON importé.');
      return;
    }

    if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls') || lowerName.endsWith('.ods')) {
      const xlsx = await import('xlsx');
      const workbook = xlsx.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error('Le fichier Excel ne contient aucune feuille.');
      const tableText = xlsx.utils.sheet_to_csv(workbook.Sheets[firstSheetName], {
        FS: '\t',
        blankrows: false,
      });
      applyImportedFields(
        importFieldsStateFromTable(tableText, state.fields),
        'Modèle de nomenclature Excel importé.',
      );
      return;
    }

    applyImportedFields(
      importFieldsStateFromTable(await file.text(), state.fields),
      'Modèle de nomenclature CSV importé.',
    );
  }

  function importPastedTable() {
    try {
      applyImportedFields(
        importFieldsStateFromTable(tableImportText, state.fields),
        'Nomenclature collée importée.',
      );
      setTableImportText('');
      setShowTableImport(false);
    } catch (error) {
      dispatch({
        type: 'TOAST_SHOW',
        msg: error instanceof Error ? error.message : 'Collage invalide.',
      });
    }
  }

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
        {/* Import / Export row */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                exportFieldsState(state.fields),
                'bimdoc-renamer-nomenclature.json',
                'application/json',
              );
            }}
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors"
            aria-label="Exporter le modèle en JSON"
            title="Télécharger la configuration de nomenclature au format JSON"
          >
            ↓ JSON
          </button>
          <button
            type="button"
            onClick={() => {
              downloadTextFile(
                exportFieldsStateCsv(state.fields),
                'bimdoc-renamer-nomenclature.csv',
                'text/csv;charset=utf-8',
              );
            }}
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors"
            aria-label="Exporter le modèle en CSV"
            title="Télécharger la configuration de nomenclature au format CSV"
          >
            ↓ CSV
          </button>
          <label
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors cursor-pointer"
            title="Importer une configuration JSON, CSV, Excel ou ODS"
          >
            ↑ Fichier
            <input
              type="file"
              accept="application/json,text/csv,.json,.csv,.tsv,.txt,.xlsx,.xls,.ods"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await importFieldsFile(f);
                } catch (error) {
                  dispatch({
                    type: 'TOAST_SHOW',
                    msg: error instanceof Error ? error.message : 'Fichier invalide.',
                  });
                }
                e.target.value = '';
              }}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowTableImport((value) => !value)}
            className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-sans text-ink-soft hover:border-brick hover:text-brick transition-colors"
            aria-expanded={showTableImport}
            aria-controls="table-import-panel"
            title="Coller des colonnes depuis Excel, Numbers, LibreOffice ou un CSV"
          >
            Coller
          </button>
        </div>

        {showTableImport && (
          <div
            id="table-import-panel"
            className="rounded-md border border-line bg-white p-3 dark:bg-paper-2"
          >
            <label
              htmlFor="table-import-text"
              className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink-mute"
            >
              Import CSV / Excel par copier-coller
            </label>
            <textarea
              id="table-import-text"
              value={tableImportText}
              onChange={(event) => setTableImportText(event.target.value)}
              placeholder={'champ\tvaleur\nCode Projet\tPRJ01\nType Document\tPLA\nRévision\tA'}
              rows={5}
              className="w-full resize-y rounded-md border border-line bg-white px-2.5 py-1.5 font-mono text-xs text-ink placeholder:text-ink-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick dark:bg-paper-2"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-ink-mute">
                Formats acceptés : colonnes champ/valeur, code/valeur ou export CSV BIMCHECK-Rename.
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTableImportText('')}
                  disabled={!tableImportText}
                  className="rounded-md border border-line bg-white px-2 py-1 text-[11px] text-ink-soft transition-colors hover:border-brick hover:text-brick disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={importPastedTable}
                  disabled={!tableImportText.trim()}
                  className="rounded-md border border-brick bg-brick px-2 py-1 text-[11px] text-white transition-colors hover:bg-brick-deep disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Importer le collage
                </button>
              </div>
            </div>
          </div>
        )}

        <ProfilePicker />
        <EntityImportPanel />

        {/* Section: model + separator on one row when both fit */}
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
