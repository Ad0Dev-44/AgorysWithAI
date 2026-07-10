import { RequireAuth } from "@/components/require-auth";

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}