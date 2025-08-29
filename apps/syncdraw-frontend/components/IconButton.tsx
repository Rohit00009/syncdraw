import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  active = false,
}: {
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center 
        rounded-lg p-2
        border transition-all duration-200
        active:scale-95
        ${
          active
            ? "bg-green-600 border-green-500 text-white"
            : "bg-neutral-900 border-neutral-700 text-white/90 hover:bg-neutral-800 hover:border-green-500"
        }`}
    >
      {icon}
    </button>
  );
}
