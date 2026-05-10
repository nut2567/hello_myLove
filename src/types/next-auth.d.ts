import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      pathName?: string;
      pathType?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    pathName?: string;
    pathType?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    pathName?: string;
    pathType?: string | null;
  }
}
