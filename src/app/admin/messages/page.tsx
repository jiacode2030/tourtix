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
        <h1 className="text-3xl font-bold">Contact messages</h1>
        <p className="text-sm text-zinc-500">
          Only you can see this page. Content removal requests must be handled within 24 hours.
          Turn on notifications in Settings to get alerted when a message arrives.
        </p>
      </div>
      {messages.length === 0 && <p className="text-zinc-500">No messages yet.</p>}
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className={`font-semibold ${m.reason === "removal" ? "text-rose-600" : ""}`}>
                {reasonLabel(m.reason)}
              </span>
              <span className="text-zinc-500">{m.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })} ET</span>
            </div>
            <p className="whitespace-pre-wrap">{m.message}</p>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-zinc-500">
                {m.email ? (
                  <a href={`mailto:${m.email}`} className="text-violet-600 hover:underline">
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
                <button type="submit" className="text-rose-600 hover:underline">
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
