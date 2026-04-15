import mammoth from "mammoth";

const openDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "b => strong",
        "i => em",
      ],
    },
  );
  if (result.messages.length > 0) {
    const errors = result.messages.filter((m) => m.type === "error");
    if (errors.length > 0) {
      console.warn("Mammoth conversion warnings:", errors);
    }
  }

  const html = result.value;

  if (!html || html.trim() === "") {
    return "<p></p>";
  }

  return html;
};

export default openDocx;
