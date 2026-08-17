"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { trackEvent } from "@/lib/analyticsClient";
import { Button } from "@/components/ui/Button";

/** Success screen — gift link, QR, share (spec sections 32 & 33). */
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams<{ occasion: string }>();
  const token = searchParams.get("token");
  const manageToken = searchParams.get("manage");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [manageCopied, setManageCopied] = useState(false);
  const [giftUrl, setGiftUrl] = useState("");
  const [manageUrl, setManageUrl] = useState("");

  useEffect(() => {
    if (!token) return;
    trackEvent("payment_completed", { occasion: params.occasion });
    // window.location is only available client-side, so the real URL can't
    // be derived during the server-rendered pass — this effect is the
    // earliest safe place to read it and kick off QR generation.
    const url = `${window.location.origin}/gift/${token}`;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- depends on window, unavailable during SSR/initial render.
    setGiftUrl(url);
    QRCode.toDataURL(url, { margin: 1, width: 320 }).then(setQrDataUrl);
    if (manageToken) {
      setManageUrl(`${window.location.origin}/manage/${manageToken}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, manageToken]);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-black/60">No gift found. Please create one from the start.</p>
      </main>
    );
  }

  function copyLink() {
    navigator.clipboard.writeText(giftUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copyManageLink() {
    navigator.clipboard.writeText(manageUrl);
    setManageCopied(true);
    setTimeout(() => setManageCopied(false), 1500);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <span className="text-5xl">🎉</span>
      <h1 className="font-display mt-4 text-2xl font-semibold text-[#241A17]">Your surprise is ready.</h1>
      <p className="mt-2 text-sm text-black/55">
        {manageToken
          ? "It's live and ready to share — save the management link below to edit it later."
          : "Your gift has been saved to your Dear Gifts account."}
      </p>

      <div className="mt-6 w-full rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/70 break-all">
        {giftUrl}
      </div>

      {qrDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={qrDataUrl} alt="Gift QR code" className="mt-6 h-40 w-40 rounded-xl border border-black/10" />
      )}

      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        <Button variant="secondary" onClick={copyLink}>
          {copied ? "Copied!" : "Copy Gift Link"}
        </Button>
        {qrDataUrl && (
          <a href={qrDataUrl} download={`dear-gifts-${token}.png`}>
            <Button variant="secondary" className="w-full">
              Download QR
            </Button>
          </a>
        )}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <Button
            variant="secondary"
            onClick={() => navigator.share?.({ title: "A surprise for you", url: giftUrl })}
          >
            Share
          </Button>
        )}
        <Link href={`/gift/${token}`}>
          <Button className="w-full">Open Gift</Button>
        </Link>
      </div>

      {manageToken ? (
        <div className="mt-10 w-full rounded-2xl border border-dashed border-black/15 p-5 text-left">
          <h2 className="font-display text-base font-semibold text-[#241A17]">Save your management link</h2>
          <p className="mt-1 text-sm text-black/55">
            You created this as a guest, so this private link is the only way to edit details or duplicate this gift
            later — it&apos;s not shown anywhere else. Create a free account instead to see all your gifts in one
            place.
          </p>
          <div className="mt-3 rounded-xl bg-white p-3 text-xs text-black/60 break-all">{manageUrl}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={copyManageLink}>
              {manageCopied ? "Copied!" : "Copy Management Link"}
            </Button>
            <Link href={`/auth/signup?redirect=/dashboard`}>
              <Button className="w-full">Create Free Account</Button>
            </Link>
          </div>
        </div>
      ) : (
        <Link href="/dashboard" className="mt-8 text-xs text-black/40 underline">
          Go to My Gifts
        </Link>
      )}
    </main>
  );
}
