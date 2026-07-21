'use client';

import { useAppContext } from '@/lib/app-state';
import { getIndustryProfile } from '@/lib/profiles';

export function TemplatePicker() {
  const { state, dispatch } = useAppContext();
  const activeIds = state.fields.activeFieldIds;
  const profile = getIndustryProfile(state.profileId);
  const templates = profile.templates;

  // Detect current template by matching field lists
  let currentTemplate = 'custom';
  for (const template of templates) {
    const fids = template.fields;
    if (
      fids.length === activeIds.length &&
      fids.every((id, i) => activeIds[i] === id)
    ) {
      currentTemplate = template.id;
      break;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val !== 'custom') {
      dispatch({ type: 'TEMPLATE_LOAD', templateId: val });
    }
  };

  const selectedTemplate = templates.find((t) => t.id === currentTemplate);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="template-picker" className="text-[11px] font-medium text-ink-mute uppercase tracking-wide">
        Modèle
      </label>
      <select
        id="template-picker"
        value={currentTemplate}
        onChange={handleChange}
        className="w-full rounded-md border border-line bg-surface dark:bg-paper-2 text-ink px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brick focus:border-brick"
      >
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>

      {selectedTemplate?.example && (
        <p className="text-[10px] text-ink-mute font-mono truncate" title={selectedTemplate.example}>
          Ex. : {selectedTemplate.example}
        </p>
      )}
      {selectedTemplate?.disclaimer && (
        <p className="text-[10px] leading-snug text-ink-mute">{selectedTemplate.disclaimer}</p>
      )}
    </div>
  );
}
