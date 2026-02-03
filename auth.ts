import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
export const config = {
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/sign-in",
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
            user.password,
          );

          if (isMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
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
        session.user.role = token?.role;
        session.user.name = token?.name;
      }

      // Only happens when you call `useSession().update(...)`
      if (trigger === "update" && session.user) {
        // In update, the updated fields are in `session`
        // (NOT in `user`)
        // Example: session.user.name is already updated
      }

      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      // First time jwt callback is run, user object is available
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
    authorized({ request, auth }: any) {
      //array of regex patterns of path we want to protect
      const protectedPaths = [/\/profile/, /\/user\/(.*)/, /\/admin/];
      //get path name from request URL object
      const { pathname } = request.nextUrl;
      // check if user is not authorized
      if (!auth && protectedPaths.some((path) => pathname.match(path))) {
        return false;
      }
      console.log("---- AUTHORIZED CALLBACK ----");

      console.log("Auth object:", auth);

      const cookie = request.cookies.get("sessionCartId");
      console.log("Existing sessionCartId cookie:", cookie);

      if (cookie) {
        console.log("Cookie already exists → allowing request");
        return true;
      }

      console.log("Cookie missing → generating new one");

      const sessionCartId = crypto.randomUUID();
      console.log("Generated sessionCartId:", sessionCartId);

      const res = NextResponse.next();

      res.cookies.set("sessionCartId", sessionCartId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });

      console.log("Cookie set on response ✅");

      return res;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
