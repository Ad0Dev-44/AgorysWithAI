export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email?: string;
}

export interface LoginResult extends AuthTokens {
  user: AuthUser;
}

export interface RegisterResult {
  message: string;
}

export interface MessageResponse {
  message: string;
}

/**
 * Optional: useful for refresh endpoint
 */
export interface RefreshResult extends AuthTokens {}

// export interface AuthTokens {
//   accessToken: string;
//   refreshToken: string;
// }

// export interface LoginResult {
//   verified: boolean;
//   message?: string;
//   accessToken?: string;
//   refreshToken?: string;
// }

// export interface MessageResponse {
//   message: string;
// }