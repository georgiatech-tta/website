import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

// Only the club's Google account can log in.
// Set ADMIN_EMAIL in env to restrict access.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!ADMIN_EMAIL) return false; // block all if not configured
      return user.email === ADMIN_EMAIL;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
