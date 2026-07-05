import { prisma } from "../../lib/prisma.ts";
import { hashPassword, comparePassword } from "../../utils/pwdHelper.ts";

import { generateAccessToken } from "../../utils/jwtHelper.js";
import { randomUUID } from "crypto";

import { ApiError } from "../../utils/ApiError.ts";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthService {
  // ---------------- REGISTER ----------------
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ApiError(
        "EMAIL_ALREADY_EXISTS",
        "Email already in use",
        409,
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return {
      message: "User registered successfully",
    };
  }

  // ---------------- LOGIN ----------------
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        400,
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        400,
      );
    }

    return this.createSession(user.id);
  }

  // ---------------- REFRESH ----------------
  async refresh(refreshToken: string) {
    const session = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!session) {
      throw new ApiError(
        "INVALID_TOKEN",
        "Invalid refresh token",
        401,
      );
    }

    if (session.revoked) {
      throw new ApiError(
        "TOKEN_REVOKED",
        "Token has been revoked",
        401,
      );
    }

    if (session.expiresAt < new Date()) {
      throw new ApiError(
        "TOKEN_EXPIRED",
        "Token has expired",
        401,
      );
    }

    return {
      accessToken: generateAccessToken(session.userId),
      refreshToken,
    };
  }

  // ---------------- LOGOUT ----------------
  async logout(refreshToken: string) {
    const session = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!session) return;

    await prisma.refreshToken.update({
      where: { id: session.id },
      data: {
        revoked: true,
      },
    });
  }

  // ---------------- FORGOT PASSWORD (PLACEHOLDER) ----------------
  async forgotPassword(email: string) {
    return {
      message: "If the email exists, reset instructions will be sent.",
    };
  }

  // ---------------- RESET PASSWORD (PLACEHOLDER) ----------------
  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ) {
    return {
      message: "Password reset successful",
    };
  }

  // ---------------- CREATE SESSION ----------------
  private async createSession(userId: string) {
  const accessToken = generateAccessToken(userId);
  const refreshToken = randomUUID();

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
}
}

export const authService = new AuthService();