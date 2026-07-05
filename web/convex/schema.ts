import { defineSchema, defineTable } from 'convex/server';
import { authTables } from '@convex-dev/auth/server';
import { v } from 'convex/values';

export default defineSchema({
  ...authTables,

  /**
   * Extended user profile.
   */
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Plan billing status (managed by Stripe webhooks in production)
    plan: v.optional(v.union(v.literal('free'), v.literal('team'), v.literal('cabinet'))),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  })
    .index('by_email', ['email'])
    .index('by_phone', ['phone'])
    .index('by_stripe_customer', ['stripeCustomerId']),

  /**
   * Organizations / teams.
   */
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    primaryIndustry: v.optional(v.string()),
    plan: v.union(v.literal('team'), v.literal('cabinet')),
    ownerId: v.id('users'),
    maxProjects: v.optional(v.number()),
    maxMembers: v.optional(v.number()),
  })
    .index('by_slug', ['slug'])
    .index('by_owner', ['ownerId']),

  /**
   * Organization membership.
   */
  members: defineTable({
    orgId: v.id('organizations'),
    userId: v.id('users'),
    role: v.union(v.literal('admin'), v.literal('member')),
    status: v.union(v.literal('active'), v.literal('pending')),
    invitedEmail: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_user', ['userId'])
    .index('by_user_org', ['userId', 'orgId'])
    .index('by_invited_email', ['invitedEmail']),

  /**
   * Projects within an organization.
   */
  projects: defineTable({
    orgId: v.id('organizations'),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  })
    .index('by_org', ['orgId']),

  /**
   * Saved naming conventions.
   * Files are NEVER stored here — only the JSON rule definition.
   */
  conventions: defineTable({
    orgId: v.optional(v.id('organizations')),
    projectId: v.optional(v.id('projects')),
    createdBy: v.id('users'),
    name: v.string(),
    profileId: v.string(),
    templateId: v.optional(v.string()),
    // Serialized convention state (fields, entities, separator, etc.)
    ruleJson: v.string(),
    isDefault: v.optional(v.boolean()),
    version: v.optional(v.number()),
  })
    .index('by_org', ['orgId'])
    .index('by_project', ['projectId'])
    .index('by_creator', ['createdBy']),

  /**
   * Audit trail for Cabinet plan.
   */
  auditEvents: defineTable({
    orgId: v.id('organizations'),
    userId: v.id('users'),
    action: v.union(
      v.literal('convention_created'),
      v.literal('convention_updated'),
      v.literal('convention_applied'),
      v.literal('member_invited'),
      v.literal('member_joined'),
    ),
    metadata: v.optional(v.string()),
  })
    .index('by_org', ['orgId'])
    .index('by_user', ['userId']),
});
