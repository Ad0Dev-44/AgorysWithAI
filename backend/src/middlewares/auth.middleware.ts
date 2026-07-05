import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwtHelper.js";
import { ApiError } from "../utils/ApiError.js";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new ApiError(
        "UNAUTHORIZED",
        "Missing or invalid authorization header",
        401,
      );
    }

    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }

    next(new ApiError("UNAUTHORIZED", "Invalid or expired access token", 401));
  }
};