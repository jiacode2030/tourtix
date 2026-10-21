import { SignInButton } from "@clerk/nextjs";

export function SignInPrompt({ label }: { label: string }) {
  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
      >
        {label}
      </button>
    </SignInButton>
  );
}
