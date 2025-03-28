import NextAuth, { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '../../../lib/db';
import Customer from '../../../models/Customer';
import bcrypt from 'bcrypt';
import { User } from 'next-auth';

// Define the expected credentials shape
interface Credentials {
  email: string;
  password: string;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<User | null> {
        // Type guard to ensure credentials exists and has the right shape
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await dbConnect();

        try {
          const customer = await Customer.findOne({ email: credentials.email });
          
          if (!customer) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(credentials.password, customer.password_hash);
          
          if (!passwordMatch) {
            return null;
          }

          // Return user object matching NextAuth's User type
          return {
            id: customer._id.toString(),
            email: customer.email,
            name: `${customer.first_name} ${customer.last_name}`
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login', // Custom login page
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        if (session.user) {
          session.user.id = token.id as string;
        }
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);