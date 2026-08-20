"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { getOccasion } from "@/config/occasions";
import { EDITABLE_FIELDS } from "@/lib/editPolicy";
import { Button } from "@/components/ui/Button";
import { trackMetaEvent } from "@/lib/metaPixel";

interface ManageGift {
  id: string;
  occasion: string;
  recipientName: string;
  pinHint: string | null;
  theme: string;
  giftWrap: string;
  status: string;
  paymentStatus: string;
  giftToken: string;
  createdAt: string;
  expiresAt: string | null;
  sections: Record<string, Record<string, unknown>>;
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
 * Guest gift-management screen (spec section 6). Reached only via the
 * secure `manage_token` link shown once on the success page — there is no
 * login here by design, so this page must never expose more than the
 * whitelisted editable fields (lib/editPolicy.ts) or the secret PIN.
 */
export default function ManageGiftPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [gift, setGift] = useState<ManageGift | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [giftUrl, setGiftUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    fetch(`/api/manage/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setGift(data.gift);
      })
      .catch(() => setNotFound(true));
  }, [token]);

  useEffect(() => {
    if (!gift) return;
    const url = `${window.location.origin}/gift/${gift.giftToken}`;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on window, unavailable during SSR/initial render.
    setGiftUrl(url);
    QRCode.toDataURL(url, { margin: 1, width: 240 }).then(setQrDataUrl);

    // Best-effort Purchase signal: this manual-payment flow has no
    // automatic payment callback (see pay-manual's top comment), so the
    // manage page going "active" is the closest confirmed proxy we have.
    // Guarded by a localStorage flag per gift so repeat visits to an
    // already-active gift don't refire it.
    if (gift.status === "active") {
      const key = `dg_purchase_fired_${gift.id}`;
      try {
        if (!window.localStorage.getItem(key)) {
          trackMetaEvent("Purchase", { value: 199, currency: "INR", content_name: gift.occasion });
          window.localStorage.setItem(key, "1");
        }
      } catch {
        // Storage unavailable — fire once for this render; acceptable rare over-count.
        trackMetaEvent("Purchase", { value: 199, currency: "INR", content_name: gift.occasion });
      }
    }
  }, [gift]);

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-black/60">This management link isn&apos;t valid. Please check the link you were given.</p>
      </main>
    );
  }

  if (!gift) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-black/40">Loading your gift…</p>
      </main>
    );
  }

  const occasionDef = getOccasion(gift.occasion);
  const status = STATUS_LABEL[gift.status] ?? STATUS_LABEL.draft;
  const editableSections = Object.keys(EDITABLE_FIELDS).filter((sectionId) => gift.sections[sectionId]);

  function fieldValue(sectionId: string, fieldId: string): string {
    const draftValue = drafts[sectionId]?.[fieldId];
    if (draftValue !== undefined) return draftValue;
    const raw = gift!.sections[sectionId]?.[fieldId];
    return typeof raw === "string" ? raw : raw != null ? JSON.stringify(raw) : "";
  }

  function setField(sectionId: string, fieldId: string, value: string) {
    setDrafts((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], [fieldId]: value } }));
  }

  function copyLink() {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function saveEdits() {
    const edits = Object.entries(drafts).flatMap(([sectionId, fields]) =>
      Object.entries(fields).map(([fieldId, value]) => ({ sectionId, fieldId, value }))
    );
    if (edits.length === 0) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`/api/manage/${token}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't save your changes.");
      setSaveMessage(`Saved ${data.applied.length} change${data.applied.length === 1 ? "" : "s"}.`);
      setDrafts({});
      const refreshed = await fetch(`/api/manage/${token}`).then((r) => r.json());
      setGift(refreshed.gift);
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function duplicateAndPay() {
    setDuplicating(true);
    try {
      const res = await fetch(`/api/manage/${token}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't duplicate this gift.");
      router.push(
        `/duplicate/${data.giftId}?amount=${data.amount}&token=${data.giftToken}&manage=${data.manageToken}&occasion=${data.occasion}`
      );
    } catch (e) {
      setSaveMessage(e instanceof Error ? e.message : "Something went wrong.");
      setDuplicating(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-lg px-6 py-16">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#E85C7B]">Manage Your Gift</p>
      <div className="mt-2 flex items-center gap-3">
        <h1 className="font-display text-2xl font-semibold text-[#241A17]">
          {occasionDef?.title ?? gift.occasion} for {gift.recipientName}
        </h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>
      <p className="mt-1 text-xs text-black/40">
        Created {new Date(gift.createdAt).toLocaleDateString()} · {daysLeft(gift.expiresAt)} · {gift.views} view
        {gift.views === 1 ? "" : "s"}
      </p>

      {gift.status === "active" && (
        <>
          <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/70 break-all">
            {giftUrl}
          </div>
          <div className="mt-4 flex items-center gap-4">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Gift QR code" className="h-28 w-28 rounded-xl border border-black/10" />
            )}
            <div className="flex flex-1 flex-col gap-2">
              <Button variant="secondary" onClick={copyLink}>
                {copied ? "Copied!" : "Copy Gift Link"}
              </Button>
              <Link href={`/gift/${gift.giftToken}`}>
                <Button variant="secondary" className="w-full">
                  Preview Gift
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}

      {gift.status === "pending_payment" && (
        <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Awaiting payment confirmation. If you&apos;ve already paid and sent us your reference code, your gift will
          go live shortly — check back on this page and it&apos;ll show your link automatically. If you haven&apos;t
          paid yet, go back to the payment step to finish that first.
        </p>
      )}

      {editableSections.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold text-[#241A17]">Make a small correction</h2>
          <p className="mt-1 text-xs text-black/45">
            You can fix typos in text like names and messages here. Theme, wrap, and game changes require creating a
            new gift below.
          </p>
          <div className="mt-4 space-y-5">
            {editableSections.map((sectionId) => (
              <div key={sectionId} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-black/40">{sectionId}</p>
                <div className="mt-2 space-y-3">
                  {EDITABLE_FIELDS[sectionId].map((fieldId) => (
                    <label key={fieldId} className="block">
                      <span className="mb-1 block text-xs font-medium text-black/60">{fieldId}</span>
                      <textarea
                        value={fieldValue(sectionId, fieldId)}
                        onChange={(e) => setField(sectionId, fieldId, e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#E85C7B]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {saveMessage && <p className="mt-3 text-xs text-black/60">{saveMessage}</p>}
          <div className="mt-4">
            <Button onClick={saveEdits} disabled={saving || Object.keys(drafts).length === 0}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10 rounded-2xl border border-dashed border-black/15 p-5">
        <h2 className="font-display text-lg font-semibold text-[#241A17]">Want to change the theme, wrap or game?</h2>
        <p className="mt-1 text-sm text-black/55">
          Duplicate this gift&apos;s content into a new one you can fully customize — a fresh payment activates it.
        </p>
        <div className="mt-4">
          <Button variant="secondary" onClick={duplicateAndPay} disabled={duplicating}>
            {duplicating ? "Duplicating..." : "Create New Gift From This"}
          </Button>
        </div>
      </div>

      <Link href="/create" className="mt-8 block text-center text-xs text-black/40 underline">
        Start a brand new gift
      </Link>
    </main>
  );
}
