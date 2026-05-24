import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  THEME_COLORS,
  STANDARD_COLORS,
  QUICK_COLORS,
} from "../../config/colors";
import { getRecentColors, addRecentColor } from "../../utils/localStorage";
import ColorSwatch from "../UI/ColorSwatch";

const ColorPicker = ({
  type = "text",
  currentColor,
  onColorChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentColors, setRecentColors] = useState([]);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const nativeInputRef = useRef(null);

  const isText = type === "text";

  useEffect(() => {
    if (isOpen) {
      setRecentColors(getRecentColors());
    }
  }, [isOpen]);

  // Calculate panel position from trigger button
  const openPanel = useCallback(() => {
    if (disabled) return;
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setIsOpen(true);
  }, [disabled]);

  const closePanel = useCallback(() => setIsOpen(false), []);

  const togglePanel = useCallback(() => {
    if (isOpen) closePanel();
    else openPanel();
  }, [isOpen, openPanel, closePanel]);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e) => {
      const insideTrigger = triggerRef.current?.contains(e.target);
      const insidePanel = panelRef.current?.contains(e.target);
      if (!insideTrigger && !insidePanel) closePanel();
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, closePanel]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        closePanel();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, closePanel]);

  const handleColorSelect = useCallback(
    (hex) => {
      onColorChange(hex);
      const updated = addRecentColor(hex);
      setRecentColors(updated);
      closePanel();
    },
    [onColorChange, closePanel],
  );

  const handleMoreColors = () => {
    nativeInputRef.current?.click();
  };

  const handleNativeColorChange = (e) => {
    const hex = e.target.value;
    handleColorSelect(hex);
  };

  const displayColor = currentColor || (isText ? "#000000" : "#FFFF00");

  const ariaLabel = isText
    ? `Text color: ${currentColor || "default"}. Click to open color picker`
    : `Highlight color: ${currentColor || "none"}. Click to open color picker`;

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={togglePanel}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-disabled={disabled}
        className=" toolbar-btn flex-col gap-0.5 relative disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span
          className="text-sm font-bold leading-none text-text-primary"
          aria-hidden="true"
        >
          A
        </span>

        <span
          className="w-4 h-1 rounded-full"
          style={{
            backgroundColor: displayColor,
            border:
              displayColor.toUpperCase() === "#FFFFFF"
                ? "1px solid var(--border-input)"
                : "none",
          }}
          aria-hidden="true"
        />

        {!isText && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-status-warning border border-editor"
            aria-hidden="true"
            title="Highlight color"
          />
        )}
      </button>

      <input
        ref={nativeInputRef}
        type="color"
        value={currentColor || (isText ? "#000000" : "#ffff00")}
        onChange={handleNativeColorChange}
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        aria-hidden="true"
        tabIndex={-1}
      />

      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={isText ? "Text color picker" : "Highlight color picker"}
            aria-modal="false"
            className=" fixed z-99999 rounded-xl border border-border-toolbar shadow-modal bg-modal p-3"
            style={{
              top: panelPos.top,
              left: panelPos.left,
              minWidth: "220px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                onColorChange(null);
                closePanel();
              }}
              className="
              w-full flex items-center gap-2 px-2 py-1.5
              rounded-md text-xs text-text-primary
              hover:bg-accent-secondary
              transition-colors duration-100
              mb-2
            "
              aria-label={isText ? "Remove text color" : "Remove highlight"}
            >
              <span
                className="w-5 h-5 rounded-sm border border-border-input flex items-center justify-center text-status-danger text-[10px] font-bold"
                aria-hidden="true"
              >
                ✕
              </span>
              <span>{isText ? "No Color" : "No Highlight"}</span>
            </button>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1.5 px-0.5">
              Theme Colors
            </p>
            <div className="flex gap-1 mb-3 px-0.5">
              {THEME_COLORS.map((color) => (
                <ColorSwatch
                  key={color.hex}
                  hex={color.hex}
                  name={color.name}
                  onClick={handleColorSelect}
                  isActive={
                    currentColor?.toUpperCase() === color.hex.toUpperCase()
                  }
                  size={18}
                />
              ))}
            </div>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1.5 px-0.5">
              Standard Colors
            </p>
            <div
              className="grid gap-0.5 mb-3 px-0.5"
              style={{ gridTemplateColumns: "repeat(10, 1fr)" }}
              role="group"
              aria-label="Standard color grid"
            >
              {STANDARD_COLORS.map((hex) => (
                <ColorSwatch
                  key={hex}
                  hex={hex}
                  name={hex}
                  onClick={handleColorSelect}
                  isActive={currentColor?.toUpperCase() === hex.toUpperCase()}
                  size={18}
                />
              ))}
            </div>

            <div className="flex gap-1 mb-3 px-0.5">
              {QUICK_COLORS.map((color) => (
                <ColorSwatch
                  key={color.hex}
                  hex={color.hex}
                  name={color.name}
                  onClick={handleColorSelect}
                  isActive={
                    currentColor?.toUpperCase() === color.hex.toUpperCase()
                  }
                  size={18}
                />
              ))}
            </div>

            {recentColors.length > 0 && (
              <>
                <div
                  className="h-px bg-border-toolbar mb-2"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-1.5 px-0.5">
                  Recent Colors
                </p>
                <div className="flex gap-1 mb-2 px-0.5">
                  {recentColors.map((hex) => (
                    <ColorSwatch
                      key={hex}
                      hex={hex}
                      name={hex}
                      onClick={handleColorSelect}
                      isActive={
                        currentColor?.toUpperCase() === hex.toUpperCase()
                      }
                      size={18}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ── More colors button ───────────────────────── */}
            <div className="h-px bg-border-toolbar mb-2" aria-hidden="true" />
            <button
              type="button"
              onClick={handleMoreColors}
              className=" w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-accent-primary hover:bg-accent-secondary transition-colors duration-100"
              aria-label="Open custom color picker"
            >
              <span aria-hidden="true">⊕</span>
              More Colors...
            </button>
          </div>,
          document.body,
        )}
    </>
  );
};

export default ColorPicker;
