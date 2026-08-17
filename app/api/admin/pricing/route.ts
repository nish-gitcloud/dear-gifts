import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";
import { listPricingItems, upsertPricingItem } from "@/lib/pricingRepo";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return NextResponse.json({ items: await listPricingItems() });
}

/** Updates one catalog item's price and/or active state (spec section 9's admin pricing editor). */
export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { category, itemKey, price, isActive } = (await request.json()) as {
    category: string;
    itemKey: string;
    price: number;
    isActive: boolean;
  };
  if (!category || !itemKey || typeof price !== "number" || price < 0) {
    return NextResponse.json({ error: "Invalid pricing update." }, { status: 422 });
  }
  await upsertPricingItem(category, itemKey, price, isActive);
  return NextResponse.json({ ok: true });
}
