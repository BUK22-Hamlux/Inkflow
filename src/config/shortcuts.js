const shortcuts = [
  {
    group: "Text Formatting",
    items: [
      { action: "Bold", windows: "Ctrl + B", mac: "Cmd + B" },
      { action: "Italic", windows: "Ctrl + I", mac: "Cmd + I" },
      { action: "Underline", windows: "Ctrl + U", mac: "Cmd + U" },
      {
        action: "Strikethrough",
        windows: "Ctrl + Shift + X",
        mac: "Cmd + Shift + X",
      },
    ],
  },
  {
    group: "Document",
    items: [
      { action: "Save", windows: "Ctrl + S", mac: "Cmd + S" },
      { action: "Print", windows: "Ctrl + P", mac: "Cmd + P" },
      { action: "Undo", windows: "Ctrl + Z", mac: "Cmd + Z" },
      { action: "Redo", windows: "Ctrl + Y", mac: "Cmd + Shift + Z" },
      { action: "Export", windows: "Ctrl + Shift + E", mac: "Cmd + Shift + E" },
    ],
  },
  {
    group: "Navigation",
    items: [
      { action: "Select All", windows: "Ctrl + A", mac: "Cmd + A" },
      { action: "Find & Replace", windows: "Ctrl + F", mac: "Cmd + F" },
      {
        action: "Focus Mode",
        windows: "Ctrl + Shift + F",
        mac: "Cmd + Shift + F",
      },
      { action: "Settings", windows: "Ctrl + ,", mac: "Cmd + ," },
      { action: "Close / Escape", windows: "Escape", mac: "Escape" },
    ],
  },
  {
    group: "Lists & Structure",
    items: [
      {
        action: "Bullet List",
        windows: "Ctrl + Shift + 8",
        mac: "Cmd + Shift + 8",
      },
      {
        action: "Ordered List",
        windows: "Ctrl + Shift + 7",
        mac: "Cmd + Shift + 7",
      },
      {
        action: "Blockquote",
        windows: "Ctrl + Shift + B",
        mac: "Cmd + Shift + B",
      },
    ],
  },
];

export default shortcuts;
