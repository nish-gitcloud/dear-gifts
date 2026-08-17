import { NextRequest, NextResponse } from "next/server";
import { recordContactMessage } from "@/lib/contactRepo";

export async function POST(request: NextRequest) {
  const { name, email, message } = (await request.json()) as { name?: string; email?: string; message?: string };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  }

  await recordContactMessage({ name: name.trim(), email: email.trim(), message: message.trim() });
  return NextResponse.json({ ok: true });
}
