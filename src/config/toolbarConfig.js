const toolbarConfig = [
  {
    group: "history",
    items: [
      {
        id: "undo",
        label: "Undo",
        icon: "MdUndo",
        action: "undo",
        type: "button",
      },
      {
        id: "redo",
        label: "Redo",
        icon: "MdRedo",
        action: "redo",
        type: "button",
      },
    ],
  },
  {
    group: "format",
    items: [
      {
        id: "bold",
        label: "Bold",
        icon: "MdFormatBold",
        action: "bold",
        type: "toggle",
      },
      {
        id: "italic",
        label: "Italic",
        icon: "MdFormatItalic",
        action: "italic",
        type: "toggle",
      },
      {
        id: "underline",
        label: "Underline",
        icon: "MdFormatUnderlined",
        action: "underline",
        type: "toggle",
      },
      {
        id: "strike",
        label: "Strikethrough",
        icon: "MdStrikethroughS",
        action: "strike",
        type: "toggle",
      },
      {
        id: "subscript",
        label: "Subscript",
        icon: "MdSubscript",
        action: "subscript",
        type: "toggle",
      },
      {
        id: "superscript",
        label: "Superscript",
        icon: "MdSuperscript",
        action: "superscript",
        type: "toggle",
      },
    ],
  },
  {
    group: "alignment",
    items: [
      {
        id: "alignLeft",
        label: "Align Left",
        icon: "MdFormatAlignLeft",
        action: "alignLeft",
        type: "toggle",
      },
      {
        id: "alignCenter",
        label: "Align Center",
        icon: "MdFormatAlignCenter",
        action: "alignCenter",
        type: "toggle",
      },
      {
        id: "alignRight",
        label: "Align Right",
        icon: "MdFormatAlignRight",
        action: "alignRight",
        type: "toggle",
      },
      {
        id: "alignJustify",
        label: "Justify",
        icon: "MdFormatAlignJustify",
        action: "alignJustify",
        type: "toggle",
      },
    ],
  },
  {
    group: "lists",
    items: [
      {
        id: "bulletList",
        label: "Bullet List",
        icon: "MdFormatListBulleted",
        action: "bulletList",
        type: "toggle",
      },
      {
        id: "orderedList",
        label: "Numbered List",
        icon: "MdFormatListNumbered",
        action: "orderedList",
        type: "toggle",
      },
    ],
  },
  {
    group: "insert",
    items: [
      {
        id: "link",
        label: "Insert Link",
        icon: "MdLink",
        action: "link",
        type: "button",
      },
      {
        id: "image",
        label: "Insert Image",
        icon: "MdImage",
        action: "image",
        type: "button",
      },
      {
        id: "horizontalRule",
        label: "Horizontal Rule",
        icon: "MdHorizontalRule",
        action: "horizontalRule",
        type: "button",
      },
    ],
  },
  {
    group: "extras",
    items: [
      {
        id: "clearFormatting",
        label: "Clear Formatting",
        icon: "MdFormatClear",
        action: "clearFormatting",
        type: "button",
      },
    ],
  },
];

export default toolbarConfig;
