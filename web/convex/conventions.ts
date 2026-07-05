import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { auth } from './auth';

/**
 * Load conventions visible to the current user.
 * - Personal conventions (no orgId)
 * - Organization conventions where user is a member
 */
export const listConventions = query({
  args: {
    orgId: v.optional(v.id('organizations')),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    if (args.orgId) {
      const orgId = args.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership) throw new Error('Not a member of this organization');

      return ctx.db
        .query('conventions')
        .withIndex('by_org', (q) => q.eq('orgId', orgId))
        .order('desc')
        .collect();
    }

    // Personal conventions
    return ctx.db
      .query('conventions')
      .withIndex('by_creator', (q) => q.eq('createdBy', userId))
      .filter((q) => q.eq(q.field('orgId'), undefined))
      .order('desc')
      .collect();
  },
});

/**
 * Get a single convention by ID.
 */
export const getConvention = query({
  args: {
    id: v.id('conventions'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const convention = await ctx.db.get(args.id);
    if (!convention) throw new Error('Convention not found');

    if (convention.orgId) {
      const orgId = convention.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership) throw new Error('Not a member of this organization');
    } else if (convention.createdBy !== userId) {
      throw new Error('Not authorized');
    }

    return convention;
  },
});

/**
 * Save or update a convention.
 */
export const saveConvention = mutation({
  args: {
    id: v.optional(v.id('conventions')),
    name: v.string(),
    profileId: v.string(),
    templateId: v.optional(v.string()),
    ruleJson: v.string(),
    orgId: v.optional(v.id('organizations')),
    projectId: v.optional(v.id('projects')),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    if (args.orgId) {
      const orgId = args.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership) throw new Error('Not a member of this organization');
    }

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) throw new Error('Convention not found');
      if (existing.orgId !== args.orgId) throw new Error('Cannot move convention between orgs');
      if (!existing.orgId && existing.createdBy !== userId) throw new Error('Not authorized');

      await ctx.db.patch(args.id, {
        name: args.name,
        profileId: args.profileId,
        templateId: args.templateId,
        ruleJson: args.ruleJson,
        projectId: args.projectId,
        isDefault: args.isDefault,
        version: (existing.version ?? 1) + 1,
      });
      return args.id;
    }

    return ctx.db.insert('conventions', {
      orgId: args.orgId,
      projectId: args.projectId,
      createdBy: userId,
      name: args.name,
      profileId: args.profileId,
      templateId: args.templateId,
      ruleJson: args.ruleJson,
      isDefault: args.isDefault,
      version: 1,
    });
  },
});

/**
 * Delete a convention.
 */
export const deleteConvention = mutation({
  args: {
    id: v.id('conventions'),
  },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const convention = await ctx.db.get(args.id);
    if (!convention) throw new Error('Convention not found');

    if (convention.orgId) {
      const orgId = convention.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership || membership.role !== 'admin') {
        throw new Error('Only admins can delete org conventions');
      }
    } else if (convention.createdBy !== userId) {
      throw new Error('Not authorized');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
