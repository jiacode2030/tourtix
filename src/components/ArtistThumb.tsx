import { STAGE_LIGHTS } from "@/lib/ui";

// Square artist photo, or a soft stage-lights backdrop with an initial.
export function ArtistThumb({ name, imageUrl, size = "h-12 w-12" }: { name: string; imageUrl: string | null | undefined; size?: string }) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white`}
      style={imageUrl ? undefined : { background: STAGE_LIGHTS }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0)
      )}
    </span>
  );
}
