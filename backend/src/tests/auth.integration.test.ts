import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userCreate: vi.fn(),
  companyFindUnique: vi.fn(),

  refreshTokenCreate: vi.fn(),
  refreshTokenFindUnique: vi.fn(),
  refreshTokenUpdate: vi.fn(),

  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateAccessToken: vi.fn(),
}));

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      create: mocks.userCreate,
    },

    company: {
      findUnique: mocks.companyFindUnique,
    },

    refreshToken: {
      create: mocks.refreshTokenCreate,
      findUnique: mocks.refreshTokenFindUnique,
      update: mocks.refreshTokenUpdate,
    },
  },
}));

vi.mock("../utils/pwdHelper", () => ({
  hashPassword: mocks.hashPassword,
  comparePassword: mocks.comparePassword,
}));

vi.mock("../utils/jwtHelper", () => ({
  generateAccessToken: mocks.generateAccessToken,
}));

import app from "../app";

const COMPANY_ID = "11111111-1111-4111-8111-111111111111";

const validRegisterBody = {
  email: "maya@example.com",
  password: "Password123",
  companyId: COMPANY_ID,
};

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.comparePassword.mockResolvedValue(true);
    mocks.generateAccessToken.mockReturnValue("mock-access-token");

    mocks.userCreate.mockResolvedValue({
      id: "user-1",
      email: validRegisterBody.email,
      companyId: COMPANY_ID,
    });

    mocks.refreshTokenCreate.mockResolvedValue({
      id: "refresh-token-1",
    });

    mocks.refreshTokenUpdate.mockResolvedValue({});
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      mocks.userFindUnique.mockResolvedValue(null);

      mocks.companyFindUnique.mockResolvedValue({
        id: COMPANY_ID,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterBody);

      expect(response.status).toBe(201);

      expect(response.body).toEqual({
        message: "User registered successfully",
      });

      expect(mocks.userFindUnique).toHaveBeenCalledWith({
        where: {
          email: validRegisterBody.email,
        },
      });

      expect(mocks.companyFindUnique).toHaveBeenCalledWith({
        where: {
          id: COMPANY_ID,
        },
      });

      expect(mocks.hashPassword).toHaveBeenCalledWith(
        validRegisterBody.password,
      );

      expect(mocks.userCreate).toHaveBeenCalledWith({
        data: {
          email: validRegisterBody.email,
          passwordHash: "hashed-password",
          companyId: COMPANY_ID,
        },
      });
    });

    it("returns 409 when email already exists", async () => {
      mocks.userFindUnique.mockResolvedValue({
        id: "existing-user",
        email: validRegisterBody.email,
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterBody);

      expect(response.status).toBe(409);

      expect(response.body).toEqual({
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email already in use",
      });

      expect(mocks.companyFindUnique).not.toHaveBeenCalled();
      expect(mocks.userCreate).not.toHaveBeenCalled();
    });

    it("returns 404 when company does not exist", async () => {
      mocks.userFindUnique.mockResolvedValue(null);
      mocks.companyFindUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/register")
        .send(validRegisterBody);

      expect(response.status).toBe(404);

      expect(response.body).toEqual({
        success: false,
        code: "COMPANY_NOT_FOUND",
        message: "The company you were invited to does not exist",
      });

      expect(mocks.userCreate).not.toHaveBeenCalled();
    });

    it("returns 422 for invalid registration data", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "invalid-email",
          password: "123",
          companyId: "invalid-company-id",
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");

      expect(response.body.errors).toHaveProperty("email");
      expect(response.body.errors).toHaveProperty("password");
      expect(response.body.errors).toHaveProperty("companyId");

      expect(mocks.userFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in a user and creates a session", async () => {
      mocks.userFindUnique.mockResolvedValue({
        id: "user-1",
        email: validRegisterBody.email,
        passwordHash: "stored-password-hash",
        companyId: COMPANY_ID,
      });

      mocks.comparePassword.mockResolvedValue(true);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterBody.email,
          password: validRegisterBody.password,
        });

      expect(response.status).toBe(200);

      expect(response.body).toEqual({
        user: {
          id: "user-1",
          email: validRegisterBody.email,
        },
        accessToken: "mock-access-token",
        refreshToken: expect.any(String),
      });

      expect(mocks.comparePassword).toHaveBeenCalledWith(
        validRegisterBody.password,
        "stored-password-hash",
      );

      expect(mocks.generateAccessToken).toHaveBeenCalledWith(
        "user-1",
        COMPANY_ID,
      );

      expect(mocks.refreshTokenCreate).toHaveBeenCalledWith({
        data: {
          token: expect.any(String),
          userId: "user-1",
          expiresAt: expect.any(Date),
        },
      });
    });

    it("returns 401 when password is incorrect", async () => {
      mocks.userFindUnique.mockResolvedValue({
        id: "user-1",
        email: validRegisterBody.email,
        passwordHash: "stored-password-hash",
        companyId: COMPANY_ID,
      });

      mocks.comparePassword.mockResolvedValue(false);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: validRegisterBody.email,
          password: "WrongPassword",
        });

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });

      expect(mocks.refreshTokenCreate).not.toHaveBeenCalled();
    });

    it("returns 401 when user does not exist", async () => {
      mocks.userFindUnique.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "unknown@example.com",
          password: "Password123",
        });

      expect(response.status).toBe(401);

      expect(response.body).toEqual({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });

      expect(mocks.comparePassword).not.toHaveBeenCalled();
      expect(mocks.refreshTokenCreate).not.toHaveBeenCalled();
    });

    it("returns 422 for invalid login data", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "not-an-email",
          password: "123",
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");

      expect(response.body.errors).toHaveProperty("email");
      expect(response.body.errors).toHaveProperty("password");

      expect(mocks.userFindUnique).not.toHaveBeenCalled();
    });
  });
});