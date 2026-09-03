import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

const MAX_ROWS = 10;
const MAX_COLS = 10;
const PANEL_WIDTH = 256;

const TablePicker = ({ onInsert, onOpen, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState(0);
  const [hoverCol, setHoverCol] = useState(0);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const openPanel = useCallback(() => {
    if (disabled) return;
    onOpen?.(); // close any open menu first
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 6,
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8),
        ),
      });
    }
    setIsOpen(true);
  }, [disabled, onOpen]);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setHoverRow(0);
    setHoverCol(0);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !panelRef.current?.contains(e.target)
      ) {
        closePanel();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, closePanel]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, closePanel]);

  const handleInsert = (rows, cols) => {
    onInsert(rows, cols);
    closePanel();
  };

  return (
    <>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openPanel}
        disabled={disabled}
        aria-label="Insert table — choose rows and columns"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="
          h-7 px-2.5 flex items-center gap-1.5
          rounded-md text-xs font-medium
          text-text-primary
          hover:bg-accent-secondary
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-100
          border border-transparent hover:border-border-input
        "
      >
        Table
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 3L5 7L9 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Grid picker panel */}
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Table size picker"
            className="fixed z-99999 w-[min(256px,calc(100vw-16px))] bg-modal border border-border-toolbar rounded-xl shadow-modal p-3"
            style={{ top: panelPos.top, left: panelPos.left }}
          >
            {/* Label showing current selection */}
            <p className="text-xs text-center text-text-secondary mb-2 font-medium">
              {hoverRow > 0 && hoverCol > 0
                ? `${hoverRow} × ${hoverCol} table`
                : "Select table size"}
            </p>

            {/* Grid */}
            <div
              className="grid gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))`,
              }}
              aria-label="Table size grid"
              role="group"
            >
              {Array.from({ length: MAX_ROWS }, (_, r) =>
                Array.from({ length: MAX_COLS }, (_, c) => {
                  const row = r + 1;
                  const col = c + 1;
                  const isHighlighted = row <= hoverRow && col <= hoverCol;

                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      onMouseEnter={() => {
                        setHoverRow(row);
                        setHoverCol(col);
                      }}
                      onClick={() => handleInsert(row, col)}
                      aria-label={`Insert ${row} by ${col} table`}
                      className="
                      aspect-square rounded-sm
                      border transition-all duration-75
                    "
                      style={{
                        backgroundColor: isHighlighted
                          ? "var(--accent-primary)"
                          : "var(--accent-secondary)",
                        borderColor: isHighlighted
                          ? "var(--accent-primary-hover)"
                          : "var(--border-input)",
                      }}
                    />
                  );
                }),
              )}
            </div>

            {/* Quick preset buttons */}
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {[
                [2, 2],
                [3, 3],
                [4, 4],
                [3, 5],
                [5, 3],
              ].map(([r, c]) => (
                <button
                  key={`${r}x${c}`}
                  type="button"
                  onClick={() => handleInsert(r, c)}
                  className="
                  px-2 py-1 rounded-md text-[10px] font-medium
                  bg-accent-secondary text-text-primary
                  hover:bg-accent-primary hover:text-text-on-accent
                  transition-all duration-100
                "
                  aria-label={`Insert ${r} by ${c} table`}
                >
                  {r}×{c}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default TablePicker;
