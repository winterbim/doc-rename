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
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    const name = data.attrName.toLowerCase();
    const value = data.attrValue.trim();
    if (name === 'src') {
      data.keepAttr = /^(?:blob:|data:image\/(?:png|jpe?g|gif|webp);base64,)/i.test(value);
    } else if (name === 'href') {
      data.keepAttr = /^(?:https?:|mailto:|#|\/)/i.test(value);
    } else if (name === 'style' || name === 'srcset') {
      data.keepAttr = false;
    }
  });
  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
        'a', 'img', 'blockquote', 'pre', 'code', 'hr', 'sup', 'sub',
      ],
      ALLOWED_ATTR: [
        'href', 'title', 'alt', 'src', 'colspan', 'rowspan', 'scope',
        'width', 'height', 'class',
      ],
      FORBID_ATTR: ['style', 'srcset'],
      FORBID_TAGS: ['form', 'iframe', 'object', 'embed', 'video', 'audio', 'source'],
    });
  } finally {
    DOMPurify.removeAllHooks();
  }
}
