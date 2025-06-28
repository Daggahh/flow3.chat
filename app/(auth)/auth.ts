import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { createGuestUser, getUser, createUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'guest' | 'regular';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
      image?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
    image?: string | null;
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) return null;

        return { ...user, type: 'regular' };
      },
    }),
    Credentials({
      id: 'guest',
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: 'guest' };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, ensure user exists in our database
      if (account?.provider === 'google') {
        let [existingUser] = await getUser(user.email!);
        if (!existingUser) {
          await createUser(user.email!, DUMMY_PASSWORD, user.image || undefined);
          [existingUser] = await getUser(user.email!); // fetch the new user
        }
        // Attach the DB user ID to the user object for the jwt callback
        user.id = existingUser.id;
        user.type = 'regular';
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Always use the DB user ID if available
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
        // Preserve profile image from OAuth providers
        if (user.image) {
          token.image = user.image;
        }
      }
      // For Google OAuth users, always set type as regular
      if (account?.provider === 'google') {
        token.type = 'regular';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
        if (token.image) {
          session.user.image = token.image;
        }
      }
      return session;
    },
  }
});
