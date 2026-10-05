import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/models/user";

export type AdminAccess =
  | { status: "authorized"; userId: string; name: string; email: string }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

export async function getAdminAccess(token?: string): Promise<AdminAccess> {
  if (!token) return { status: "unauthenticated" };

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");

  let userId: string;
  try {
    const decoded = jwt.verify(token, secret);
    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      !mongoose.isValidObjectId(decoded.id)
    ) {
      return { status: "unauthenticated" };
    }
    userId = decoded.id;
  } catch {
    return { status: "unauthenticated" };
  }

  await connectDB();
  const user = await User.findById(userId).select("name email isAdmin").lean();

  if (!user) return { status: "unauthenticated" };
  if (user.isAdmin !== true) return { status: "forbidden" };

  return {
    status: "authorized",
    userId,
    name: user.name,
    email: user.email,
  };
}

export async function requireAdmin(request: NextRequest) {
  const access = await getAdminAccess(request.cookies.get("user_token")?.value);

  if (access.status === "authorized") {
    return { authorized: true as const, ...access };
  }

  const status = access.status === "unauthenticated" ? 401 : 403;
  return {
    authorized: false as const,
    response: NextResponse.json(
      {
        success: false,
        error: access.status === "unauthenticated" ? "Please sign in." : "Admin access required.",
      },
      { status }
    ),
  };
}