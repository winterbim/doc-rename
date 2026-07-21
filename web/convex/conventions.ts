import { v } from 'convex/values';
import { query, mutation } from './_generated/server';
import { auth } from './auth';
import { requireRuleJson, requireText } from './validation';
import { requirePaidSaasEnabled } from './paidFeature';

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
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    if (args.orgId) {
      const orgId = args.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership || membership.status !== 'active') {
        throw new Error('Not a member of this organization');
      }

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
    requirePaidSaasEnabled();
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
      if (!membership || membership.status !== 'active') {
        throw new Error('Not a member of this organization');
      }
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
    requirePaidSaasEnabled();
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const name = requireText(args.name, 'Convention name', 120);
    const profileId = requireText(args.profileId, 'Profile ID', 80);
    const templateId = args.templateId
      ? requireText(args.templateId, 'Template ID', 80)
      : undefined;
    const ruleJson = requireRuleJson(args.ruleJson);

    if (args.orgId) {
      const orgId = args.orgId;
      const membership = await ctx.db
        .query('members')
        .withIndex('by_user_org', (q) => q.eq('userId', userId).eq('orgId', orgId))
        .unique();
      if (!membership || membership.status !== 'active') {
        throw new Error('Not a member of this organization');
      }

      if (args.projectId) {
        const project = await ctx.db.get(args.projectId);
        if (!project || project.orgId !== args.orgId) {
          throw new Error('Project does not belong to this organization');
        }
      }
    } else if (args.projectId) {
      throw new Error('A personal convention cannot reference an organization project');
    }

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (!existing) throw new Error('Convention not found');
      if (existing.orgId !== args.orgId) throw new Error('Cannot move convention between orgs');
      if (!existing.orgId && existing.createdBy !== userId) throw new Error('Not authorized');

      await ctx.db.patch(args.id, {
        name,
        profileId,
        templateId,
        ruleJson,
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
      name,
      profileId,
      templateId,
      ruleJson,
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
    requirePaidSaasEnabled();
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
      if (!membership || membership.status !== 'active' || membership.role !== 'admin') {
        throw new Error('Only admins can delete org conventions');
      }
    } else if (convention.createdBy !== userId) {
      throw new Error('Not authorized');
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
