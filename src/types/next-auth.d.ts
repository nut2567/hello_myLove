import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      pathName?: string;
      pathType?: string | null;
      pathSessionId?: string;
      adminCaptchaVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    pathName?: string;
    pathType?: string | null;
    pathSessionId?: string;
    adminCaptchaVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    pathName?: string;
    pathType?: string | null;
    pathSessionId?: string;
    adminCaptchaVerified?: boolean;
  }
}
