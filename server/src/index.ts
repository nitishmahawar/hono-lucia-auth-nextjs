import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { every } from "hono/combine";
import { getCookie } from "hono/cookie";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { Session, User } from "lucia";
import { lucia } from "./lib/auth";
import authApp from "./auth";
import { cors } from "hono/cors";

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>().basePath("/api");

app
  .use(csrf())
  .use(logger())
  .use(
    cors({
      origin: ["http://localhost:3000", "https://your-production-frontend.com"], // Add all allowed origins
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposeHeaders: ["Content-Length", "X-Requested-With"],
      maxAge: 600,
    })
  );

app.options("*", (c) => {
  return c.text("", 204);
});

// app.use("/auth/profile", async (c, next) => {
//   const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
//   if (!sessionId) {
//     c.set("user", null);
//     c.set("session", null);
//     return next();
//   }
//   const { session, user } = await lucia.validateSession(sessionId);
//   if (session && session.fresh) {
//     // use `header()` instead of `setCookie()` to avoid TS errors
//     c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
//       append: true,
//     });
//   }
//   if (!session) {
//     c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
//       append: true,
//     });
//   }
//   c.set("user", user);
//   c.set("session", session);
//   return next();
// });

app.get("/", (c) => {
  // const user = c.get("user");
  // if (!user) {
  //   return c.json({ message: "Unauthorized" }, 401);
  // }
  return c.text("Hello Hono!");
});

app.route("/auth", authApp);

const port = 5000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
