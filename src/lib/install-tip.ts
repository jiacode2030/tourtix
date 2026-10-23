// "Add to Home Screen" card for iPhone. iPhone only allows website alerts for
// sites on the Home Screen, so we nudge people who follow artists. Dismissing
// it hides it for 30 days; the choice lives only in this browser.
export const INSTALL_TIP_KEY = "tourtix-install-tip";
export const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;

export function isIos(userAgent: string, touchPoints = 0): boolean {
  // iPads in desktop mode report themselves as Macs but have a touch screen.
  return /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && touchPoints > 1);
}

export function showInstallTip(opts: { ios: boolean; standalone: boolean; dismissedAt: string | null; now?: number }): boolean {
  if (!opts.ios || opts.standalone) return false;
  const at = Number(opts.dismissedAt);
  if (opts.dismissedAt && Number.isFinite(at) && (opts.now ?? Date.now()) - at < SNOOZE_MS) return false;
  return true;
}
