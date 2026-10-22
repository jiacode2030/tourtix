import { signIn } from "@/auth";
import { btnPrimary } from "@/lib/ui";

export function SignInPrompt({
  label,
  redirectTo = "/",
  icon,
}: {
  label: string;
  redirectTo?: string;
  icon?: React.ReactNode;
}) {
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
        className={btnPrimary}
      >
        {icon}
        {label}
      </button>
    </form>
  );
}
