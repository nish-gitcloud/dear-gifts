import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { listAllGiftsForAdmin } from "@/lib/adminRepo";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ gifts: await listAllGiftsForAdmin() });
}
