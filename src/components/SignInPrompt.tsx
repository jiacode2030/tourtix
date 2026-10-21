import { signIn } from "@/auth";

export function SignInPrompt({ label, redirectTo = "/" }: { label: string; redirectTo?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo });
      }}
      className="inline-block"
    >
      <button
        type="submit"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        {label}
      </button>
    </form>
  );
}
