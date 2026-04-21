import { useRef } from "react";

const ColorPicker = ({
  type = "text",
  currentColor,
  onColorChange,
  disabled = false,
}) => {
  const inputRef = useRef(null);

  const isText = type === "text";

  const label = isText
    ? `Text color: ${currentColor || "default"}. Click to change`
    : `Highlight color: ${currentColor || "none"}. Click to change`;

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    onColorChange(e.target.value);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
        aria-disabled={disabled}
        className="
          toolbar-btn
          flex-col gap-0.5
          disabled:opacity-40 disabled:cursor-not-allowed
        "
      >
        <span
          className="text-sm font-bold leading-none"
          style={{
            color: isText
              ? currentColor || "var(--text-primary)"
              : "var(--text-primary)",
          }}
          aria-hidden="true"
        >
          {isText ? "A" : "A"}
        </span>

        {/* Color swatch bar below the letter */}
        <span
          className="w-4 h-1 rounded-full"
          style={{
            backgroundColor: isText
              ? currentColor || "var(--accent-primary)"
              : currentColor || "var(--status-warning)",
          }}
          aria-hidden="true"
        />
      </button>

      {/* Hidden native color input */}
      <input
        ref={inputRef}
        type="color"
        value={currentColor || (isText ? "#000000" : "#ffff00")}
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
        className="
          absolute opacity-0
          w-0 h-0 pointer-events-none
        "
      />
    </div>
  );
};

export default ColorPicker;
