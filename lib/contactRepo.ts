import "server-only";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/server";

interface MockContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

declare global {
  var __dearGiftsContactMessages: MockContactMessage[] | undefined;
}

function mockLog(): MockContactMessage[] {
  if (!globalThis.__dearGiftsContactMessages) globalThis.__dearGiftsContactMessages = [];
  return globalThis.__dearGiftsContactMessages;
}

export async function recordContactMessage(input: { name: string; email: string; message: string }): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    await admin.from("contact_messages").insert(input);
    return;
  }
  mockLog().push({ ...input, id: randomUUID(), createdAt: new Date().toISOString() });
}
