import { Image } from "lucide-react";

interface ImagePlaceholderProps {
  className?: string;
  iconSize?: number;
  text?: string;
}

export function ImagePlaceholder({
  className = "",
  iconSize = 48,
  text = "No image",
}: ImagePlaceholderProps) {
  return (
    <div
      className={`aspect-square border border-khp-primary/20 rounded-lg flex flex-col items-center justify-center bg-muted/20 ${className}`}
    >
      <Image className="text-khp-primary/60" strokeWidth={1} size={iconSize} />
      <p className="text-khp-primary/60 font-light text-sm mt-2">{text}</p>
    </div>
  );
}
