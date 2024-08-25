"use client";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: api.auth.logout,
    onSuccess(data, variables, context) {},
    onError(error, variables, context) {
      toast.error(error.message);
    },

    onSettled(data, error, variables, context) {
      router.refresh();
    },
  });
  return (
    <Button onClick={() => mutate()} disabled={isPending}>
      Logout <LogOut size={20} className="ml-2" />
    </Button>
  );
};

export default LogoutButton;
