'use client';
import { useState, useEffect, useRef } from 'react';
import { getDxfSvgCache, setDxfSvgCache } from '@/lib/viewer-cache';
import type { WorkspaceFile } from '@/lib/rename-engine/types';
import type { IDxf } from 'dxf-parser';

interface Props { readonly file: WorkspaceFile }

export function DxfPreview({ file }: Props) {
  const cached = getDxfSvgCache(file.id);
  const [svg, setSvg] = useState<string | null>(cached ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hit = getDxfSvgCache(file.id);
    if (hit) {
      setSvg(hit);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const text = await file.blob.text();
        const DxfParser = (await import('dxf-parser')).default;
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);
        if (cancelled) return;
        const rendered = dxf ? renderDxfToSvg(dxf) : null;
        setSvg(rendered);
        if (rendered) setDxfSvgCache(file.id, rendered);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [file.blob, file.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brick border-t-transparent" />
      </div>
    );
  }
  if (error || !svg) {
    return (
      <div className="flex-1 p-6 text-sm text-ink-soft">
        <p className="mb-2 font-sans font-semibold text-ink">Aperçu DXF limité.</p>
        <p>{error ?? "Aucune entité reconnaissable n'a été trouvée."}</p>
        <p className="mt-3 text-ink-mute">
          Le format DXF est complexe ; cet aperçu rend uniquement les entités 2D simples
          (lignes, polylignes, cercles, arcs, textes). Pour un rendu complet, ouvrez le
          fichier dans votre logiciel CAO habituel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-paper-2 p-4">
      <div
        ref={containerRef}
        className="bg-doc-surface rounded-md shadow-sm p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}

// Local extension of IEntity with geometry fields that specific entity
// handlers attach but that the base IEntity type doesn't declare.
interface DxfGeomEntity {
  type: string;
  vertices?: Array<{ x: number; y: number }>;
  position?: { x: number; y: number };
  center?: { x: number; y: number };
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  radius?: number;
  startAngle?: number;
  endAngle?: number;
  text?: string;
  height?: number;
}

function renderDxfToSvg(dxf: IDxf): string | null {
  // Cast entities to our richer local type for geometry access
  const entities = (dxf.entities ?? []) as DxfGeomEntity[];
  if (entities.length === 0) return null;

  // Compute bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const expand = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };
  for (const e of entities) {
    if (e.vertices) for (const v of e.vertices) expand(v.x, v.y);
    if (e.startPoint) expand(e.startPoint.x, e.startPoint.y);
    if (e.endPoint) expand(e.endPoint.x, e.endPoint.y);
    if (e.center && typeof e.radius === 'number') {
      expand(e.center.x - e.radius, e.center.y - e.radius);
      expand(e.center.x + e.radius, e.center.y + e.radius);
    }
    if (e.position) expand(e.position.x, e.position.y);
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return null;

  const w = Math.max(maxX - minX, 1);
  const h = Math.max(maxY - minY, 1);
  const pad = Math.max(w, h) * 0.05;

  // Y-axis is flipped in DXF vs SVG — negate y
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg"` +
    ` viewBox="${minX - pad} ${-maxY - pad} ${w + 2 * pad} ${h + 2 * pad}"` +
    ` stroke="#2B2218"` +
    ` stroke-width="${Math.max(w, h) * 0.002}"` +
    ` fill="none"` +
    ` preserveAspectRatio="xMidYMid meet"` +
    ` style="width:100%;height:auto;max-height:70vh;">`
  );

  for (const e of entities) {
    const t = e.type?.toUpperCase();

    if (t === 'LINE' && e.startPoint && e.endPoint) {
      parts.push(
        `<line x1="${e.startPoint.x}" y1="${-e.startPoint.y}"` +
        ` x2="${e.endPoint.x}" y2="${-e.endPoint.y}"/>`
      );
    } else if ((t === 'LWPOLYLINE' || t === 'POLYLINE') && e.vertices?.length) {
      const pts = e.vertices.map((v) => `${v.x},${-v.y}`).join(' ');
      parts.push(`<polyline points="${pts}"/>`);
    } else if (t === 'CIRCLE' && e.center && typeof e.radius === 'number') {
      parts.push(
        `<circle cx="${e.center.x}" cy="${-e.center.y}" r="${e.radius}"/>`
      );
    } else if (
      t === 'ARC' && e.center &&
      typeof e.radius === 'number' &&
      typeof e.startAngle === 'number' &&
      typeof e.endAngle === 'number'
    ) {
      // Approximate arc with polyline (24 segments)
      const segs = 24;
      const a0 = e.startAngle;
      const a1 = e.endAngle;
      const sweep = a1 - a0;
      const pts: string[] = [];
      for (let i = 0; i <= segs; i++) {
        const a = a0 + (sweep * i) / segs;
        pts.push(
          `${e.center.x + e.radius * Math.cos(a)},` +
          `${-(e.center.y + e.radius * Math.sin(a))}`
        );
      }
      parts.push(`<polyline points="${pts.join(' ')}"/>`);
    } else if ((t === 'TEXT' || t === 'MTEXT') && e.position && typeof e.text === 'string') {
      const fs = e.height ?? Math.max(w, h) * 0.02;
      const safe = e.text.replace(/[<>&]/g, (c) => (
        c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'
      ));
      parts.push(
        `<text x="${e.position.x}" y="${-e.position.y}"` +
        ` font-size="${fs}" stroke="none" fill="#2B2218">${safe}</text>`
      );
    }
  }
  parts.push('</svg>');
  return parts.join('');
}
