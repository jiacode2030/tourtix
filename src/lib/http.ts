// Fetch helper for the ticket APIs: caps concurrent requests per server
// instance and retries rate-limit (429) and brief server errors with backoff,
// so a page that loads many artists at once doesn't trip the APIs' limits.

const MAX_CONCURRENT = 2;
let active = 0;
const waiting: (() => void)[] = [];

async function acquire() {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
}

function release() {
  const next = waiting.shift();
  if (next) next();
  else active--;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function apiFetch(url: string, revalidateSeconds: number, label: string) {
  await acquire();
  try {
    for (let attempt = 0; ; attempt++) {
      const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
      const retryable = res.status === 429 || res.status >= 500;
      if (res.ok || !retryable || attempt === 2) {
        if (!res.ok) throw new Error(`${label} ${res.status}`);
        return res.json();
      }
      await sleep(1000 * 2 ** attempt);
    }
  } finally {
    release();
  }
}
