import { useState, useRef, useEffect, useCallback, cloneElement } from "react";
import { createPortal } from "react-dom";

const Dropdown = ({
  trigger,
  children,
  align = "left",
  width = "auto",
  disabled = false,
  onOpen,
  onClose,
  closeOnPanelClick = true,
  open,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const requestedWidth = typeof width === "number" ? width : Number.parseFloat(width) || 280;
    const availableWidth = Math.max(160, window.innerWidth - 16);
    const panelWidth = Math.min(requestedWidth, availableWidth);
    const preferredLeft = align === "right" ? rect.right - panelWidth : rect.left;
    setPosition({
      top: Math.max(8, Math.min(rect.bottom + 6, window.innerHeight - 80)),
      left: Math.max(8, Math.min(preferredLeft, window.innerWidth - panelWidth - 8)),
    });
  }, [align, width]);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    updatePosition();
    if (open === undefined) setInternalOpen(true);
    onOpen?.();
  }, [disabled, onOpen, open, updatePosition]);

  const closeDropdown = useCallback(() => {
    if (open === undefined) setInternalOpen(false);
    onClose?.();
  }, [onClose, open]);

  const toggleDropdown = useCallback(() => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }, [isOpen, openDropdown, closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      const clickedInsideTrigger = containerRef.current?.contains(e.target);
      const clickedInsidePanel = panelRef.current?.contains(e.target);
      if (!clickedInsideTrigger && !clickedInsidePanel) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeDropdown();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDropdown]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, updatePosition]);

  const panelWidth = width === "auto"
    ? "min(320px, calc(100vw - 16px))"
    : `min(${typeof width === "number" ? `${width}px` : width}, calc(100vw - 16px))`;

  return (
    <div ref={containerRef} className="relative inline-flex">
      {cloneElement(trigger, {
        ref: triggerRef,
        onClick: toggleDropdown,
        "aria-expanded": isOpen,
        "aria-haspopup": "listbox",
      })}

      {/* Portal — renders directly into document.body */}
      {isOpen &&
        createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-orientation="vertical"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: panelWidth,
              maxHeight: `calc(100dvh - ${position.top}px - 8px)`,
            }}
            className="fixed min-w-0 bg-dropdown shadow-modal border border-border-toolbar rounded-[10px] z-99999 overflow-y-auto overscroll-contain"
            onClick={(event) => {
              if (!closeOnPanelClick || !event.target.closest('[role="menuitem"]')) return;
              closeDropdown();
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
