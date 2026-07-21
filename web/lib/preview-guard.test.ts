import { describe, expect, it } from 'vitest';
import { checkPreviewSize, PREVIEW_SIZE_LIMITS } from './preview-guard';

describe('checkPreviewSize', () => {
  it.each([
    ['.pdf', 'documents', PREVIEW_SIZE_LIMITS.pdf],
    ['.docx', 'documents', PREVIEW_SIZE_LIMITS.office],
    ['.xlsx', 'documents', PREVIEW_SIZE_LIMITS.spreadsheet],
    ['.dxf', 'cad', PREVIEW_SIZE_LIMITS.dxf],
    ['.png', 'images', PREVIEW_SIZE_LIMITS.image],
  ] as const)('allows %s exactly at its preview limit', (extension, category, limit) => {
    expect(checkPreviewSize(extension, category, limit).ok).toBe(true);
  });

  it.each([
    ['.pdf', 'documents', PREVIEW_SIZE_LIMITS.pdf],
    ['.doc', 'documents', PREVIEW_SIZE_LIMITS.office],
    ['.xlsm', 'documents', PREVIEW_SIZE_LIMITS.spreadsheet],
    ['.dxf', 'cad', PREVIEW_SIZE_LIMITS.dxf],
    ['.jpg', 'images', PREVIEW_SIZE_LIMITS.image],
  ] as const)('disables only the %s preview above its limit', (extension, category, limit) => {
    const result = checkPreviewSize(extension, category, limit + 1);
    expect(result.ok).toBe(false);
    expect(result.maxBytes).toBe(limit);
    expect(result.reason).toMatch(/aperçu limité/i);
  });

  it('does not impose a new limit on formats with no expensive preview parser', () => {
    expect(checkPreviewSize('.ifc', 'bim', 500 * 1024 * 1024).ok).toBe(true);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    'rejects invalid preview size %s',
    (size) => {
      expect(checkPreviewSize('.pdf', 'documents', size).ok).toBe(false);
    },
  );
});
