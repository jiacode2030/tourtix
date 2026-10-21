export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form action="/" method="get" className="flex w-full gap-2">
      <input
        name="q"
        defaultValue={defaultValue}
        placeholder="Search an artist, e.g. Calvin Harris"
        aria-label="Search artists"
        className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-violet-900"
      />
      <button
        type="submit"
        className="rounded-lg bg-violet-600 px-5 py-3 font-medium text-white hover:bg-violet-700"
      >
        Search
      </button>
    </form>
  );
}
