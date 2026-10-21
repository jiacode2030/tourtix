import { createHash } from "node:crypto";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Auth.js needs a secret to sign session cookies. If AUTH_SECRET isn't set,
// derive one from the database URL (which contains a random password), so
// there's nothing extra to configure. Changing either logs everyone out.
function authSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.DATABASE_URL) {
    return createHash("sha256").update(`tourtix-auth:${process.env.DATABASE_URL}`).digest("hex");
  }
  return undefined;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from the environment.
  providers: [Google],
  secret: authSecret(),
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    // token.sub is the Google account ID; expose it as the user ID.
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

export async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
