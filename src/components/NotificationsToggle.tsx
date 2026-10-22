"use client";

import { Bell, BellOff } from "lucide-react";
import Link from "next/link";
import { btnPrimary, btnSecondary, linkAccent } from "@/lib/ui";
import { useEffect, useState, useTransition } from "react";
import {
  removePushSubscription,
  savePushSubscription,
  sendTestNotification,
} from "@/app/actions";

type State = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function isIosBrowserTab() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return ios && !standalone;
}

// Jump straight to the most likely section of the help page.
function helpAnchor() {
  if (typeof navigator === "undefined") return "";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "#iphone";
  if (/Android/.test(ua)) return "#android";
  if (/Macintosh/.test(ua)) return "#mac";
  if (/Windows/.test(ua)) return "#windows";
  return "";
}

export function NotificationsToggle({ publicKey }: { publicKey: string }) {
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setState(isIosBrowserTab() ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.getSubscription();
      setState(sub ? "on" : "off");
    })().catch(() => setState("unsupported"));
  }, []);

  const enable = () =>
    startTransition(async () => {
      setMessage(null);
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await savePushSubscription(sub.toJSON());
      setState("on");
    });

  const disable = () =>
    startTransition(async () => {
      setMessage(null);
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    });

  const test = () =>
    startTransition(async () => {
      const delivered = await sendTestNotification();
      setMessage(delivered ? "Test sent! It should pop up in a few seconds. If it doesn't, see the help link below." : "Couldn't send. Try turning notifications off and on again.");
    });

  return (
    <div className="space-y-3 rounded-3xl bg-surface p-5">
      {state === "loading" && <p className="text-sm text-muted">Checking this device…</p>}

      {state === "unsupported" && (
        <p className="text-sm text-muted">
          This browser doesn&apos;t support notifications. Try Chrome, Edge, Firefox, or Safari on a
          computer or Android phone.
        </p>
      )}

      {state === "ios-install" && (
        <div className="space-y-1 text-sm text-muted">
          <p className="font-medium text-fg">On iPhone, add TourTix to your Home Screen first:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Tap the Share button in Safari.</li>
            <li>Tap &ldquo;Add to Home Screen&rdquo;.</li>
            <li>Open TourTix from your Home Screen and come back to Settings.</li>
          </ol>
        </div>
      )}

      {state === "denied" && (
        <p className="text-sm text-muted">
          Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then
          reload this page.
        </p>
      )}

      {state === "off" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex flex-1 basis-48 items-center gap-2 text-sm">
            <BellOff size={18} aria-hidden className="text-muted" />
            <span>Notifications are <strong>off</strong> on this device.</span>
          </p>
          <button type="button" onClick={enable} disabled={pending} className={btnPrimary}>
            Turn on notifications
          </button>
        </div>
      )}

      {state === "on" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex flex-1 basis-48 items-center gap-2 text-sm">
            <Bell size={18} aria-hidden className="text-live" />
            <span>Notifications are <strong className="text-live">on</strong> on this device.</span>
          </p>
          <button type="button" onClick={test} disabled={pending} className={btnSecondary}>
            Send test
          </button>
          <button type="button" onClick={disable} disabled={pending} className={btnSecondary}>
            Turn off
          </button>
        </div>
      )}

      {message && <p className="text-sm text-muted">{message}</p>}

      {(state === "on" || state === "denied") && (
        <p className="text-sm">
          <Link href={`/help/notifications${helpAnchor()}`} className={linkAccent}>
            Not seeing notifications? Here&apos;s how to fix it
          </Link>
        </p>
      )}
    </div>
  );
}
