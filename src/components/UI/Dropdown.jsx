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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const openDropdown = useCallback(() => {
    if (disabled) return;

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left:
          align === "right"
            ? rect.right + window.scrollX
            : rect.left + window.scrollX,
      });
    }

    setIsOpen(true);
    onOpen?.();
  }, [disabled, onOpen, align]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

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

  // Recalculate position on scroll or resize while open
  useEffect(() => {
    if (!isOpen) return;

    const recalculate = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 6,
          left:
            align === "right"
              ? rect.right + window.scrollX
              : rect.left + window.scrollX,
        });
      }
    };

    window.addEventListener("scroll", recalculate, true);
    window.addEventListener("resize", recalculate);

    return () => {
      window.removeEventListener("scroll", recalculate, true);
      window.removeEventListener("resize", recalculate);
    };
  }, [isOpen, align]);

  const panelWidth =
    width === "auto"
      ? "auto"
      : typeof width === "number"
        ? `${width}px`
        : width;

  // Alignment offset
  const leftOffset =
    align === "right"
      ? `calc(${position.left}px - ${panelWidth})`
      : `${position.left}px`;

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
              left: leftOffset,
              width: panelWidth,
            }}
            className="absolute min-w-40 bg-dropdown shadow-modal border border-border-toolbar rounded-[10px] z-99999 overflow-hidden"
            onClick={closeDropdown}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
