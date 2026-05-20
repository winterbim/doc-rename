import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FileTypePill, getFileTypeTone } from '../FileTypePill';

describe('getFileTypeTone', () => {
  it.each([
    ['plan.pdf', { label: 'PDF', tone: 'brick' }],
    ['rapport.DOCX', { label: 'DOC', tone: 'blue' }],
    ['table.xlsx', { label: 'XLS', tone: 'moss' }],
    ['budget.csv', { label: 'CSV', tone: 'moss' }],
    ['facade.dwg', { label: 'DWG', tone: 'gold' }],
    ['model.ifc', { label: 'IFC', tone: 'gold' }],
    ['scan.png', { label: 'IMG', tone: 'goldSoft' }],
    ['photo.JPG', { label: 'IMG', tone: 'goldSoft' }],
    ['livrables.zip', { label: 'ZIP', tone: 'ink' }],
    ['legacy.RAR', { label: 'RAR', tone: 'ink' }],
  ])('maps %s → %j', (name, expected) => {
    expect(getFileTypeTone(name)).toEqual(expected);
  });

  it('falls back for unknown extensions', () => {
    expect(getFileTypeTone('weird.qwerty')).toEqual({ label: 'QWER', tone: 'muted' });
  });

  it('accepts a bare extension with or without leading dot', () => {
    expect(getFileTypeTone('.pdf')).toEqual({ label: 'PDF', tone: 'brick' });
    expect(getFileTypeTone('docx')).toEqual({ label: 'DOC', tone: 'blue' });
  });

  it('returns a generic FILE pill for empty input', () => {
    expect(getFileTypeTone('')).toEqual({ label: 'FILE', tone: 'muted' });
    expect(getFileTypeTone('.')).toEqual({ label: 'FILE', tone: 'muted' });
  });
});

describe('FileTypePill', () => {
  it('renders the derived label as text', () => {
    render(<FileTypePill name="contrat.pdf" />);
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('honors labelOverride', () => {
    render(<FileTypePill name="contrat.docx" labelOverride="WORD" />);
    expect(screen.getByText('WORD')).toBeInTheDocument();
  });
});
