"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  RegisterFormValues,
  verifyEmailSchema,
  VerifyEmailFormValues,
} from "@/lib/validations/auth";

import { apiFetch } from "@/lib/api-client";
import { ApiClientError } from "@/lib/api-error";
import { useAuthStore } from "@/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

type Step = "register" | "verify";

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [step, setStep] = useState<Step>("register");
  const [pendingEmail, setPendingEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onResendCode = async () => {
    setServerError(null);
    setIsResending(true);

    try {
      await apiFetch<{ message: string }>("/api/auth/resend-verification", {
        method: "POST",
        body: { email: pendingEmail },
      });

      setResendCooldown(60);
    } catch (error) {
      setServerError(
        error instanceof ApiClientError
          ? error.message
          : "Something went wrong",
      );
    } finally {
      setIsResending(false);
    }
  };

  /* ---------------- FORMS ---------------- */

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "" },
  });

  const verifyForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { otp: "" },
  });

  /* ---------------- REGISTER ---------------- */

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      await apiFetch<{ message: string }>("/api/auth/register", {
        method: "POST",
        body: values,
      });

      setPendingEmail(values.email);
      setStep("verify");
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

  /* ---------------- VERIFY ---------------- */

  const onVerifySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const parsed = verifyEmailSchema.safeParse({ otp });

    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message ?? "Invalid code");
      return;
    }

    setOtpError(null);
    setServerError(null);
    setIsSubmitting(true);

    try {
      const response = await apiFetch<{
        accessToken: string;
        refreshToken: string;
      }>("/api/auth/verify-email", {
        method: "POST",
        body: {
          email: pendingEmail,
          otp,
        },
      });

      setSession(
        {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        pendingEmail,
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

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {step === "register" ? "Create an account" : "Verify your email"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {step === "register" ? (
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-500">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onVerifySubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit code to <strong>{pendingEmail}</strong>.
              </p>

              <Input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                placeholder="123456"
              />

              {otpError && <p className="text-sm text-red-500">{otpError}</p>}

              {serverError && (
                <p className="text-sm text-red-600">{serverError}</p>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
