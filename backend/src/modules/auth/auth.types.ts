export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  verified: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface MessageResponse {
  message: string;
}