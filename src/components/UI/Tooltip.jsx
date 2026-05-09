import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const Tooltip = ({ label, children, delay = 200, disabled = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const timerRef = useRef(null);
  const triggerRef = useRef(null);

  const showTooltip = useCallback(() => {
    if (disabled || !label) return;

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      // Calculate coordinates: Center of the button, above it
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }

    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }, [disabled, label, delay]);

  const hideTooltip = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex items-center justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      {isVisible &&
        label &&
        createPortal(
          <div
            role="tooltip"
            aria-live="polite"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
            className="fixed bg-dropdown text-text-primary shadow-md z-100000 pointer-events-none whitespace-nowrap px-2.5 py-1.5 rounded-lg text-xs font-medium border border-border-toolbar"
          >
            {label}
            <div
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-dropdown"
            />
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Tooltip;
