import { forwardRef } from "react";
import Tooltip from "../UI/Tooltip";

import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Minus,
  RemoveFormatting,
} from "lucide-react";

const iconRegistry = {
  Undo: Undo2,
  Redo: Redo2,
  Bold: Bold,
  Italic: Italic,
  Underline: Underline,
  Strikethrough: Strikethrough,
  Subscript: Subscript,
  Superscript: Superscript,
  AlignLeft: AlignLeft,
  AlignCenter: AlignCenter,
  AlignRight: AlignRight,
  AlignJustify: AlignJustify,
  List: List,
  ListOrdered: ListOrdered,
  Link: Link,
  Image: Image,
  HorizontalRule: Minus,
  ClearFormatting: RemoveFormatting,
};

const ToolbarButton = forwardRef(
  (
    {
      icon,
      label,
      isActive = false,
      isDisabled = false,
      onClick,
      shortcut,
      size = 18,
    },
    ref,
  ) => {
    const IconComponent = iconRegistry[icon];

    const tooltipLabel = shortcut ? `${label} (${shortcut})` : label;

    return (
      <Tooltip label={tooltipLabel} position="top" delay={200}>
        <button
          ref={ref}
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          aria-label={label}
          aria-pressed={isActive}
          aria-disabled={isDisabled}
          className={`
          toolbar-btn
          ${isActive ? "active" : ""}
        `}
        >
          {IconComponent ? (
            <IconComponent
              size={size}
              aria-hidden="true"
              focusable="false"
              strokeWidth={2}
            />
          ) : (
            <span className="text-xs font-bold" aria-hidden="true">
              {label?.charAt(0) ?? "?"}
            </span>
          )}
        </button>
      </Tooltip>
    );
  },
);

ToolbarButton.displayName = "ToolbarButton";

export default ToolbarButton;
