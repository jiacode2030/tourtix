import type { Show } from "./types";

export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Same show on two sites = same date and same city.
export const showKey = (s: Pick<Show, "date" | "city">) =>
  `${s.date}|${normalize(s.city ?? "")}`;
