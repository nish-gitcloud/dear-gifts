import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/services/razorpay";

export async function POST(request: NextRequest) {
  const { amount } = (await request.json()) as { amount: number };
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 422 });
  }
  const order = await createRazorpayOrder(amount);
  return NextResponse.json({ order });
}
