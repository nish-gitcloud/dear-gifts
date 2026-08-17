import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";

/** Lets admin pages check auth client-side before rendering protected content. */
export async function GET() {
  return NextResponse.json({ authed: await isAdminAuthed() });
}
