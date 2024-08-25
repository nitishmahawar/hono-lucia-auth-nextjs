"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginWithGoogleButton from "@/components/login-with-google-button";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const Page = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: api.auth.login,
    onSuccess(data, variables, context) {
      console.log(data);
    },
    onError(error, variables, context) {
      toast.error(error.message);
    },
    onSettled(data, error, variables, context) {
      router.refresh();
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values);
  }

  return (
    <div className="h-svh flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yourname@example.com"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="************"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button disabled={isPending} className="w-full" type="submit">
                  {isPending ? (
                    <Loader size={20} className="animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2 text-xs uppercase font-medium items-center">
                  <hr className="w-full" />
                  <p>or</p>
                  <hr className="w-full" />
                </div>
                <LoginWithGoogleButton />
              </div>
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link className="font-medium text-primary" href="/register">
                  Register
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
