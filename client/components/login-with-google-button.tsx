import React from "react";
import { Button } from "./ui/button";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

const LoginWithGoogleButton = () => {
  const { mutate, isPending } = useMutation({
    mutationFn: api.auth.google,
    onSuccess(data, variables, context) {
      window.location.href = data?.url;
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
  });
  return (
    <Button
      disabled={isPending}
      variant="outline"
      className="w-full"
      type="button"
      onClick={() => mutate()}
    >
      {isPending && <Loader size={20} className="animate-spin mr-4" />}
      Continue With Google
    </Button>
  );
};

export default LoginWithGoogleButton;
