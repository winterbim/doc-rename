/**
 * Sanitize untrusted HTML derived from user-uploaded documents before it is
 * injected with `dangerouslySetInnerHTML`.
 *
 * `.docx` (mammoth) and `.xlsx` (SheetJS) are converted to HTML on the client.
 * A hostile file can embed `<img onerror=...>`, inline event handlers or
 * `<script>` tags that would execute in the app origin. DOMPurify strips every
 * script/event-handler vector while preserving the document/table structure we
 * want to render.
 *
 * DOMPurify needs a DOM, so it is browser-only and lazy-imported to keep it out
 * of the initial bundle (consistent with the lazy-loaded viewers themselves).
 */
export async function sanitizeDocumentHtml(dirty: string): Promise<string> {
  const DOMPurify = (await import('dompurify')).default;
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}
