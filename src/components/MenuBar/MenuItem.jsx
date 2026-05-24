import { useRef } from "react";
import Dropdown from "../UI/Dropdown";

const MenuItem = ({ label, children, isOpen, disabled, onToggle }) => {
  const triggerRef = useRef(null);
  return (
    <Dropdown
      trigger={
        <button
          ref={triggerRef}
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={`${label} menu. Click to ${isOpen ? "close" : "open"}.`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className={` h-7 px-2.5 flex items-center rounded-md text-xs font-medium transition-all duration-100
            ${isOpen ? "bg-accent-secondary text-accent-primary" : "text-text-secondary hover:text-text-primary hover:bg-accent-secondary"}
            ${disabled ? "opacity-40 cursor-not-allowed" : ""}
          `}
        >
          {label}
        </button>
      }
      align="left"
      width="200px"
      disabled={disabled}
    >
      <div role="menu" aria-label={`${label} menu options`} className="py-1">
        {children}
      </div>
    </Dropdown>
  );
};

export default MenuItem;
