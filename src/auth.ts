import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import {
  getPathUserByCredentials,
  normalizePathNameValue,
} from "@/lib/path-access";

function readCredentialString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.PATH_ACCESS_SECRET,
  trustHost: true,
  session: {
    maxAge: 60 * 60 * 24,
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "path-access",
      name: "Path Access",
      credentials: {
        path: { label: "Path", type: "text" },
        pin: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const name = normalizePathNameValue(credentials.path);
        const pin = readCredentialString(credentials.pin);

        if (!name || !pin) {
          return null;
        }

        const user = await getPathUserByCredentials({ name, pin });

        if (!user) {
          return null;
        }

        return {
          id: user.name,
          name: user.name,
          pathName: user.name,
          pathType: user.type,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.pathName = user.pathName;
        token.pathType = user.pathType;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.name =
          typeof token.pathName === "string"
            ? token.pathName
            : session.user.name;
        session.user.pathName =
          typeof token.pathName === "string" ? token.pathName : undefined;
        session.user.pathType =
          typeof token.pathType === "string" ? token.pathType : null;
      }

      return session;
    },
  },
});
