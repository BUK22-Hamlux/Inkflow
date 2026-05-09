import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const MenuItem = ({ label, children, isOpen, onToggle, onClose }) => {
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });

  // Calculate panel position from trigger's real screen position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  }, []);

  // Recalculate whenever menu opens
  useEffect(() => {
    if (isOpen) calculatePosition();
  }, [isOpen, calculatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e) => {
      const insideTrigger = triggerRef.current?.contains(e.target);
      const insidePanel = panelRef.current?.contains(e.target);
      if (!insideTrigger && !insidePanel) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      {/* Menu label button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`
          h-7 px-2.5
          flex items-center
          rounded-md
          text-xs font-medium
          transition-all duration-100
          ${
            isOpen
              ? "bg-accent-secondary text-accent-primary"
              : "text-text-secondary hover:text-text-primary hover:bg-accent-secondary"
          }
        `}
      >
        {label}
      </button>

      {/* Dropdown panel — rendered in document.body via portal */}
      {isOpen &&
        children &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            aria-label={`${label} menu`}
            className="
            fixed z-99999
            min-w-48
            rounded-xl
            border border-border-toolbar
            overflow-hidden
            py-1
          "
            style={{
              top: panelPos.top,
              left: panelPos.left,
              backgroundColor: "var(--bg-dropdown)",
              boxShadow: "var(--shadow-modal)",
            }}
            onClick={onClose}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default MenuItem;
