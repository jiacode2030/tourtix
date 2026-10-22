export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl space-y-4 leading-relaxed [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Last updated {updated}</p>
      {children}
    </article>
  );
}
