import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { auth } from './auth';

/**
 * List organizations the current user belongs to.
 */
export const listMyOrganizations = query({
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query('members')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const orgs = await Promise.all(
      memberships.map(async (m) => {
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
    plan: v.union(v.literal('team'), v.literal('cabinet')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
    if (existing) throw new Error('Slug already taken');

    const limits = args.plan === 'cabinet'
      ? { maxMembers: 1000, maxProjects: 1000 }
      : { maxMembers: 10, maxProjects: 3 };

    const orgId = await ctx.db.insert('organizations', {
      name: args.name,
      slug: args.slug,
      primaryIndustry: args.primaryIndustry,
      plan: args.plan,
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
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const membership = await ctx.db
      .query('members')
      .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', args.orgId))
      .unique();
    if (!membership || membership.role !== 'admin') {
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

    const existing = await ctx.db
      .query('members')
      .withIndex('by_invited_email', (q) => q.eq('invitedEmail', args.email))
      .filter((q) => q.eq(q.field('orgId'), args.orgId))
      .unique();
    if (existing) throw new Error('Invitation already sent');

    await ctx.db.insert('members', {
      orgId: args.orgId,
      userId: userId, // placeholder until invitee accepts
      role: args.role,
      status: 'pending',
      invitedEmail: args.email,
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
