import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;

  setSession: (
    tokens: { accessToken: string; refreshToken: string },
    email: string
  ) => void;

  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  email: null,

  setSession: (tokens, email) =>
    set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      email,
    }),

  clearSession: () =>
    set({
      accessToken: null,
      refreshToken: null,
      email: null,
    }),
}));