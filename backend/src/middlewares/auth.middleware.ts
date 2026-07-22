import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwtHelper";
import { ApiError } from "../utils/ApiError";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    companyId?: string | null;
  };
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return next(
        new ApiError(
          "UNAUTHORIZED",
          "Missing or invalid authorization header",
          401,
        ),
      );
    }

    const token = header.split(" ")[1];

    if (!token) {
      return next(
        new ApiError("UNAUTHORIZED", "Token not found in header", 401),
      );
    }

    const payload = verifyAccessToken(token);

    // 🔥 SAFE CAST HERE (not in function signature)
    (req as AuthenticatedRequest).user = {
      userId: payload.userId,
      companyId: payload.companyId ?? null,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    return next(
      new ApiError("UNAUTHORIZED", "Invalid or expired access token", 401),
    );
  }
};