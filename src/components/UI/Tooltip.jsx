import { useState, useRef, useCallback } from "react";

const Tooltip = ({
  label,
  children,
  position = "top",
  delay = 200,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);

  const showTooltip = useCallback(() => {
    if (disabled || !label) return;
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

  // Position styles map
  const positionStyles = {
    top: {
      bottom: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
    },
    bottom: {
      top: "calc(100% + 8px)",
      left: "50%",
      transform: "translateX(-50%)",
    },
    left: {
      right: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)",
    },
    right: {
      left: "calc(100% + 8px)",
      top: "50%",
      transform: "translateY(-50%)",
    },
  };

  // Arrow position styles map
  const arrowStyles = {
    top: {
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      borderColor: "var(--bg-dropdown) transparent transparent transparent",
    },
    bottom: {
      bottom: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      borderColor: "transparent transparent var(--bg-dropdown) transparent",
    },
    left: {
      left: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      borderColor: "transparent transparent transparent var(--bg-dropdown)",
    },
    right: {
      right: "100%",
      top: "50%",
      transform: "translateY(-50%)",
      borderColor: "transparent var(--bg-dropdown) transparent transparent",
    },
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {/* The wrapped element — whatever you pass as children */}
      {children}

      {/* Tooltip bubble */}
      {isVisible && label && (
        <div
          role="tooltip"
          aria-live="polite"
          style={{
            position: "absolute",
            ...positionStyles[position],
            backgroundColor: "var(--bg-dropdown)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-dropdown)",
            zIndex: 9999,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
          className="
            px-2.5 py-1.5
            rounded-lg
            text-xs font-medium
            border border-border-toolbar
            animate-fade-in
          "
        >
          {/* Tooltip text */}
          {label}

          {/* Arrow pointer */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              borderWidth: "5px",
              borderStyle: "solid",
              ...arrowStyles[position],
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
