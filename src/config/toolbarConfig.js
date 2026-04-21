const toolbarConfig = [
  {
    group: "history",
    items: [
      {
        id: "undo",
        label: "Undo",
        icon: "Undo",
        action: "undo",
        type: "button",
      },
      {
        id: "redo",
        label: "Redo",
        icon: "Redo",
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
        icon: "Bold",
        action: "bold",
        type: "toggle",
      },
      {
        id: "italic",
        label: "Italic",
        icon: "Italic",
        action: "italic",
        type: "toggle",
      },
      {
        id: "underline",
        label: "Underline",
        icon: "Underline",
        action: "underline",
        type: "toggle",
      },
      {
        id: "strike",
        label: "Strikethrough",
        icon: "Strikethrough",
        action: "strike",
        type: "toggle",
      },
      {
        id: "subscript",
        label: "Subscript",
        icon: "Subscript",
        action: "subscript",
        type: "toggle",
      },
      {
        id: "superscript",
        label: "Superscript",
        icon: "Superscript",
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
        icon: "AlignLeft",
        action: "alignLeft",
        type: "toggle",
      },
      {
        id: "alignCenter",
        label: "Align Center",
        icon: "AlignCenter",
        action: "alignCenter",
        type: "toggle",
      },
      {
        id: "alignRight",
        label: "Align Right",
        icon: "AlignRight",
        action: "alignRight",
        type: "toggle",
      },
      {
        id: "alignJustify",
        label: "Justify",
        icon: "AlignJustify",
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
        icon: "List",
        action: "bulletList",
        type: "toggle",
      },
      {
        id: "orderedList",
        label: "Numbered List",
        icon: "ListOrdered",
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
        icon: "Link",
        action: "link",
        type: "button",
      },
      {
        id: "image",
        label: "Insert Image",
        icon: "Image",
        action: "image",
        type: "button",
      },
      {
        id: "horizontalRule",
        label: "Horizontal Rule",
        icon: "HorizontalRule",
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
        icon: "ClearFormatting",
        action: "clearFormatting",
        type: "button",
      },
    ],
  },
];

export default toolbarConfig;
