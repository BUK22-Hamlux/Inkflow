import React from "react";
import Dropdown from "../UI/Dropdown";
import paragraphStyles from "../../config/paragraph";

const ParagraphStyleSelector = ({
  currentParagraphStyle,
  onParagraphStyleChange,
  disable = false,
}) => {
  return (
    <Dropdown
      trigger={
        <button
          type="button"
          aria-label={`Paragraph style: ${currentParagraphStyle}. Click to change`}
          className="h-8 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium text-text-primary hover:bg-accent-secondary transition-all duration-100 border border-transparent hover:border-border-input min-w-32"
        >
          <span className="truncate flex-1 text-left">
            {currentParagraphStyle}
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
      width="180px"
      disabled={disable}
    >
      <div role="listbox" className="py-1">
        {paragraphStyles.map((style) => {
          const isSelected = currentParagraphStyle === style.label;

          return (
            <button
              key={style.label}
              role="option"
              aria-selected={isSelected}
              type="button"
              onClick={() => onParagraphStyleChange(style)}
              className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-accent-secondary flex items-center justify-between gap-2"
            >
              <span
                style={{
                  fontSize:
                    style.label === "Heading 1"
                      ? "18px"
                      : style.label === "Heading 2"
                        ? "15px"
                        : "13px",
                  fontWeight: style.label.startsWith("Heading") ? "600" : "400",
                }}
              >
                {style.label}
              </span>
              {isSelected && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
          );
        })}
      </div>
    </Dropdown>
  );
};

export default ParagraphStyleSelector;
