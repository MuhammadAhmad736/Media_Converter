import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAdminAccess } from "@/lib/middleware/require-admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const token = (await cookies()).get("user_token")?.value;
  const access = await getAdminAccess(token);

  if (access.status !== "authorized") notFound();

  return children;
}