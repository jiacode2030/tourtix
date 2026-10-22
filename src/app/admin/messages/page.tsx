import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteContactMessage, listContactMessages } from "@/app/contact/actions";
import { reasonLabel } from "@/lib/contact";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function AdminMessagesPage() {
  const messages = await listContactMessages();
  if (!messages) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact messages</h1>
        <p className="text-sm text-muted">
          Only you can see this page. Content removal requests must be handled within 24 hours.
          Turn on notifications in Settings to get alerted when a message arrives.
        </p>
      </div>
      {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="space-y-2 rounded-3xl bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={`font-semibold ${m.reason === "removal" ? "text-red-600 dark:text-red-400" : ""}`}>
                {reasonLabel(m.reason)}
              </span>
              <span className="text-muted">{m.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })} ET</span>
            </div>
            <p className="whitespace-pre-wrap">{m.message}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted">
                {m.email ? (
                  <a href={`mailto:${m.email}`} className="font-medium text-accent hover:underline">
                    Reply to {m.email}
                  </a>
                ) : (
                  "No email left"
                )}
              </span>
              <form
                action={async () => {
                  "use server";
                  await deleteContactMessage(m.id);
                }}
              >
                <button type="submit" className="text-red-600 dark:text-red-400 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
