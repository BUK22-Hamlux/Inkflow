const safeFilename = (title) => (title || "Untitled Document").replace(/[\\/:*?"<>|]/g, "-");
const toMillimeters = (pixels) => (Number(pixels || 0) * 25.4) / 96;

const runFromNode = (node, api) => {
  if (node.type === "hardBreak") return new api.TextRun({ text: "\n" });
  if (node.type === "image") return new api.TextRun({ text: node.attrs?.alt || "[Image]" });
  if (node.type !== "text") return null;

  const marks = Object.fromEntries((node.marks || []).map((mark) => [mark.type, mark.attrs || {}]));
  const color = marks.textStyle?.color?.replace("#", "");
  const fontSize = Number.parseFloat(marks.textStyle?.fontSize);
  return new api.TextRun({
    text: node.text || "",
    bold: Boolean(marks.bold),
    italics: Boolean(marks.italic),
    underline: marks.underline ? {} : undefined,
    strike: Boolean(marks.strike),
    subScript: Boolean(marks.subscript),
    superScript: Boolean(marks.superscript),
    color,
    font: marks.textStyle?.fontFamily,
    size: Number.isFinite(fontSize) ? Math.round(fontSize * 1.5) : undefined,
  });
};

const inlineRuns = (nodes = [], api) => nodes.flatMap((node) => {
  if (node.type === "text" || node.type === "hardBreak" || node.type === "image") {
    const run = runFromNode(node, api);
    return run ? [run] : [];
  }
  return node.content ? inlineRuns(node.content, api) : [];
});

const paragraphFromNode = (node, options = {}, api) => {
  const attrs = node.attrs || {};
  const alignments = {
    left: api.AlignmentType.LEFT,
    center: api.AlignmentType.CENTER,
    right: api.AlignmentType.RIGHT,
    justify: api.AlignmentType.JUSTIFIED,
  };
  const heading = {
    1: api.HeadingLevel.HEADING_1,
    2: api.HeadingLevel.HEADING_2,
    3: api.HeadingLevel.HEADING_3,
    4: api.HeadingLevel.HEADING_4,
  }[attrs.level];
  return new api.Paragraph({
    children: [...(options.prefix ? [new api.TextRun(options.prefix)] : []), ...inlineRuns(node.content, api)],
    heading,
    alignment: alignments[attrs.textAlign] || api.AlignmentType.LEFT,
    indent: options.indent ? { left: options.indent } : undefined,
    bullet: options.bullet ? { indent: options.indent || 720, hanging: 360 } : undefined,
    spacing: { after: 120 },
  });
};

const appendWordBlocks = (nodes, paragraphs, options = {}, api) => {
  nodes.forEach((node) => {
    if (["paragraph", "heading"].includes(node.type)) {
      paragraphs.push(paragraphFromNode(node, options, api));
      return;
    }
    if (node.type === "bulletList" || node.type === "orderedList") {
      node.content?.forEach((item, index) => {
        const blocks = item.content || [];
        blocks.forEach((block) => {
          if (block.type === "paragraph" || block.type === "heading") {
            paragraphs.push(paragraphFromNode(block, {
              bullet: node.type === "bulletList",
              prefix: node.type === "orderedList" ? `${index + 1}. ` : undefined,
              indent: 720,
            }, api));
          } else {
            appendWordBlocks([block], paragraphs, { indent: 720 }, api);
          }
        });
      });
      return;
    }
    if (node.type === "blockquote") {
      appendWordBlocks(node.content || [], paragraphs, { indent: 600 }, api);
      return;
    }
    if (node.type === "table") {
      const rows = (node.content || []).map((row) => new api.TableRow({
        children: (row.content || []).map((cell) => new api.TableCell({
          children: (cell.content || [])
            .filter((block) => block.type === "paragraph" || block.type === "heading")
            .map((block) => paragraphFromNode(block, {}, api)),
          width: { size: Math.floor(100 / Math.max(1, row.content?.length || 1)), type: api.WidthType.PERCENTAGE },
          shading: cell.type === "tableHeader" ? { fill: "E8F3FC" } : undefined,
        })),
      }));
      if (rows.length) {
        paragraphs.push(new api.Table({
          rows,
          width: { size: 100, type: api.WidthType.PERCENTAGE },
        }));
      }
      return;
    }
    if (node.content) appendWordBlocks(node.content, paragraphs, options, api);
  });
};

export const exportDocument = async ({ editor, title, pageSettings, format }) => {
  if (!editor) throw new Error("There is no open document to export.");
  const filename = safeFilename(title);

  if (format === "pdf") {
    const { default: html2pdf } = await import("html2pdf.js");
    const source = editor.view.dom.cloneNode(true);
    source.removeAttribute("contenteditable");
    source.querySelectorAll("[data-inkflow-page-spacer]").forEach((node) => node.remove());
    source.querySelectorAll(".ProseMirror-gapcursor").forEach((node) => node.remove());
    source.style.width = `${pageSettings.width - pageSettings.marginLeft - pageSettings.marginRight}px`;
    source.style.minHeight = "0";
    await html2pdf().set({
      filename: `${filename}.pdf`,
      margin: [pageSettings.marginTop, pageSettings.marginRight, pageSettings.marginBottom, pageSettings.marginLeft].map(toMillimeters),
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
      jsPDF: {
        unit: "mm",
        format: [toMillimeters(pageSettings.width), toMillimeters(pageSettings.height)],
        orientation: pageSettings.width > pageSettings.height ? "landscape" : "portrait",
      },
      pagebreak: { mode: ["css", "legacy"], after: ".inkflow-page-break" },
    }).from(source).save();
    return;
  }

  const api = await import("docx");
  const { saveAs } = await import("file-saver");
  const paragraphs = [];
  appendWordBlocks(editor.getJSON().content || [], paragraphs, {}, api);
  const documentFile = new api.Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: Math.round(pageSettings.width * 15),
            height: Math.round(pageSettings.height * 15),
            orientation: pageSettings.width > pageSettings.height ? api.PageOrientation.LANDSCAPE : api.PageOrientation.PORTRAIT,
          },
          margin: {
            top: Math.round(pageSettings.marginTop * 15),
            right: Math.round(pageSettings.marginRight * 15),
            bottom: Math.round(pageSettings.marginBottom * 15),
            left: Math.round(pageSettings.marginLeft * 15),
          },
        },
      },
      children: paragraphs.length ? paragraphs : [new api.Paragraph("")],
    }],
  });
  saveAs(await api.Packer.toBlob(documentFile), `${filename}.docx`);
};
