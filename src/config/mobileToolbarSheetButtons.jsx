import {
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
  Undo2,
  Redo2,
  Image,
  Link,
  Minus,
  RemoveFormatting,
} from "lucide-react";

const MobileToolbarSheetButtons = [
  {
    label: "Format",
    tools: [
      { id: "bold", icon: Bold, label: "Bold", action: "bold", isToggle: true },
      {
        id: "italic",
        icon: Italic,
        label: "Italic",
        action: "italic",
        isToggle: true,
      },
      {
        id: "underline",
        icon: Underline,
        label: "Underline",
        action: "underline",
        isToggle: true,
      },
      {
        id: "strike",
        icon: Strikethrough,
        label: "Strike",
        action: "strike",
        isToggle: true,
      },
      {
        id: "subscript",
        icon: Subscript,
        label: "Sub",
        action: "subscript",
        isToggle: true,
      },
      {
        id: "superscript",
        icon: Superscript,
        label: "Super",
        action: "superscript",
        isToggle: true,
      },
      {
        id: "clearFormatting",
        icon: RemoveFormatting,
        label: "Clear",
        action: "clearFormatting",
        isToggle: false,
      },
    ],
  },
  {
    label: "Alignment",
    tools: [
      {
        id: "alignLeft",
        icon: AlignLeft,
        label: "Left",
        action: "alignLeft",
        isToggle: true,
      },
      {
        id: "alignCenter",
        icon: AlignCenter,
        label: "Center",
        action: "alignCenter",
        isToggle: true,
      },
      {
        id: "alignRight",
        icon: AlignRight,
        label: "Right",
        action: "alignRight",
        isToggle: true,
      },
      {
        id: "alignJustify",
        icon: AlignJustify,
        label: "Justify",
        action: "alignJustify",
        isToggle: true,
      },
    ],
  },
  {
    label: "Lists",
    tools: [
      {
        id: "bulletList",
        icon: List,
        label: "Bullets",
        action: "bulletList",
        isToggle: true,
      },
      {
        id: "orderedList",
        icon: ListOrdered,
        label: "Numbered",
        action: "orderedList",
        isToggle: true,
      },
    ],
  },
  {
    label: "Insert",
    tools: [
      {
        id: "link",
        icon: Link,
        label: "Link",
        action: "link",
        isToggle: false,
      },
      {
        id: "image",
        icon: Image,
        label: "Image",
        action: "image",
        isToggle: false,
      },
      {
        id: "horizontalRule",
        icon: Minus,
        label: "Rule",
        action: "horizontalRule",
        isToggle: false,
      },
    ],
  },
  {
    label: "History",
    tools: [
      {
        id: "undo",
        icon: Undo2,
        label: "Undo",
        action: "undo",
        isToggle: false,
      },
      {
        id: "redo",
        icon: Redo2,
        label: "Redo",
        action: "redo",
        isToggle: false,
      },
    ],
  },
];

export default MobileToolbarSheetButtons;
