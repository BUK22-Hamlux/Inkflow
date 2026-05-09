import { useState, useRef } from "react";
import fontSizes from "../../config/fontSizes";

const FontSizeSelector = ({ currentSize, onSizeChange, disabled = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentSize ?? "14");
  const inputRef = useRef(null);

  const handleIncrement = () => {
    const current = parseInt(currentSize ?? "14", 10);
    const nextSize = fontSizes.find((size) => size > current);
    if (nextSize) {
      onSizeChange(String(nextSize));
    }
  };

  const handleDecrement = () => {
    const current = parseInt(currentSize ?? "14", 10);
    const prevSize = fontSizes.findLast((size) => size < current);
    if (prevSize) {
      onSizeChange(String(prevSize));
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputCommit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 8 && parsed <= 144) {
      onSizeChange(String(parsed));
    } else {
      setInputValue(currentSize ?? "14");
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputCommit();
    }
    if (e.key === "Escape") {
      setInputValue(currentSize ?? "14");
      setIsEditing(false);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(currentSize ?? "14");
    setTimeout(() => inputRef.current?.select(), 0);
  };

  return (
    <div
      className=" flex items-center h-8 rounded-md border border-transparent hover:border-border-input transition-all duration-100 overflow-hidden"
      role="group"
      aria-label="Font size control"
    >
      {/* Decrement button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled}
        aria-label="Decrease font size"
        className=" w-6 h-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 text-base leading-none shrink-0"
      >
        −
      </button>

      {/* Size input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={isEditing ? inputValue : (currentSize ?? "14")}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputCommit}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        aria-label={`Font size: ${currentSize ?? "14"} points`}
        className=" w-9 h-full text-center text-xs font-medium text-text-primary bg-transparent border-none outline-none disabled:opacity-40 disabled:cursor-not-allowed"
      />

      {/* Increment button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled}
        aria-label="Increase font size"
        className=" w-6 h-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-accent-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-100 text-base leading-none shrink-0"
      >
        +
      </button>
    </div>
  );
};

export default FontSizeSelector;
