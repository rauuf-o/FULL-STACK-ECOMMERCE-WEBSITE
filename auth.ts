import { error } from "console";
import { Session } from "inspector/promises";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import { adapter } from "next/dist/server/web/adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";

export const config = {
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/auth/sign-out",
    error: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        // Find user in db
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );

          if (isMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
            };
          }
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, token, user, trigger }) {
      // Put user id on session
      if (session.user) {
        // token.sub exists for JWT strategy
        session.user.id = token?.sub ?? user?.id;
      }

      // Only happens when you call `useSession().update(...)`
      if (trigger === "update" && session.user) {
        // In update, the updated fields are in `session`
        // (NOT in `user`)
        // Example: session.user.name is already updated
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
