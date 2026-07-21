import { query } from './_generated/server';
import { auth } from './auth';

/**
 * Current authenticated user profile (plan, email).
 * Used by the app to unlock unlimited renames for paid accounts.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      id: user._id,
      email: user.email ?? null,
      name: user.name ?? null,
      plan: user.plan ?? 'free',
      image: user.image ?? null,
    };
  },
});
