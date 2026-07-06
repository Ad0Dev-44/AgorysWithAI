import { create } from "zustand";
import { persist } from "zustand/middleware";
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;
  setSession: (tokens: { accessToken: string; refreshToken: string }, email: string) => void;
  clearSession: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    { name: "agorys-auth" },
  ),
);
