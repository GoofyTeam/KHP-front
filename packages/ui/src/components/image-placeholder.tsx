import { Image } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

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
      className={cn(
        "aspect-square border border-khp-primary/20 rounded-lg flex flex-col items-center justify-center bg-muted/20",
        className
      )}
    >
      <Image className="text-khp-primary/60" strokeWidth={1} size={iconSize} />
      <p className="text-khp-primary font-light text-sm mt-2">{text}</p>
    </div>
  );
}

export function ImageAdd({
  className = "",
  iconSize = 48,
  text = "Add a picture",
  onClick,
}: {
  className?: string;
  iconSize?: number;
  text?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "aspect-square h-34 w-34 border border-khp-primary rounded-lg flex flex-col items-center justify-center my-4 cursor-pointer hover:bg-khp-primary/10",
        className
      )}
      onClick={onClick}
    >
      <Image className="text-khp-primary" strokeWidth={1} size={iconSize} />
      <p className="text-khp-primary font-light">{text}</p>
    </div>
  );
}
