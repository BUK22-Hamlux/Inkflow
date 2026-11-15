import { useRef } from "react";
import fonts from "../../config/fonts";
import Dropdown from "../UI/Dropdown";

const FontFamilySelector = ({
  currentFont,
  onFontChange,
  disabled = false,
}) => {
  const triggerRef = useRef(null);

  const activeFamily = (currentFont || "Inter")
    .split(",")[0]
    .replace(/["']/g, "")
    .trim()
    .toLowerCase();
  const activeFont =
    fonts.find(
      (font) =>
        font.value.split(",")[0].replace(/["']/g, "").trim().toLowerCase() ===
        activeFamily,
    ) || fonts[0];
  const displayLabel = activeFont.label;
  const sortedFonts = [...fonts].sort((a, b) => a.label.localeCompare(b.label));

  return (
    <Dropdown
      trigger={
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          aria-label={`Font family: ${displayLabel}. Click to change font`}
          aria-disabled={disabled}
          className="h-8 min-w-20 max-w-23 sm:max-w-40 px-2 flex items-center gap-1 rounded-md text-xs font-medium text-text-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 border border-transparent hover:border-border-input"
          style={{
            fontFamily: activeFont.value,
          }}
        >
          <span className="truncate flex-1 text-left">{displayLabel}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-text-muted"
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
      align="left"
      width="220px"
      disabled={disabled}
    >
      <div
        role="listbox"
        aria-label="Font family options"
        className="py-1 max-h-72 overflow-y-auto custom-scrollbar"
      >
        {sortedFonts.map((font) => (
          <button
            key={font.value}
            role="option"
            aria-selected={activeFont.value === font.value}
            type="button"
            onClick={() => onFontChange(font.value)}
            className=" w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-accent-secondary transition-colors duration-100 flex items-center justify-between gap-2"
            style={{ fontFamily: font.value }}
          >
            <span>{font.label}</span>
            {activeFont.value === font.value && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7L5.5 10.5L12 3.5"
                  stroke="var(--accent-primary)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        ))}
      </div>
    </Dropdown>
  );
};

export default FontFamilySelector;
