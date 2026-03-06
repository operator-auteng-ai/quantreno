import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { getOrCreateOAuthUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    // Google OAuth — reads AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET from env
    Google,

    // Email + password (for existing users and manual testing)
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          // OAuth-only account — reject password sign-in
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Upsert user into our DB on first Google sign-in
      if (account?.provider === "google" && profile?.email) {
        try {
          await getOrCreateOAuthUser(profile.email);
        } catch {
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type ?? "regular";
      }

      // After Google sign-in, replace the Google sub with our DB UUID.
      // account is only present on the first sign-in, so this runs once.
      if (account?.provider === "google" && token.email) {
        const dbUsers = await getUser(token.email);
        if (dbUsers.length > 0) {
          token.id = dbUsers[0].id;
          token.type = "regular";
        }
      }

      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
