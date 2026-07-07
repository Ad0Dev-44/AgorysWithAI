import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  email: string | null;

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  setSession: (
    tokens: { accessToken: string; refreshToken: string },
    email: string
  ) => void;

  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      email: null,

      hasHydrated: false,

      setHasHydrated: (value) =>
        set({
          hasHydrated: value,
        }),

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
    {
      name: "agorys-auth",

      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        email: state.email,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);