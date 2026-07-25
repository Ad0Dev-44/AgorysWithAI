import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/pwdHelper";
import { generateAccessToken } from "../../utils/jwtHelper";
import { ApiError } from "../../utils/ApiError";
import { generateOTP, hashOTP } from "../../utils/otpHelper";
import { sendEmail } from "../../utils/emailHelper";
import { randomUUID, createHash } from "crypto";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

/**
 * Hash refresh tokens before storing in DB
 * (prevents token theft if DB leaks)
 */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export class AuthService {
  // ---------------- REGISTER ----------------
  async register(email: string, password: string, companyId?: string, companyName?: string) {
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

    let resolvedCompanyId: string;

    if (companyId) {
      // Invite flow: joining an existing company.
      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new ApiError(
          "COMPANY_NOT_FOUND",
          "The company you were invited to does not exist",
          404
        );
      }

      resolvedCompanyId = company.id;
    } else {
      // Self-serve flow: no companyId given, so create a new Company for this user.
      const newCompany = await prisma.company.create({
        data: {
          name: companyName?.trim() || `${email.split("@")[0]}'s Company`,
        },
      });

      resolvedCompanyId = newCompany.id;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        companyId: resolvedCompanyId,
      },
    });

    const otp = generateOTP();

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        otpHash: hashOTP(otp),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        lastSentAt: new Date(),
      },
    });

    await sendEmail(
      email,
      "Verify your email",
      `Your verification code is ${otp}. It expires in 10 minutes.`,
    );

    return {
      message: "User registered successfully",
    };
  }

  // ---------------- VERIFY EMAIL ----------------
  async verifyEmail(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new ApiError("INVALID_OTP", "Invalid or expired code", 400);
    }

    const verification = await prisma.emailVerification.findUnique({
      where: { userId: user.id },
    });

    if (!verification) {
      throw new ApiError("INVALID_OTP", "Invalid or expired code", 400);
    }

    if (verification.lockedUntil && verification.lockedUntil > new Date()) {
      throw new ApiError(
        "TOO_MANY_ATTEMPTS",
        "Too many incorrect attempts. Please request a new code.",
        429,
      );
    }

    if (verification.expiresAt < new Date()) {
      throw new ApiError("OTP_EXPIRED", "This code has expired. Please request a new one.", 400);
    }

    if (hashOTP(otp) !== verification.otpHash) {
      const attempts = verification.attempts + 1;
      const lockedUntil =
        attempts >= MAX_OTP_ATTEMPTS ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await prisma.emailVerification.update({
        where: { userId: user.id },
        data: { attempts, lockedUntil },
      });

      throw new ApiError("INVALID_OTP", "Invalid or expired code", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    await prisma.emailVerification.delete({ where: { userId: user.id } });

    return this.createSession(user.id, user.companyId, user.email);
  }

  // ---------------- LOGIN ----------------
async login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw new ApiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
  }

  if (!user.isVerified) {
    return {
      verified: false,
      message: "Please verify your email before logging in.",
    };
  }

  const session = await this.createSession(user.id, user.companyId, user.email);

  return {
    verified: true,
    ...session,
  };
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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new ApiError("INVALID_TOKEN", "Invalid refresh token", 401);
    }

    return {
      accessToken: generateAccessToken(user.id, user.companyId),
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
  private async createSession(
    userId: number,
    companyId: string | null,
    email?: string
  ) {
    const accessToken = generateAccessToken(userId, companyId);

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