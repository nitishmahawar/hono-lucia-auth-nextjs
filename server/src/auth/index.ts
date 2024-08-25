import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import prisma from "../lib/prisma";
import argon2 from "argon2";
import { google, lucia } from "../lib/auth";
import { getCookie, setCookie } from "hono/cookie";
import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { error } from "console";
import { auth } from "../middleware/auth";
import { Session, User } from "lucia";

// Login schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>();

app.post("/register", zValidator("json", registerSchema), async (c) => {
  try {
    const { email, name, password } = c.req.valid("json");

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return c.json(
        { error: "An account with this email already exists" },
        409
      );
    }

    // Hash password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Create user
    const newUser = await prisma.user.create({
      data: { email, name, hashedPassword },
      select: { id: true, email: true, name: true }, // Only select non-sensitive fields
    });

    // Create session for the new user
    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header("Set-Cookie", sessionCookie.serialize(), { append: true });

    return c.json({ message: "Registration successful", user: newUser }, 201);
  } catch (error) {
    return c.json({ error: "An error occurred during registration" }, 500);
  }
});

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (!existingUser) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  if (!existingUser.hashedPassword) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const isValidPassword = await argon2.verify(
    existingUser.hashedPassword,
    password
  );

  if (!isValidPassword) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  c.header("Set-Cookie", sessionCookie.serialize(), { append: true });

  return c.json({ message: "Login successful" });
});

app.post("/logout", async (c) => {
  const sessionId = getCookie(c, lucia.sessionCookieName);

  if (!sessionId) {
    return c.json({ error: "No active session" }, 401);
  }

  try {
    await lucia.invalidateSession(sessionId);
  } catch (error: any) {
    if (error.message === "AUTH_INVALID_SESSION_ID") {
      // Session doesn't exist or is already invalid
      return c.json({ error: "Invalid session" }, 401);
    }
    // Unexpected error
    return c.json({ error: "An error occurred during logout" }, 500);
  }

  // Clear the session cookie
  const sessionCookie = lucia.createBlankSessionCookie();
  c.header("Set-Cookie", sessionCookie.serialize());

  return c.json({ message: "Logged out successfully" }, 200);
});

app.get("/google", async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  });

  setCookie(c, "google_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  setCookie(c, "google_oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return c.json({ url: url.toString() });
});

app.get("/callback/google", async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = getCookie(c, "google_oauth_state") ?? null;
  const codeVerifier = getCookie(c, "google_oauth_code_verifier") ?? null;
  if (
    !code ||
    !state ||
    !storedState ||
    state !== storedState ||
    !codeVerifier
  ) {
    return c.json({ error: "Invalid request" }, 400);
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);

    const googleUserResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        method: "GET",
      }
    );

    if (!googleUserResponse.ok) {
      return c.json({ error: "Error getting Google profile" }, 500);
    }

    const googleUser: GoogleUser = await googleUserResponse.json();
    // Replace this with your own DB client.

    let existingUser = await prisma.user.findFirst({
      where: { accounts: { some: { providerUserId: googleUser.id } } },
    });

    if (!existingUser) {
      existingUser = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });
    }

    if (existingUser) {
      const existingAccount = await prisma.account.findFirst({
        where: {
          userId: existingUser.id,
          providerId: "google",
        },
      });

      if (!existingAccount) {
        // Link Google account to existing user
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            providerId: "google",
            providerUserId: googleUser.id,
          },
        });
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      c.header("Set-Cookie", sessionCookie.serialize(), { append: true });

      return c.redirect(`http://localhost:3000/`, 302);
    }

    // CREATE_USER_HERE

    const newUser = await prisma.user.create({
      data: {
        email: googleUser.email,
        image: googleUser.picture,
        name: googleUser.name,
        accounts: {
          create: { providerId: "google", providerUserId: googleUser.id },
        },
      },
    });

    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize(), { append: true });

    return c.redirect("http://localhost:3000/");
  } catch (e) {
    console.log(error);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return c.json(e.message, 400);
    }

    return c.json("Internal Server Error", 500);
  }
});

app.get("/profile", auth, async (c) => {
  const user = c.get("user");
  const session = c.get("session");

  return c.json({ user, session });
});

export default app;

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
}
