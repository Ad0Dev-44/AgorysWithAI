import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwtHelper.ts";
import { ApiError } from "../utils/ApiError.ts";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
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