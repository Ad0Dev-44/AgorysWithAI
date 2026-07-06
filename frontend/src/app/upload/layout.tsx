import { ReactNode } from "react";
import { RequireAuth } from "@/components/require-auth";

export default function ReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}