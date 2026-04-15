const openTxt = async (file) => {
  const text = await file.text();

  if (!text || text.trim() === "") {
    return "<p></p>";
  }

  const html = text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return "<p></p>";
      const escaped = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
      return `<p>${escaped}</p>`;
    })
    .join("");

  return html;
};

export default openTxt;
