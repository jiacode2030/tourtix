"use client";

import Link from "next/link";
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

const button =
  "rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60";
const primary = `${button} bg-violet-600 text-white hover:bg-violet-700`;
const secondary = `${button} border border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800`;

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
    <div className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      {state === "loading" && <p className="text-sm text-zinc-600 dark:text-zinc-400">Checking this device…</p>}

      {state === "unsupported" && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          This browser doesn&apos;t support notifications. Try Chrome, Edge, Firefox, or Safari on a
          computer or Android phone.
        </p>
      )}

      {state === "ios-install" && (
        <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">On iPhone, add TourTix to your Home Screen first:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Tap the Share button in Safari.</li>
            <li>Tap &ldquo;Add to Home Screen&rdquo;.</li>
            <li>Open TourTix from your Home Screen and come back to Settings.</li>
          </ol>
        </div>
      )}

      {state === "denied" && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Notifications are blocked for this site. Allow them in your browser&apos;s site settings, then
          reload this page.
        </p>
      )}

      {state === "off" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm">Notifications are <strong>off</strong> on this device.</p>
          <button type="button" onClick={enable} disabled={pending} className={primary}>
            Turn on notifications
          </button>
        </div>
      )}

      {state === "on" && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm">
            Notifications are <strong className="text-emerald-600">on</strong> on this device.
          </p>
          <button type="button" onClick={test} disabled={pending} className={secondary}>
            Send test
          </button>
          <button type="button" onClick={disable} disabled={pending} className={secondary}>
            Turn off
          </button>
        </div>
      )}

      {message && <p className="text-sm text-zinc-600 dark:text-zinc-400">{message}</p>}

      {(state === "on" || state === "denied") && (
        <p className="text-sm">
          <Link href={`/help/notifications${helpAnchor()}`} className="text-violet-600 hover:underline">
            Not seeing notifications? Here&apos;s how to fix it →
          </Link>
        </p>
      )}
    </div>
  );
}
