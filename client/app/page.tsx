"use client";
import LogoutButton from "@/components/logout-button";
import { useSession } from "@/components/session-provider";
import Image from "next/image";
import React from "react";

const Page = () => {
  const { session } = useSession();

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <div>
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt="profile"
            height={50}
            width={50}
          />
        )}
        <p>{session?.user?.name}</p>
        <p>{session?.user?.email}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Page;
