import { Plus, Share2, Stamp } from "lucide-react";

// Shown on an empty passport: what it is, in three steps.
export function PassportHowItWorks() {
  const steps = [
    {
      Icon: Plus,
      title: "Add a concert",
      text: "Type the artist, pick the date, and add the city or venue if you like.",
    },
    {
      Icon: Stamp,
      title: "Get a stamp",
      text: "Every concert becomes a stamp. Watch your totals grow.",
    },
    {
      Icon: Share2,
      title: "Share if you want",
      text: "Make a picture of your passport and choose what it shows. Or keep it to yourself.",
    },
  ];
  return (
    <section
      className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6"
      aria-label="How the passport works"
    >
      <h2 className="text-xl font-bold tracking-tight">How it works</h2>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map(({ Icon, title, text }, i) => (
          <li key={title} className="flex gap-3 sm:flex-col">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon size={20} aria-hidden />
            </span>
            <span>
              <span className="block font-semibold">{`${i + 1}. ${title}`}</span>
              <span className="block text-sm text-muted">{text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted">
        Start with the last concert you went to. It&apos;s all private to you.
      </p>
    </section>
  );
}
