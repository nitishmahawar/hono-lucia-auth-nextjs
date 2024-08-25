import { User } from "@/types/auth";
import { cookies } from "next/headers";
import { cache } from "react";

export const getUser = cache(async () => {
  const cookieStore = cookies();
  const sessionId = cookieStore.get("auth_session");

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/profile`,
    {
      headers: {
        Cookie: `auth_session=${sessionId?.value}`,
      },
    }
  );

  if (!response.ok) {
    // Handle error
    return null;
  }

  return (await response.json()).user as User;
});
