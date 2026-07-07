import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/pwdHelper";
import { generateAccessToken } from "../../utils/jwtHelper";
import { ApiError } from "../../utils/ApiError";
import { randomUUID, createHash } from "crypto";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Hash refresh tokens before storing in DB
 * (prevents token theft if DB leaks)
 */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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
        409
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
        401
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        401
      );
    }

    return this.createSession(user.id, user.email);
  }

  // ---------------- REFRESH (ROTATION ENABLED) ----------------
  async refresh(refreshToken: string) {
    const hashed = hashToken(refreshToken);

    const session = await prisma.refreshToken.findUnique({
      where: { token: hashed },
    });

    if (!session) {
      throw new ApiError("INVALID_TOKEN", "Invalid refresh token", 401);
    }

    if (session.revoked) {
      throw new ApiError("TOKEN_REVOKED", "Token has been revoked", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new ApiError("TOKEN_EXPIRED", "Token has expired", 401);
    }

    // 🔄 ROTATE REFRESH TOKEN
    const newRefreshToken = randomUUID();

    await prisma.refreshToken.update({
      where: { id: session.id },
      data: {
        token: hashToken(newRefreshToken),
      },
    });

    return {
      accessToken: generateAccessToken(session.userId),
      refreshToken: newRefreshToken,
    };
  }

  // ---------------- LOGOUT ----------------
  async logout(refreshToken: string) {
    const hashed = hashToken(refreshToken);

    const session = await prisma.refreshToken.findUnique({
      where: { token: hashed },
    });

    if (!session) return;

    await prisma.refreshToken.update({
      where: { id: session.id },
      data: {
        revoked: true,
      },
    });
  }

  // ---------------- FORGOT PASSWORD (placeholder) ----------------
  async forgotPassword(email: string) {
    return {
      message: "If the email exists, reset instructions will be sent.",
    };
  }

  // ---------------- RESET PASSWORD (placeholder) ----------------
  async resetPassword(
    email: string,
    token: string,
    newPassword: string
  ) {
    return {
      message: "Password reset successful",
    };
  }

  // ---------------- CREATE SESSION ----------------
  private async createSession(userId: string, email?: string) {
    const accessToken = generateAccessToken(userId);

    const refreshToken = randomUUID();

    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    return {
      user: email ? { id: userId, email } : { id: userId },
      accessToken,
      refreshToken,
    };
  }
}

export const authService = new AuthService();