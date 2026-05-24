import { Check } from "lucide-react";

export const MenuAction = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  hasSub = false,
  isChecked = false,
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    disabled={disabled}
    aria-disabled={disabled}
    aria-haspopup={hasSub ? "menu" : undefined}
    aria-checked={isChecked ? "true" : undefined}
    className={` w-full px-3 py-1.5 flex items-center gap-2.5 text-xs text-left transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed
      ${
        disabled
          ? "text-text-muted"
          : "text-text-primary hover:bg-accent-secondary hover:text-accent-primary"
      }
    `}
  >
    <span className="w-3.5 shrink-0 flex items-center justify-center">
      {isChecked ? (
        <Check size={12} aria-hidden="true" className="text-accent-primary" />
      ) : Icon ? (
        <Icon size={13} aria-hidden="true" className="text-text-secondary" />
      ) : null}
    </span>

    <span className="flex-1">{label}</span>

    {shortcut && (
      <span className="text-text-muted text-[10px] ml-4 shrink-0">
        {shortcut}
      </span>
    )}
    {hasSub && (
      <ChevronRight
        size={11}
        aria-hidden="true"
        className="text-text-muted shrink-0"
      />
    )}
  </button>
);

export const MenuSeparator = () => (
  <div
    className="my-1 mx-2 h-px bg-border-toolbar"
    role="separator"
    aria-hidden="true"
  />
);
