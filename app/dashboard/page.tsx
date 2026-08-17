"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getOccasion } from "@/config/occasions";
import { Button } from "@/components/ui/Button";

interface CreatorGift {
  id: string;
  occasion: string;
  recipientName: string;
  theme: string;
  status: string;
  paymentStatus: string;
  giftToken: string;
  manageToken: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Awaiting payment", className: "bg-amber-50 text-amber-700" },
  active: { label: "Live", className: "bg-emerald-50 text-emerald-700" },
  expired: { label: "Expired", className: "bg-black/5 text-black/50" },
  archived: { label: "Archived", className: "bg-black/5 text-black/50" },
  draft: { label: "Draft", className: "bg-black/5 text-black/50" },
};

function daysLeft(expiresAt: string | null): string {
  if (!expiresAt) return "—";
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.ceil(ms / 86_400_000);
  return `${days} day${days === 1 ? "" : "s"} left`;
}

/**
 * "My Gifts" creator dashboard (spec section 6). Real implementation on top
 * of Supabase Auth: signed-in creators see every gift tied to their
 * account; guests (or anyone on a deployment without Supabase configured)
 * are pointed at the per-gift management link from their success screen
 * instead, since there's no account to list gifts against.
 */
export default function DashboardPage() {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();
  const [gifts, setGifts] = useState<CreatorGift[] | null>(null);
  const [manageLinkInput, setManageLinkInput] = useState("");

  useEffect(() => {
    if (!user) return;
    fetch("/api/dashboard/gifts")
      .then((res) => res.json())
      .then((data) => setGifts(data.gifts ?? []));
  }, [user]);

  function goToManageLink() {
    const trimmed = manageLinkInput.trim();
    if (!trimmed) return;
    const token = trimmed.includes("/manage/") ? trimmed.split("/manage/")[1] : trimmed;
    router.push(`/manage/${token}`);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-black/40">Loading…</p>
      </main>
    );
  }

  if (!isConfigured || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFAF7] px-6 text-center">
        <span className="text-4xl">🎁</span>
        <h1 className="font-display mt-4 text-xl font-semibold text-[#241A17]">My Gifts</h1>
        {isConfigured ? (
          <>
            <p className="mt-2 max-w-sm text-sm text-black/55">
              Sign in to see every gift tied to your account, with edit and duplicate tools in one place.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/auth/login?redirect=/dashboard">
                <Button>Log In</Button>
              </Link>
              <Link href="/auth/signup?redirect=/dashboard">
                <Button variant="secondary">Create Account</Button>
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-2 max-w-sm text-sm text-black/55">
            Accounts aren&apos;t configured on this deployment yet — every gift is managed as a guest via the
            private link shown right after payment.
          </p>
        )}

        <div className="mt-10 w-full max-w-sm rounded-2xl bg-white p-5 text-left shadow-sm">
          <p className="text-sm font-medium text-[#241A17]">Have a management link or code?</p>
          <div className="mt-3 flex gap-2">
            <input
              value={manageLinkInput}
              onChange={(e) => setManageLinkInput(e.target.value)}
              placeholder="Paste your management link"
              className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E85C7B]"
            />
            <Button variant="secondary" onClick={goToManageLink}>
              Go
            </Button>
          </div>
        </div>

        <Link href="/create" className="mt-8 text-sm font-medium text-[#E85C7B] underline">
          Create a gift
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-[#241A17]">My Gifts</h1>
        <Link href="/create">
          <Button>Create New Gift</Button>
        </Link>
      </div>

      {gifts === null && <p className="mt-8 text-sm text-black/40">Loading your gifts…</p>}

      {gifts !== null && gifts.length === 0 && (
        <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
          <span className="text-3xl">🎁</span>
          <p className="mt-3 text-sm text-black/55">You haven&apos;t created a gift yet.</p>
          <Link href="/create" className="mt-4 inline-block">
            <Button>Create Your First Gift</Button>
          </Link>
        </div>
      )}

      {gifts !== null && gifts.length > 0 && (
        <div className="mt-8 space-y-4">
          {gifts.map((gift) => {
            const occasionDef = getOccasion(gift.occasion);
            const status = STATUS_LABEL[gift.status] ?? STATUS_LABEL.draft;
            return (
              <div key={gift.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-[#241A17]">
                      {occasionDef?.title ?? gift.occasion} for {gift.recipientName}
                    </p>
                    <p className="mt-0.5 text-xs text-black/40">
                      Created {new Date(gift.createdAt).toLocaleDateString()} · {daysLeft(gift.expiresAt)} ·{" "}
                      {gift.views} view{gift.views === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/manage/${gift.manageToken}`}>
                    <Button variant="secondary">Manage</Button>
                  </Link>
                  {gift.status === "active" && (
                    <Link href={`/gift/${gift.giftToken}`}>
                      <Button variant="secondary">View Gift</Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
