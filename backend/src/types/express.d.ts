import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        companyId?: string | null;
      } & JwtPayload;
    }
  }
}

export {};