import jwt, { SignOptions } from "jsonwebtoken";

export const generateAccessToken = (userId: string, companyId: string | null) => {
  return jwt.sign({ userId, companyId }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
    userId: string;
    companyId: string | null;
  };
};

export const generateRefreshToken = (userId: string, sessionId: string) => {
  return jwt.sign(
    {
      userId,
      sessionId,
    },
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    } as SignOptions,
  );
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as {
    userId: string;
    sessionId: string;
  };
};
