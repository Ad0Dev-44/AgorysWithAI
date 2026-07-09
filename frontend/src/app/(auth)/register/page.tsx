"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogout } from "@/hooks/use-logout";

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
import { LogoutButton } from "@/components/logout-button";

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
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <CardTitle className="text-2xl font-bold">
            {step === "register" ? "Create your account" : "Verify your email"}
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {step === "register"
              ? "Join TechTalks Agorys and start sharing knowledge."
              : "Enter the verification code sent to your email."}
          </p>
        </CardHeader>

        <CardContent>
          {step === "register" ? (
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-5"
            >
              <div className="space-y-2">
                <FieldLabel>Email</FieldLabel>

                <Input
                  type="email"
                  placeholder="you@example.com"
                  {...registerForm.register("email")}
                />

                {registerForm.formState.errors.email && (
                  <FieldError>
                    {registerForm.formState.errors.email.message}
                  </FieldError>
                )}
              </div>

              <div className="space-y-2">
                <FieldLabel>Password</FieldLabel>

                <Input
                  type="password"
                  placeholder="Create a password"
                  {...registerForm.register("password")}
                />

                {registerForm.formState.errors.password && (
                  <FieldError>
                    {registerForm.formState.errors.password.message}
                  </FieldError>
                )}

                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>

              {serverError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-medium text-primary hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={onVerifySubmit} className="space-y-5">
              <div className="rounded-md bg-muted p-3 text-sm">
                A verification code was sent to:
                <br />
                <strong>{pendingEmail}</strong>
              </div>

              <div className="space-y-2">
                <FieldLabel>Verification code</FieldLabel>

                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.5em]"
                />

                {otpError && <FieldError>{otpError}</FieldError>}
              </div>

              {serverError && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {serverError}
                </div>
              )}

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify email"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onResendCode}
                disabled={isResending || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : isResending
                    ? "Sending..."
                    : "Resend code"}
              </Button>

              <button
                type="button"
                className="w-full text-sm text-muted-foreground hover:underline"
                onClick={() => setStep("register")}
              >
                Change email
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
