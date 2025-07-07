import { FC } from "react";

type IconType = "plus" | "note";
type ColorType = "green" | "red";

type QuickAccessButtonProps = {
  title: string;
  icon: IconType;
  color: ColorType;
  onClick?: () => void;
  subtitle?: string;
};

const icons: Record<IconType, React.ReactElement> = {
  plus: (
    <svg
      width="60"
      height="60"
      viewBox="0 0 73 73"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M36.1125 2.95984L36.1126 70.0398"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M69.6492 36.5032L2.56914 36.5032"
        stroke="white"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  ),
  note: (
    <svg
      width="35"
      height="35"
      viewBox="0 0 41 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.6759 3.51929L10.4512 3.51929C9.57495 3.51929 8.73457 3.86739 8.11495 4.487C7.49534 5.10662 7.14724 5.947 7.14724 6.82327L7.14724 33.2551C7.14724 34.1314 7.49534 34.9718 8.11495 35.5914C8.73457 36.211 9.57495 36.5591 10.4512 36.5591L30.2751 36.5591C31.1514 36.5591 31.9917 36.211 32.6114 35.5914C33.231 34.9718 33.5791 34.1314 33.5791 33.2551L33.5791 21.0304M3.84326 10.1272L10.4512 10.1272M3.84326 16.7352L10.4512 16.7352M3.84326 23.3432L10.4512 23.3432M3.84326 29.9511L10.4512 29.9511M35.8555 9.5094C36.5136 8.85133 36.8833 7.95878 36.8833 7.02812C36.8833 6.09745 36.5136 5.20491 35.8555 4.54683C35.1974 3.88875 34.3049 3.51904 33.3742 3.51904C32.4436 3.51904 31.551 3.88875 30.8929 4.54683L22.6165 12.8266C22.2237 13.2191 21.9362 13.7044 21.7806 14.2374L20.3979 18.9786C20.3564 19.1208 20.3539 19.2714 20.3907 19.4149C20.4274 19.5583 20.502 19.6892 20.6067 19.794C20.7114 19.8987 20.8424 19.9733 20.9858 20.01C21.1293 20.0468 21.2799 20.0443 21.4221 20.0028L26.1633 18.6201C26.6963 18.4645 27.1815 18.177 27.5741 17.7842L35.8555 9.5094Z"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const circleColors: Record<ColorType, string> = {
  green: "bg-khp-primary",
  red: "bg-khp-error",
};

export const QuickAccessButton: FC<QuickAccessButtonProps> = ({
  title,
  icon,
  color,
  onClick,
  subtitle,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col justify-between items-center p-2 w-36 h-36 sm:w-44 sm:h-44 border border-khp-primary/30 rounded-md hover:shadow-md transition"
    >
      <span className="text-center text-xs sm:text-sm font-medium text-gray-800">
        {title}
      </span>

      <div className="flex-1 flex items-center justify-center">
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full ${circleColors[color]}`}
        >
          {icons[icon]}
        </div>
      </div>

      {subtitle && (
        <p className="text-[8px] sm:text-[10px] text-center text-gray-500 mt-2">
          {subtitle}
        </p>
      )}
    </button>
  );
};
