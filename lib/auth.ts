import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { db } from './db'
import { schema } from './db'
import { eq } from 'drizzle-orm'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false

      // Skip DB operations if no database configured
      if (!process.env.DATABASE_URL) return true

      try {
        const existing = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, user.email))
          .limit(1)

        if (existing.length === 0) {
          await db.insert(schema.users).values({
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null,
            provider: account?.provider ?? 'google',
            providerAccountId: account?.providerAccountId ?? null,
          })
        }
      } catch (err) {
        console.error('Auth DB upsert failed:', err)
        // Still allow sign-in even if DB fails
      }

      return true
    },
    async jwt({ token, user }) {
      if (user?.email && process.env.DATABASE_URL) {
        try {
          const dbUser = await db
            .select()
            .from(schema.users)
            .where(eq(schema.users.email, user.email))
            .limit(1)

          if (dbUser[0]) {
            token.userId = dbUser[0].id
          }
        } catch (err) {
          console.error('Auth DB lookup failed:', err)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId
      }
      return session
    },
  },
  pages: {
    signIn: '/', // Use our custom modal, not a separate page
  },
  secret: process.env.NEXTAUTH_SECRET,
}
