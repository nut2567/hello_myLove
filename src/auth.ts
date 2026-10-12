import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authenticateAdminUser } from "@/lib/admin-users";

import {
  authenticatePathUser,
  normalizePathNameValue,
} from "@/lib/path-access";
import { normalizePathPin } from "@/lib/path-password";
import { isPathSessionCurrent } from "@/lib/path-session";

class PathAccessRateLimited extends CredentialsSignin {
  code = "rate-limited";
}

class PathAccessRequestPending extends CredentialsSignin {
  code = "request-pending";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.PATH_ACCESS_SECRET,
  trustHost: true,
  logger: {
    error(error) {
      // Auth.js errors can contain nested request details; keep credentials out of logs.
      console.error("Authentication error:", error.name);
    },
  },
  session: {
    maxAge: 60 * 60 * 24,
    strategy: "jwt",
  },
  providers: [
    Credentials({
      id: "admin-access",
      name: "Admin Access",
      credentials: {
        path: { label: "Admin account", type: "text" },
        pin: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const name = normalizePathNameValue(credentials.path);
        const pin = normalizePathPin(credentials.pin);
        if (!name || !pin) return null;
        const result = await authenticateAdminUser({ name, pin, headers: request.headers });
        if (result.status === "rate-limited") throw new PathAccessRateLimited();
        if (result.status !== "authenticated") return null;
        return { id: result.user.name, name: result.user.name, pathName: result.user.name, pathType: result.user.type, pathSessionId: result.sessionId };
      },
    }),
    Credentials({
      id: "path-access",
      name: "Path Access",
      credentials: {
        path: { label: "Path", type: "text" },
        pin: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const name = normalizePathNameValue(credentials.path);
        const pin = normalizePathPin(credentials.pin);

        if (!name || !pin) {
          return null;
        }

        const result = await authenticatePathUser({ name, pin, headers: request.headers });
        if (result.status === "rate-limited") throw new PathAccessRateLimited();
        if (result.status === "request-pending") throw new PathAccessRequestPending();
        if (result.status !== "authenticated") {
          return null;
        }
        const { user } = result;

        return {
          id: user.name,
          name: user.name,
          pathName: user.name,
          pathType: user.type,
          pathSessionId: result.sessionId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.pathName = user.pathName;
        token.pathType = user.pathType;
        token.pathSessionId = user.pathSessionId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name =
          typeof token.pathName === "string"
            ? token.pathName
            : session.user.name;
        session.user.pathName =
          typeof token.pathName === "string" ? token.pathName : undefined;
        session.user.pathType =
          typeof token.pathType === "string" ? token.pathType : null;
        session.user.pathSessionId = typeof token.pathSessionId === "string" ? token.pathSessionId : undefined;
        if (session.user.pathName && !await isPathSessionCurrent(session, session.user.pathName)) {
          return { expires: session.expires };
        }
      }

      return session;
    },
  },
});
