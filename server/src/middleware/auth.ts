import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { lucia } from "../lib/auth";

export const auth = async (c: Context, next: Next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId);

    if (session && session.fresh) {
      c.header(
        "Set-Cookie",
        lucia.createSessionCookie(session.id).serialize(),
        {
          append: true,
        }
      );
    }

    if (!session) {
      c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
        append: true,
      });
      return c.json({ error: "Invalid session" }, 401);
    }

    c.set("user", user);
    c.set("session", session);
    return next();
  } catch (error) {
    console.error("Error validating session:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
