import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, createAdminSessionToken, ADMIN_COOKIE, SESSION_HOURS } from "@/lib/adminAuth";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  if (!env.admin.isConfigured) {
    return NextResponse.json({ error: "Admin access isn't configured on this deployment (set ADMIN_PASSWORD)." }, { status: 503 });
  }

  const { password } = (await request.json()) as { password: string };
  if (!password || !checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
  return response;
}
