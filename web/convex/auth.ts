import { convexAuth } from '@convex-dev/auth/server';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';

/**
 * Convex Auth configuration.
 *
 * Providers enabled:
 * - Google OAuth (set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars)
 * - GitHub OAuth (set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET env vars)
 *
 * To add email/password or magic links later, see:
 * https://labs.convex.dev/auth/config/passwords
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub,
    Google,
  ],
});
