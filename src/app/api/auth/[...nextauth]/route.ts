import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "admin@tuma.com" &&
          credentials.password === "admin"
        ) {
          return {
            id: "1",
            name: "Admin",
            email: "admin@tuma.com",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // 👈 redirect if user is not logged in
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
