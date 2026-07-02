"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-logout";

export function LogoutButton() {
  const { logout, isLoggingOut } = useLogout();

  return (
    <Button variant="outline" onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? "Logging out..." : "Log out"}
    </Button>
  );
}
