'use client';

import { useAppContext } from '@/lib/app-state';
import type { FieldDefinition } from '@/lib/bim/types';
import { WORK_LOTS } from '@/lib/bim/config/workLots';
import { COMPANIES } from '@/lib/bim/config/companies';
import { DOCUMENT_TYPES, DISCIPLINES } from '@/lib/bim/config/documentTypes';

/** Resolve a named option set to an array of {code, name} */
function resolveOptions(
  options: FieldDefinition['options'],
): Array<{ code: string; name: string }> {
  if (!options) return [];
  if (Array.isArray(options)) return options;
  switch (options) {
    case 'workLots':
      return WORK_LOTS.map((w) => ({ code: w.code, name: `${w.code} — ${w.name}` }));
    case 'companies':
      return COMPANIES.map((c) => ({ code: c.code, name: c.name }));
    case 'documentTypes': {
      const items: Array<{ code: string; name: string }> = [];
      for (const group of Object.values(DOCUMENT_TYPES)) {
        for (const item of group.items ?? []) {
          if (item) items.push({ code: item.code, name: `${item.code} — ${item.name}` });
        }
      }
      return items;
    }
    case 'disciplines':
      return DISCIPLINES.map((d) => ({ code: d.code, name: `${d.code} — ${d.name}` }));
    default:
      return [];
  }
}

interface FieldInputProps {
  field: FieldDefinition;
}

export function FieldInput({ field }: FieldInputProps) {
  const { state, dispatch } = useAppContext();
  const value = state.fields.values[field.id] ?? '';

  const handleChange = (v: string) => {
    dispatch({ type: 'FIELD_VALUE_SET', fieldId: field.id, value: v });
  };

  const baseClass =
    'w-full rounded-md border border-line bg-white px-2 py-1 text-xs text-ink ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick ' +
    'placeholder:text-ink-mute';

  const labelId = `field-label-${field.id}`;
  const inputId = `field-input-${field.id}`;
  const options = resolveOptions(field.options);
  const dataListId = `${inputId}-options`;

  // Select inputs
  if (field.inputType === 'select') {
    const hasCurrentValue = value && !options.some((option) => option.code === value);
    return (
      <div className="flex flex-col gap-1">
        <label id={labelId} htmlFor={inputId} className="text-xs font-sans text-ink-soft">
          {field.name}
          {field.required && <span className="ml-0.5 text-red-500" aria-label="requis">*</span>}
        </label>
        <select
          id={inputId}
          aria-labelledby={labelId}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={baseClass}
        >
          <option value="">{field.placeholder ?? 'Sélectionner…'}</option>
          {hasCurrentValue && <option value={value}>{value}</option>}
          {options.map((o, index) => (
            <option key={`${o.code}-${index}-${o.name}`} value={o.code}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Date input
  if (field.inputType === 'date') {
    return (
      <div className="flex flex-col gap-1">
        <label id={labelId} htmlFor={inputId} className="text-xs font-sans text-ink-soft">
          {field.name}
        </label>
        <input
          id={inputId}
          aria-labelledby={labelId}
          type="date"
          value={value}
          onChange={(e) => {
            // Convert YYYY-MM-DD to YYYYMMDD for BIM standard
            const raw = e.target.value.replace(/-/g, '');
            handleChange(raw);
          }}
          className={baseClass}
        />
      </div>
    );
  }

  // Number input
  if (field.inputType === 'number') {
    return (
      <div className="flex flex-col gap-1">
        <label id={labelId} htmlFor={inputId} className="text-xs font-sans text-ink-soft">
          {field.name}
        </label>
        <input
          id={inputId}
          aria-labelledby={labelId}
          type="number"
          value={value}
          min={0}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseClass}
        />
      </div>
    );
  }

  // Default: text input
  return (
    <div className="flex flex-col gap-1">
      <label id={labelId} htmlFor={inputId} className="text-xs text-gray-600">
        {field.name}
        {field.required && <span className="ml-0.5 text-red-500" aria-label="requis">*</span>}
      </label>
      <input
        id={inputId}
        aria-labelledby={labelId}
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        list={options.length > 0 ? dataListId : undefined}
        className={baseClass}
      />
      {options.length > 0 && (
        <datalist id={dataListId}>
          {options.map((option, index) => (
            <option key={`${option.code}-${index}-${option.name}`} value={option.code}>
              {option.name}
            </option>
          ))}
        </datalist>
      )}
    </div>
  );
}
