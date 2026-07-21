import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { auth } from './auth';
import { requireEmail, requireSlug, requireText } from './validation';
import { requirePaidSaasEnabled } from './paidFeature';

/**
 * List organizations the current user belongs to.
 */
export const listMyOrganizations = query({
  handler: async (ctx) => {
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query('members')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const orgs = await Promise.all(
      memberships.filter((m) => m.status === 'active').map(async (m) => {
        const org = await ctx.db.get(m.orgId);
        return org ? { ...org, role: m.role, memberId: m._id } : null;
      }),
    );

    return orgs.filter((o): o is NonNullable<typeof o> => o !== null);
  },
});

/**
 * Create a new organization.
 */
export const createOrganization = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    primaryIndustry: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    const plan = user?.plan;
    if (plan !== 'team' && plan !== 'cabinet') {
      throw new Error('A paid Team or Cabinet plan is required');
    }

    const name = requireText(args.name, 'Organization name', 120);
    const slug = requireSlug(args.slug);
    const primaryIndustry = args.primaryIndustry
      ? requireText(args.primaryIndustry, 'Primary industry', 80)
      : undefined;

    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    if (existing) throw new Error('Slug already taken');

    const limits = plan === 'cabinet'
      ? { maxMembers: 1000, maxProjects: 1000 }
      : { maxMembers: 10, maxProjects: 3 };

    const orgId = await ctx.db.insert('organizations', {
      name,
      slug,
      primaryIndustry,
      plan,
      ownerId: userId,
      ...limits,
    });

    await ctx.db.insert('members', {
      orgId,
      userId,
      role: 'admin',
      status: 'active',
    });

    // Create a default project for the org
    await ctx.db.insert('projects', {
      orgId,
      name: 'Général',
      isDefault: true,
    });

    return orgId;
  },
});

/**
 * Invite a member by email.
 */
export const inviteMember = mutation({
  args: {
    orgId: v.id('organizations'),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member')),
  },
  handler: async (ctx, args) => {
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const membership = await ctx.db
      .query('members')
      .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', args.orgId))
      .unique();
    if (!membership || membership.status !== 'active' || membership.role !== 'admin') {
      throw new Error('Only admins can invite members');
    }

    const org = await ctx.db.get(args.orgId);
    if (!org) throw new Error('Organization not found');

    const currentMembers = await ctx.db
      .query('members')
      .withIndex('by_org', (q) => q.eq('orgId', args.orgId))
      .collect();
    if (currentMembers.length >= (org.maxMembers ?? 10)) {
      throw new Error('Member limit reached');
    }

    const email = requireEmail(args.email);
    const existing = await ctx.db
      .query('members')
      .withIndex('by_invited_email', (q) => q.eq('invitedEmail', email))
      .filter((q) => q.eq(q.field('orgId'), args.orgId))
      .unique();
    if (existing) throw new Error('Invitation already sent');

    await ctx.db.insert('members', {
      orgId: args.orgId,
      role: args.role,
      status: 'pending',
      invitedEmail: email,
    });

    return { success: true };
  },
});

/**
 * Accept an invitation (simplified — matches by email).
 */
export const acceptInvitation = mutation({
  args: {
    orgId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const user = await ctx.db.get(userId);
    if (!user?.email) throw new Error('User email not found');

    const invitation = await ctx.db
      .query('members')
      .withIndex('by_invited_email', (q) => q.eq('invitedEmail', user.email))
      .filter((q) => q.eq(q.field('orgId'), args.orgId))
      .unique();
    if (!invitation) throw new Error('Invitation not found');

    await ctx.db.patch(invitation._id, {
      userId,
      status: 'active',
      invitedEmail: undefined,
    });

    return { success: true };
  },
});
