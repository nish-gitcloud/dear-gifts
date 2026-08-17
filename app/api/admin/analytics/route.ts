import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { getCreatorFunnel, getRecipientFunnel } from "@/lib/analyticsRepo";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const [creatorFunnel, recipientFunnel] = await Promise.all([getCreatorFunnel(), getRecipientFunnel()]);
  return NextResponse.json({ creatorFunnel, recipientFunnel });
}
