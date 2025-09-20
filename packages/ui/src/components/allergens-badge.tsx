import { Badge, BadgeProps } from "@workspace/ui/components/badge";
import { getAllergenLabel } from "@workspace/ui/lib/allergens";
import {
  Bean,
  Egg,
  Fish,
  Milk,
  Nut,
  OctagonAlert,
  Shrimp,
  Wheat,
} from "lucide-react";
import { ReactElement } from "react";

type Allergen =
  | "gluten"
  | "fruits_a_coque"
  | "crustaces"
  | "celeri"
  | "oeufs"
  | "moutarde"
  | "poisson"
  | "soja"
  | "lait"
  | "sulfites"
  | "sesame"
  | "lupin"
  | "arachides"
  | "mollusques";

function pickLogo(allergenName: Allergen): ReactElement {
  switch (allergenName) {
    case "gluten":
      return <Wheat className="h-4 w-4" />;
    case "fruits_a_coque":
      return <Nut className="h-4 w-4" />;
    case "crustaces":
      return <Shrimp className="h-4 w-4" />;
    case "celeri":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône céleri"
          role="img"
          className="h-4 w-4"
        >
          <path d="M8 5c-.8-1.1-2.4-1.2-3.2 0 .7.9 1.8 1.6 3.2 1.8M12 4c-.6-1.3-2.2-1.6-3.2-.6.3 1.1 1.2 2.1 2.7 2.6M16 5c.8-1.1 2.4-1.2 3.2 0-.7.9-1.8 1.6-3.2 1.8" />
          <path d="M9 7c.6-.9 1.7-1.4 3-1.4s2.4.5 3 1.4" />
          <rect x="5.5" y="9" width="3.2" height="10" rx="1.2" />
          <rect x="10.4" y="8.5" width="3.2" height="10.5" rx="1.2" />
          <rect x="15.3" y="9" width="3.2" height="10" rx="1.2" />
          <path d="M7.1 9c1.3-1.3 3-2 4.9-2s3.6.7 4.9 2" />
          <path d="M7.1 19.5h9.4" />
        </svg>
      );
    case "oeufs":
      return <Egg className="h-4 w-4" />;
    case "moutarde":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène moutarde"
          role="img"
          className="h-4 w-4"
        >
          <path d="M12 3c2.5 2 4 5.5 4 9s-1.5 7-4 9c-2.5-2-4-5.5-4-9s1.5-7 4-9z" />
          <circle cx="12" cy="12" r="1.2" />
          <circle cx="10" cy="15" r="1" />
          <circle cx="14" cy="15" r="1" />
        </svg>
      );
    case "poisson":
      return <Fish className="h-4 w-4" />;
    case "soja":
      return <Bean className="h-4 w-4" />;
    case "lait":
      return <Milk className="h-4 w-4" />;
    case "sulfites":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène sulfites (verre)"
          role="img"
          className="h-4 w-4"
        >
          <path d="M7 6h10" />
          <path d="M17 6c0 3.6-2.8 6.5-5 6.5S7 9.6 7 6" />
          <path d="M8.5 8.5c1 .8 2.5 1.2 3.5 1.2s2.5-.4 3.5-1.2" />
          <path d="M12 12.5V17" />
          <path d="M9.5 17.5h5" />
          <circle cx="5.8" cy="8" r="0.7" />
          <circle cx="18.4" cy="9.2" r="0.7" />
          <circle cx="6.7" cy="11" r="0.6" />
        </svg>
      );
    case "sesame":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène sésame"
          role="img"
          className="h-4 w-4"
        >
          <path d="M12 5c-2 2-3 5-3 7s1 5 3 7c2-2 3-5 3-7s-1-5-3-7z" />
        </svg>
      );
    case "lupin":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène lupin"
          role="img"
          className="h-4 w-4"
        >
          <circle cx="12" cy="6" r="1.6" />
          <circle cx="9" cy="10" r="1.4" />
          <circle cx="15" cy="10" r="1.4" />
          <circle cx="12" cy="14" r="1.6" />
          <path d="M12 16v4" />
        </svg>
      );
    case "arachides":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène arachides (peanut)"
          role="img"
          className="h-4 w-4"
        >
          <path d="M12 3c-2.5 0-4.5 2-4.5 4.5 0 1 .4 2 1 2.7.8.9.8 2.2 0 3.1-.6.7-1 1.7-1 2.7C7.5 18.5 9.5 21 12 21s4.5-2.5 4.5-5c0-1-.4-2-1-2.7-.8-.9-.8-2.2 0-3.1.6-.7 1-1.7 1-2.7 0-2.5-2-4.5-4.5-4.5z" />
          <path d="M12 5v14" />
        </svg>
      );
    case "mollusques":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label="Icône allergène mollusques"
          role="img"
          className="h-4 w-4"
        >
          <path d="M4 10c2-5 14-5 16 0-1 5-5 8-8 8s-7-3-8-8z" />
          <path d="M12 18V9" />
          <path d="M9.5 17.2l1.3-7.6" />
          <path d="M14.5 17.2l-1.3-7.6" />
          <path d="M7.5 15.6l2-6" />
          <path d="M16.5 15.6l-2-6" />
        </svg>
      );
    default:
      return <OctagonAlert className="h-4 w-4" />;
  }
}

export function AllegernsBadge({
  allergens,
  variant,
}: {
  allergens: Allergen;
  variant?: BadgeProps["variant"];
}) {
  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {pickLogo(allergens)} {getAllergenLabel(allergens)}
    </Badge>
  );
}

export function AllegernsBadgesList({
  allergens,
  variant,
}: {
  allergens: Allergen[];
  variant?: BadgeProps["variant"];
}) {
  if (!allergens || allergens.length === 0) {
    return <span>No allergens</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allergens.map((allergen) => (
        <AllegernsBadge key={allergen} allergens={allergen} variant={variant} />
      ))}
    </div>
  );
}
