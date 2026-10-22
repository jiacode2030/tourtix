// Shared button styles so every page uses the same few, consistent buttons.
export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cta px-5 text-[15px] font-semibold text-on-cta transition hover:opacity-90 active:scale-[0.97] disabled:opacity-60";
export const btnSecondary =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 text-[15px] font-semibold text-fg transition hover:bg-surface active:scale-[0.97] disabled:opacity-60";
export const linkAccent = "font-medium text-accent hover:underline";
// Soft "stage lights" backdrop for artists without a photo.
export const STAGE_LIGHTS =
  "radial-gradient(ellipse at 30% 20%, rgba(255,214,140,.9), transparent 35%), radial-gradient(ellipse at 75% 15%, rgba(120,160,255,.85), transparent 35%), radial-gradient(ellipse at 55% 75%, rgba(255,90,140,.5), transparent 45%), linear-gradient(180deg,#1b1b2b,#0b0b12)";
export const chip = "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition";
export const chipOn = "bg-cta text-on-cta";
export const chipOff = "bg-surface text-fg hover:bg-surface-2";
export const card = "rounded-3xl bg-surface p-5 sm:p-6";
export const input =
  "min-h-11 w-full rounded-xl border border-line bg-bg px-4 text-[15px] text-fg placeholder:text-muted focus:border-accent focus:outline-none";
