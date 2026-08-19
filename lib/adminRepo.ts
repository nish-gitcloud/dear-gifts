import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  activateMockGift,
  getMockGiftById,
  listAllMockGifts,
  listMockPayments,
  recordMockPayment,
  type MockGift,
  type MockPayment,
} from "@/lib/mockStore";
import { getOccasion } from "@/config/occasions";
import { env } from "@/lib/env";

export interface OverviewStats {
  totalGifts: number;
  giftsToday: number;
  activeGifts: number;
  expiredGifts: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
  revenueToday: number;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Overview stats for the admin home screen (spec section 10). */
export async function getOverviewStats(): Promise<OverviewStats> {
  const todayStart = startOfToday();
  const admin = getSupabaseAdmin();

  if (admin) {
    const [{ count: totalGifts }, { count: activeGifts }, { count: expiredGifts }, { count: pendingPayments }, { data: gifts }, { data: payments }] =
      await Promise.all([
        admin.from("gifts").select("id", { count: "exact", head: true }),
        admin.from("gifts").select("id", { count: "exact", head: true }).eq("status", "active"),
        admin.from("gifts").select("id", { count: "exact", head: true }).eq("status", "expired"),
        admin.from("gifts").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
        admin.from("gifts").select("created_at"),
        admin.from("payments").select("amount, status, created_at"),
      ]);

    const giftsToday = (gifts ?? []).filter((g) => new Date(g.created_at) >= todayStart).length;
    const captured = (payments ?? []).filter((p) => p.status === "captured");
    const failedPayments = (payments ?? []).filter((p) => p.status === "failed").length;
    const totalRevenue = captured.reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueToday = captured
      .filter((p) => new Date(p.created_at) >= todayStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalGifts: totalGifts ?? 0,
      giftsToday,
      activeGifts: activeGifts ?? 0,
      expiredGifts: expiredGifts ?? 0,
      pendingPayments: pendingPayments ?? 0,
      failedPayments,
      totalRevenue,
      revenueToday,
    };
  }

  const gifts = listAllMockGifts();
  const payments = listMockPayments();
  const captured = payments.filter((p) => p.status === "captured");

  return {
    totalGifts: gifts.length,
    giftsToday: gifts.filter((g) => new Date(g.createdAt) >= todayStart).length,
    activeGifts: gifts.filter((g) => g.status === "active").length,
    expiredGifts: gifts.filter((g) => g.status === "expired").length,
    pendingPayments: gifts.filter((g) => g.status === "pending_payment").length,
    failedPayments: payments.filter((p) => p.status === "failed").length,
    totalRevenue: captured.reduce((sum, p) => sum + p.amount, 0),
    revenueToday: captured.filter((p) => new Date(p.createdAt) >= todayStart).reduce((sum, p) => sum + p.amount, 0),
  };
}

export interface AdminOrderRow {
  id: string;
  giftId: string;
  occasion: string;
  recipientName: string;
  orderId: string;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
}

/** Orders/payments table (spec section 10) — every captured or failed payment attempt, newest first. */
export async function listOrders(limit = 100): Promise<AdminOrderRow[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: payments } = await admin
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (!payments?.length) return [];
    const giftIds = [...new Set(payments.map((p) => p.gift_id))];
    const { data: gifts } = await admin.from("gifts").select("id, occasion, recipient_name").in("id", giftIds);
    const giftById = new Map((gifts ?? []).map((g) => [g.id, g]));
    return payments.map((p) => {
      const gift = giftById.get(p.gift_id);
      return {
        id: p.id,
        giftId: p.gift_id,
        occasion: gift?.occasion ?? "—",
        recipientName: gift?.recipient_name ?? "—",
        orderId: p.razorpay_order_id ?? "—",
        paymentId: p.razorpay_payment_id ?? "—",
        amount: Number(p.amount),
        status: p.status,
        createdAt: p.created_at,
      };
    });
  }

  const gifts = new Map(listAllMockGifts().map((g) => [g.id, g]));
  return listMockPayments()
    .slice(0, limit)
    .map((p: MockPayment) => {
      const gift = gifts.get(p.giftId);
      return {
        id: p.id,
        giftId: p.giftId,
        occasion: gift?.occasion ?? "—",
        recipientName: gift?.recipientName ?? "—",
        orderId: p.orderId,
        paymentId: p.paymentId,
        amount: p.amount,
        status: p.status,
        createdAt: p.createdAt,
      };
    });
}

export interface AdminGiftRow {
  id: string;
  occasion: string;
  occasionTitle: string;
  recipientName: string;
  status: string;
  paymentStatus: string;
  amount: number;
  giftToken: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

/** All gifts across every creator (spec section 10's Gifts table) — admin-only, never scoped by ownership. */
export async function listAllGiftsForAdmin(limit = 200): Promise<AdminGiftRow[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: gifts } = await admin.from("gifts").select("*").order("created_at", { ascending: false }).limit(limit);
    if (!gifts) return [];
    const { data: viewCounts } = await admin.from("gift_views").select("gift_id");
    const viewsByGift = new Map<string, number>();
    for (const v of viewCounts ?? []) viewsByGift.set(v.gift_id, (viewsByGift.get(v.gift_id) ?? 0) + 1);
    return gifts.map((g) => ({
      id: g.id,
      occasion: g.occasion,
      occasionTitle: getOccasion(g.occasion)?.title ?? g.occasion,
      recipientName: g.recipient_name,
      status: g.status,
      paymentStatus: g.payment_status,
      amount: Number(g.amount),
      giftToken: g.gift_token,
      createdAt: g.created_at,
      expiresAt: g.expires_at,
      views: viewsByGift.get(g.id) ?? 0,
    }));
  }

  return listAllMockGifts()
    .slice(0, limit)
    .map((g: MockGift) => ({
      id: g.id,
      occasion: g.occasion,
      occasionTitle: getOccasion(g.occasion)?.title ?? g.occasion,
      recipientName: g.recipientName,
      status: g.status,
      paymentStatus: g.paymentStatus,
      amount: g.amount,
      giftToken: g.giftToken,
      createdAt: g.createdAt,
      expiresAt: g.expiresAt,
      views: g.views,
    }));
}

/**
 * Manually activates a gift stuck in `pending_payment` — the admin-side
 * counterpart to /api/payments/verify, used only while payment collection
 * is going through the temporary manual-link flow (see
 * app/create/[occasion]/pay-manual's top comment). The admin has already
 * confirmed the customer's reference code matches a real payment received
 * on the static Cashfree Payment Link/Page before calling this — there's
 * no independent gateway check here the way the automatic flow has,
 * because there's no per-gift order/link id to check against.
 */
export async function activateGiftManually(giftId: string): Promise<{ giftToken: string } | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data: giftRow } = await admin.from("gifts").select("amount").eq("id", giftId).maybeSingle();
    if (!giftRow) return null;

    const expiresAt = new Date(Date.now() + env.app.giftExpiryDays * 86_400_000).toISOString();
    const { data: payment } = await admin
      .from("payments")
      .insert({
        gift_id: giftId,
        razorpay_order_id: "manual",
        razorpay_signature: "manually-activated",
        amount: giftRow.amount,
        status: "captured",
      })
      .select()
      .single();

    const { data: gift, error } = await admin
      .from("gifts")
      .update({
        status: "active",
        payment_status: "paid",
        payment_id: payment?.id ?? null,
        completed_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", giftId)
      .select("gift_token")
      .single();

    if (error || !gift) return null;
    return { giftToken: gift.gift_token };
  }

  const existing = getMockGiftById(giftId);
  if (!existing) return null;
  recordMockPayment({ giftId, orderId: "manual", paymentId: "manually-activated", amount: existing.amount, status: "captured" });
  const activated = activateMockGift(giftId, env.app.giftExpiryDays);
  return activated ? { giftToken: activated.giftToken } : null;
}

export interface AdminCustomerRow {
  id: string;
  email: string | null;
  giftCount: number;
  totalSpend: number;
  lastActivity: string;
}

/**
 * Customers table (spec section 10). Grouped by `creator_id` — guests (no
 * account) are rolled into a single "Guest checkouts" bucket rather than
 * listed individually, since there's no identity to key them by without an
 * account. Requires Supabase for real per-customer email lookups; mock mode
 * still reports meaningful aggregate numbers.
 */
export async function listCustomers(): Promise<AdminCustomerRow[]> {
  const admin = getSupabaseAdmin();
  const guestRow: AdminCustomerRow = { id: "guest", email: null, giftCount: 0, totalSpend: 0, lastActivity: "" };
  const byCreator = new Map<string, AdminCustomerRow>();

  function fold(creatorId: string | null, amount: number, createdAt: string) {
    const bucket = creatorId ? byCreator.get(creatorId) ?? { id: creatorId, email: null, giftCount: 0, totalSpend: 0, lastActivity: createdAt } : guestRow;
    bucket.giftCount += 1;
    bucket.totalSpend += amount;
    if (createdAt > bucket.lastActivity) bucket.lastActivity = createdAt;
    if (creatorId) byCreator.set(creatorId, bucket);
  }

  if (admin) {
    const { data: gifts } = await admin.from("gifts").select("creator_id, amount, created_at");
    for (const g of gifts ?? []) fold(g.creator_id, Number(g.amount), g.created_at);
    const creatorIds = [...byCreator.keys()];
    if (creatorIds.length) {
      const { data: users } = await admin.from("users").select("id, email").in("id", creatorIds);
      for (const u of users ?? []) {
        const bucket = byCreator.get(u.id);
        if (bucket) bucket.email = u.email;
      }
    }
  } else {
    for (const g of listAllMockGifts()) fold(g.creatorId, g.amount, g.createdAt);
  }

  const rows = [...byCreator.values()].sort((a, b) => (b.lastActivity > a.lastActivity ? 1 : -1));
  return guestRow.giftCount > 0 ? [...rows, guestRow] : rows;
}
