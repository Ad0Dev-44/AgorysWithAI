"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginFormValues } from "@/lib/validations/auth";

import { apiFetch } from "@/lib/api-client";
import { ApiClientError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();

  const setSession = useAuthStore((state) => state.setSession);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const result = await apiFetch<{
        verified: boolean;
        message?: string;
        accessToken?: string;
        refreshToken?: string;
      }>("/api/auth/login", {
        method: "POST",
        body: values,
      });

      if (!result.verified) {
        setServerError(result.message ?? "Please verify your email first.");
        return;
      }

      setSession(
        {
          accessToken: result.accessToken!,
          refreshToken: result.refreshToken!,
        },
        values.email,
      );

      router.push("/dashboard");
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-signal-grid p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-display text-xl">Log in to Agorys</CardTitle>
          <p className="text-sm text-muted-foreground">
            Welcome back — pick up where you left off.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Input
                type="email"
                placeholder="Email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Input
                type="password"
                placeholder="Password"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Logging in..." : "Log in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <a href="/register" className="font-medium text-primary hover:underline">
                Create one
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
