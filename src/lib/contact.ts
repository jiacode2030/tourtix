export const REASONS = {
  general: "General question or feedback",
  removal: "Content removal request",
  privacy: "Privacy or data request",
  bug: "Something's broken",
  data: "Wrong or missing show info",
} as const;

export type Reason = keyof typeof REASONS;

export const reasonLabel = (key: string) => REASONS[key as Reason] ?? key;
