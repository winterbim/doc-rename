import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

const ONE_HOUR_MS = 60 * 60 * 1_000;

function requireText(value: string, maxLength: number, required = false): string {
  const normalized = value.trim();
  if (required && !normalized) throw new Error('INVALID_REQUEST');
  if (normalized.length > maxLength) throw new Error('INVALID_REQUEST');
  return normalized;
}

export const create = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.string(),
    role: v.string(),
    industry: v.string(),
    currentTool: v.string(),
    monthlyFiles: v.string(),
    convention: v.string(),
    message: v.string(),
    offer: v.union(v.literal('pilot'), v.literal('team'), v.literal('cabinet')),
    ipHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const since = now - ONE_HOUR_MS;
    const email = requireText(args.email, 254, true).toLowerCase();
    const company = requireText(args.company, 160, true);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[a-f0-9]{64}$/.test(args.ipHash)) {
      throw new Error('INVALID_REQUEST');
    }

    const recentForEmail = await ctx.db
      .query('pilotRequests')
      .withIndex('by_email', (query) => query.eq('email', email))
      .order('desc')
      .take(3);
    const recentForIp = await ctx.db
      .query('pilotRequests')
      .withIndex('by_ip_hash', (query) => query.eq('ipHash', args.ipHash))
      .order('desc')
      .take(5);
    if (
      recentForEmail.filter((request) => request.submittedAt >= since).length >= 3 ||
      recentForIp.filter((request) => request.submittedAt >= since).length >= 5
    ) {
      return { accepted: false as const, reason: 'rate_limit' as const };
    }

    const reference = await ctx.db.insert('pilotRequests', {
      name: requireText(args.name, 120),
      email,
      company,
      role: requireText(args.role, 120),
      industry: requireText(args.industry, 80, true),
      currentTool: requireText(args.currentTool, 160),
      monthlyFiles: requireText(args.monthlyFiles, 40, true),
      convention: requireText(args.convention, 100, true),
      message: requireText(args.message, 2_000),
      offer: args.offer,
      ipHash: args.ipHash,
      consentVersion: 'privacy-2026-07-21',
      submittedAt: now,
      status: 'new',
    });
    return { accepted: true as const, reference };
  },
});

export const cleanupExpired = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1_000;
    const expired = await ctx.db
      .query('pilotRequests')
      .withIndex('by_submitted_at', (query) => query.lt('submittedAt', cutoff))
      .take(100);
    await Promise.all(expired.map((request) => ctx.db.delete(request._id)));
    return expired.length;
  },
});
