import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/modules/auth/password";
import { isLocked, recordFailedAttempt, resetAttempts } from "@/modules/auth/rateLimit";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-email",
    newUser: "/profil",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        // Check if account is locked
        if (isLocked(credentials.email)) {
          throw new Error(
            "Compte temporairement verrouillé suite à trop de tentatives échouées. Réessayez dans 15 minutes."
          );
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          recordFailedAttempt(credentials.email);
          throw new Error("Identifiants invalides");
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          recordFailedAttempt(credentials.email);
          throw new Error("Identifiants invalides");
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        // Reset attempts on successful login
        resetAttempts(credentials.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          emailVerified: user.emailVerified,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in - store user data in token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.emailVerified = user.emailVerified ? true : false;
      }

      // OAuth sign in - verify email and update token
      if (account?.provider === "google" && user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { emailVerified: new Date() },
        });
        token.emailVerified = true;
      }

      // On update trigger, refresh user data from database
      if (trigger === "update" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { emailVerified: true, name: true, image: true },
        });
        if (dbUser) {
          token.emailVerified = dbUser.emailVerified ? true : false;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data from token to session
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).emailVerified = token.emailVerified as boolean;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user }) {
      // Allow sign in
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Initialize user preferences when user is created
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
        },
      });
    },
  },
};
