import LogoutButton from "@/components/logout-button";
import { getUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Page = async () => {
  const user = await getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center flex-col gap-4">
      <div className="flex flex-col items-center">
        <Avatar className="h-16 w-16 mb-4">
          <AvatarImage src={user.image} />
          <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
        </Avatar>

        <p className="font-semibold ">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <LogoutButton />
    </div>
  );
};

export default Page;
