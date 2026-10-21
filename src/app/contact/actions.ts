"use server";

import { desc, eq, gt, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentUserId } from "@/auth";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { adminUserId, currentAdminId } from "@/lib/admin";
import { REASONS, reasonLabel } from "@/lib/contact";
import { sendToUser } from "@/lib/push";

// Simple flood protection for a public form.
const MAX_MESSAGES_PER_HOUR = 30;

export async function sendContactMessage(formData: FormData) {
  // Bots tend to fill every field, including this hidden one.
  if (String(formData.get("website") ?? "")) redirect("/contact?sent=1");

  const reasonKey = String(formData.get("reason") ?? "general");
  const reason = reasonKey in REASONS ? reasonKey : "general";
  const message = String(formData.get("message") ?? "").trim().slice(0, 3000);
  const emailRaw = String(formData.get("email") ?? "").trim().slice(0, 200);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw) ? emailRaw : null;
  if (message.length < 5) redirect("/contact?error=short");

  const [{ count }] = await db()
    .select({ count: sql<number>`count(*)::int` })
    .from(contactMessages)
    .where(gt(contactMessages.createdAt, new Date(Date.now() - 60 * 60 * 1000)));
  if (count >= MAX_MESSAGES_PER_HOUR) redirect("/contact?error=busy");

  await db()
    .insert(contactMessages)
    .values({ reason, email, message, userId: await currentUserId() });

  const admin = await adminUserId();
  if (admin) {
    await sendToUser(admin, {
      title: `TourTix message: ${reasonLabel(reason)}`,
      body: message.slice(0, 140),
      url: "/admin/messages",
      tag: `contact-${Date.now()}`,
    }).catch((err) => console.error(err));
  }
  redirect("/contact?sent=1");
}

export async function deleteContactMessage(id: number) {
  if (!(await currentAdminId())) throw new Error("Not allowed");
  await db().delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function listContactMessages() {
  if (!(await currentAdminId())) return null;
  return db().select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
}
