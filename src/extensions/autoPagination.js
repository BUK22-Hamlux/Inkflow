import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const paginationPluginKey = new PluginKey("inkflowAutoPagination");

const MAX_PAGES = 200;
const isSpacer = (element) => element?.nodeType === 1 && element.hasAttribute("data-inkflow-page-spacer");

const spacerHeight = (element) => element.getBoundingClientRect().height;

const naturalHeight = (element) => {
  let height = element.getBoundingClientRect().height;
  element.querySelectorAll("[data-inkflow-page-spacer]").forEach((spacer) => {
    height -= spacerHeight(spacer);
  });
  return Math.max(0, height);
};

const textLines = (view, root) => {
  const rootRect = root.getBoundingClientRect();
  const spacers = [...root.querySelectorAll("[data-inkflow-page-spacer]")]
    .map((element) => ({ top: element.getBoundingClientRect().top, height: spacerHeight(element) }));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const lineMap = new Map();
  let textNode;

  while ((textNode = walker.nextNode())) {
    if (!textNode.nodeValue?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(textNode);
    for (const lineRect of range.getClientRects()) {
      if (lineRect.height < 1) continue;
      let low = 0;
      let high = textNode.nodeValue.length - 1;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        range.setStart(textNode, middle);
        range.setEnd(textNode, middle + 1);
        if (range.getBoundingClientRect().top < lineRect.top - 1) low = middle + 1;
        else high = middle;
      }
      range.setStart(textNode, low);
      range.setEnd(textNode, low + 1);
      const charRect = range.getBoundingClientRect();
      if (Math.abs(charRect.top - lineRect.top) > 2) continue;

      let position;
      try {
        position = view.posAtDOM(textNode, low);
      } catch {
        continue;
      }
      const precedingSpacerHeight = spacers
        .filter((spacer) => spacer.top + spacer.height <= lineRect.top + 1)
        .reduce((sum, spacer) => sum + spacer.height, 0);
      const localTop = Math.max(0, lineRect.top - rootRect.top - precedingSpacerHeight);
      const key = Math.round(localTop / 2);
      const line = lineMap.get(key);
      if (line) {
        line.pos = Math.min(line.pos, position);
        line.height = Math.max(line.height, lineRect.height);
      } else {
        lineMap.set(key, { localTop, height: lineRect.height, pos: position });
      }
    }
  }
  return [...lineMap.values()].sort((a, b) => a.localTop - b.localTop);
};

const createSpacer = (height) => () => {
  const element = document.createElement("span");
  element.setAttribute("data-inkflow-page-spacer", "true");
  element.className = "inkflow-page-spacer";
  element.contentEditable = "false";
  element.setAttribute("aria-hidden", "true");
  element.style.height = `${Math.max(0, height)}px`;
  return element;
};

export const computePagination = (view, settings) => {
  const pageHeight = Number(settings.height);
  const marginTop = Number(settings.marginTop) || 0;
  const marginBottom = Number(settings.marginBottom) || 0;
  const pageGap = Number(settings.pageGap) || 0;
  const contentHeight = pageHeight - marginTop - marginBottom;
  if (settings.enabled === false || !view?.dom || !pageHeight || contentHeight < 48) {
    return { decorations: DecorationSet.empty, pageCount: 1 };
  }

  const decorations = [];
  const seen = new Set();
  const rootRect = view.dom.getBoundingClientRect();
  const spacers = [...view.dom.querySelectorAll("[data-inkflow-page-spacer]")]
    .map((element) => ({ top: element.getBoundingClientRect().top, height: spacerHeight(element) }));
  let pageStart = 0;
  let pageCount = 1;
  const pagePitch = pageHeight + pageGap;

  const removedHeightBefore = (top) => spacers
    .filter((spacer) => spacer.top + spacer.height <= top + 1)
    .reduce((sum, spacer) => sum + spacer.height, 0);

  const naturalTop = (element) => {
    const top = element.getBoundingClientRect().top;
    return top - rootRect.top - removedHeightBefore(top);
  };

  const addSpacer = (position, offset) => {
    if (decorations.length >= MAX_PAGES - 1 || position < 0 || position > view.state.doc.content.size) return false;
    const height = Math.max(0, Math.ceil(pagePitch - offset));
    const key = `${position}:${Math.round(height)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    decorations.push(Decoration.widget(position, createSpacer(height), {
      key: `inkflow-page-${key}`,
      side: -1,
      ignoreSelection: true,
    }));
    pageCount += 1;
    return true;
  };

  view.state.doc.forEach((node, position) => {
    if (pageCount >= MAX_PAGES) return;
    const element = view.nodeDOM(position);
    if (!element || element.nodeType !== 1 || isSpacer(element)) return;

    if (node.type.name === "pageBreak") {
      const breakTop = naturalTop(element);
      if (addSpacer(position + node.nodeSize, breakTop - pageStart)) pageStart = breakTop;
      return;
    }

    const blockTop = naturalTop(element);
    const isUnbreakable = ["image", "table", "codeBlock", "horizontalRule"].includes(node.type.name)
      || element.matches("img, table, pre, [data-resize-container]")
      || element.querySelector("img, table, pre, [data-resize-container]");

    if (isUnbreakable) {
      const blockHeight = naturalHeight(element);
      const offset = blockTop - pageStart;
      if (offset > 0 && offset + blockHeight > contentHeight && addSpacer(position, offset)) {
        pageStart = blockTop;
      }
      return;
    }

    for (const line of textLines(view, element)) {
      const lineTop = blockTop + line.localTop;
      const offset = lineTop - pageStart;
      if (offset > 0 && offset + line.height > contentHeight + 1 && addSpacer(line.pos, offset)) {
        pageStart = lineTop;
      }
      if (pageCount >= MAX_PAGES) break;
    }
  });

  return {
    decorations: DecorationSet.create(view.state.doc, decorations),
    pageCount,
  };
};

export const AutoPagination = Extension.create({
  name: "autoPagination",

  addStorage() {
    return {
      height: 1123,
      marginTop: 96,
      marginBottom: 96,
      pageGap: 28,
      enabled: true,
      onPageCountChange: null,
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    return [new Plugin({
      key: paginationPluginKey,
      state: {
        init: () => DecorationSet.empty,
        apply(transaction, current) {
          const next = transaction.getMeta(paginationPluginKey);
          return next instanceof DecorationSet ? next : current.map(transaction.mapping, transaction.doc);
        },
      },
      props: {
        decorations(state) {
          return paginationPluginKey.getState(state);
        },
      },
      view(editorView) {
        let frame = 0;
        const signature = (set) => set.find().map((decoration) => `${decoration.from}:${decoration.spec.key}`).join("|");
        const sync = () => {
          if (editorView.isDestroyed) return;
          const settings = editor.storage.autoPagination;
          const result = computePagination(editorView, settings);
          const pageHeight = Number(settings.height) || 1123;
          const pageGap = Number(settings.pageGap) || 0;
          const canvas = editorView.dom.closest(".editor-canvas");
          canvas?.style.setProperty(
            "--pagination-min-height",
            `${result.pageCount * pageHeight + Math.max(0, result.pageCount - 1) * pageGap}px`,
          );
          const current = paginationPluginKey.getState(editorView.state) || DecorationSet.empty;
          if (signature(result.decorations) !== signature(current)) {
            editorView.dispatch(editorView.state.tr
              .setMeta(paginationPluginKey, result.decorations)
              .setMeta("addToHistory", false));
          }
          settings.onPageCountChange?.(result.pageCount);
        };
        const schedule = () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(sync);
        };
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(editorView.dom);
        schedule();
        return {
          update: schedule,
          destroy() {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
          },
        };
      },
    })];
  },
});
