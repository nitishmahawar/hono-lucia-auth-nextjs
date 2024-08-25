import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./prisma";
import { Lucia, TimeSpan } from "lucia";
import { User } from "@prisma/client";
import { Google } from "arctic";
import { getUrl } from "./utils";

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${getUrl()}/api/auth/callback/google`
);

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(4, "w"),
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
    expires: true,
  },
  getUserAttributes({ hashedPassword, ...databaseUserAttributes }) {
    return databaseUserAttributes;
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Exclude<User, "hashedPassword">;
  }
}
