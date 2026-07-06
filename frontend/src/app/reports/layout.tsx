import { RequireAuth } from "@/components/require-auth";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}