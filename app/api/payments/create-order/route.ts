import { NextRequest, NextResponse } from "next/server";
import { createCashfreePaymentLink } from "@/services/cashfree";
import { env } from "@/lib/env";

/**
 * Creates a Cashfree Payment Link for the given gift and hands back the
 * hosted URL to redirect the browser to (see
 * app/create/[occasion]/summary/page.tsx). The return_url is built
 * server-side (not trusted from the client) so it always points back at
 * our own domain's payment-return page with exactly the params that page
 * needs to verify and activate the gift.
 */
export async function POST(request: NextRequest) {
  const { amount, giftId, customerPhone, customerName, occasionId, manageToken } = (await request.json()) as {
    amount: number;
    giftId: string;
    customerPhone: string;
    customerName?: string;
    occasionId: string;
    manageToken?: string;
  };
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 422 });
  }
  if (!giftId || !occasionId) {
    return NextResponse.json({ error: "Missing gift reference." }, { status: 422 });
  }
  try {
    const manageParam = manageToken ? `&manage=${encodeURIComponent(manageToken)}` : "";
    const returnUrl = `${env.app.url}/create/${occasionId}/payment-return?giftId=${encodeURIComponent(giftId)}${manageParam}`;
    const link = await createCashfreePaymentLink({
      giftId,
      amountRupees: amount,
      customerPhone: customerPhone ?? "",
      customerName,
      returnUrl,
    });
    return NextResponse.json({ link });
  } catch (err) {
    // An uncaught throw here would produce a bare 500 with no body at all,
    // which makes the client's `await res.json()` fail with a useless
    // "Unexpected end of JSON input" instead of the real reason. Logging
    // server-side + always returning JSON keeps the actual Cashfree failure
    // visible in Vercel's Logs tab.
    console.error("Cashfree create-payment-link failed:", err);
    return NextResponse.json({ error: "Could not start payment. Please try again in a moment." }, { status: 500 });
  }
}
