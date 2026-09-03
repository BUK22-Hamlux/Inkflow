import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const paginationPluginKey = new PluginKey("inkflowAutoPagination");

const MAX_PAGES = 80;

const isSpacer = (el) =>
  el?.nodeType === 1 && el.hasAttribute("data-inkflow-page-spacer");

const contentHeightOf = (el) => {
  let height = el.offsetHeight;
  el.querySelectorAll("[data-inkflow-page-spacer]").forEach((spacer) => {
    height -= spacer.offsetHeight;
  });
  return Math.max(0, height);
};

const blockMetrics = (el) => {
  const style = window.getComputedStyle(el);
  return {
    height: contentHeightOf(el),
    marginTop: parseFloat(style.marginTop) || 0,
    marginBottom: parseFloat(style.marginBottom) || 0,
  };
};

const isUnbreakable = (el) => {
  const tag = el.tagName;
  return (
    tag === "IMG" ||
    tag === "TABLE" ||
    tag === "PRE" ||
    tag === "HR" ||
    tag === "BLOCKQUOTE" ||
    el.matches?.("[data-resize-container]") ||
    el.querySelector?.("img, table, pre, [data-resize-container]")
  );
};

const createSpacerElement = () => {
  const el = document.createElement("span");
  el.setAttribute("data-inkflow-page-spacer", "true");
  el.className = "inkflow-page-spacer";
  el.contentEditable = "false";
  el.setAttribute("aria-hidden", "true");
  return el;
};

const posAtDom = (view, el, offset = 0) => {
  try {
    return view.posAtDOM(el, offset);
  } catch {
    return null;
  }
};

const posAtContentFraction = (view, el, fraction) => {
  const from = posAtDom(view, el, 0);
  const to = posAtDom(view, el, el.childNodes.length);
  if (from == null) return null;
  if (to == null || to <= from) return from;
  const t = Math.min(1, Math.max(0, fraction));
  return Math.round(from + (to - from) * t);
};

export const computePagination = (view, settings) => {
  const pageHeight = settings.height;
  const marginTop = settings.marginTop;
  const marginBottom = settings.marginBottom;
  const enabled = settings.enabled !== false;

  if (!enabled || !view?.dom || !pageHeight) {
    return { decorations: DecorationSet.empty, pageCount: 1 };
  }

  const writableHeight = pageHeight - marginTop - marginBottom;
  if (writableHeight < 48) {
    return { decorations: DecorationSet.empty, pageCount: 1 };
  }

  const children = [...view.dom.children].filter((el) => !isSpacer(el));
  let contentHeight = 0;
  for (const child of children) {
    const metrics = blockMetrics(child);
    contentHeight +=
      metrics.marginTop + metrics.height + metrics.marginBottom;
  }

  const pageCount = Math.min(
    MAX_PAGES,
    Math.max(1, Math.ceil((contentHeight - 0.5) / writableHeight)),
  );

  if (pageCount <= 1 || children.length === 0) {
    return { decorations: DecorationSet.empty, pageCount: 1 };
  }

  const widgets = [];
  const usedKeys = new Set();
  let contentY = 0;
  let page = 1;
  let boundary = writableHeight;

  const addWidget = (pos) => {
    if (widgets.length >= pageCount - 1) return false;
    if (pos == null || pos < 1 || pos > view.state.doc.content.size) {
      return false;
    }
    const key = `inkflow-spacer-${page}`;
    if (usedKeys.has(key) || widgets.some((widget) => widget.from === pos)) {
      return false;
    }
    usedKeys.add(key);
    widgets.push(
      Decoration.widget(pos, createSpacerElement, {
        side: -1,
        key,
        ignoreSelection: true,
      }),
    );
    page += 1;
    boundary += writableHeight;
    return true;
  };

  for (const child of children) {
    if (widgets.length >= pageCount - 1) break;

    const metrics = blockMetrics(child);
    const start = contentY + metrics.marginTop;
    const end = start + metrics.height;

    while (page < pageCount && start >= boundary - 1) {
      if (!addWidget(posAtDom(view, child, 0))) break;
    }

    while (
      page < pageCount &&
      start < boundary - 1 &&
      end > boundary + 1
    ) {
      const remaining = boundary - start;

      if (isUnbreakable(child)) {
        if (start > 1) {
          if (!addWidget(posAtDom(view, child, 0))) break;
        } else {
          break;
        }
      } else {
        const fraction =
          metrics.height <= 0 ? 0 : remaining / metrics.height;
        if (!addWidget(posAtContentFraction(view, child, fraction))) break;
      }
    }

    contentY = end + metrics.marginBottom;
  }

  return {
    decorations: DecorationSet.create(view.state.doc, widgets),
    pageCount,
  };
};

export const AutoPagination = Extension.create({
  name: "autoPagination",

  addStorage() {
    return {
      height: 1056,
      marginTop: 96,
      marginBottom: 96,
      pageGap: 28,
      enabled: true,
      onPageCountChange: null,
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: paginationPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, decorations) {
            const next = tr.getMeta(paginationPluginKey);
            if (next) return next;
            return decorations.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return paginationPluginKey.getState(state);
          },
        },
        view(editorView) {
          let frame = 0;

          const decorationSignature = (decorations) =>
            decorations
              .find()
              .map((decoration) => decoration.from)
              .join(",");

          const sync = () => {
            if (editorView.isDestroyed) return;

            const settings = editor.storage.autoPagination || {};
            const { decorations, pageCount } = computePagination(
              editorView,
              settings,
            );
            const nextPositions = decorationSignature(decorations);
            const current = paginationPluginKey.getState(editorView.state);
            const currentPositions = current
              ? decorationSignature(current)
              : "";

            if (nextPositions !== currentPositions) {
              editorView.dispatch(
                editorView.state.tr
                  .setMeta(paginationPluginKey, decorations)
                  .setMeta("addToHistory", false),
              );
            }

            settings.onPageCountChange?.(pageCount);
          };

          const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(sync);
          };

          const resizeObserver = new ResizeObserver(schedule);
          resizeObserver.observe(editorView.dom);

          schedule();

          return {
            update() {
              schedule();
            },
            destroy() {
              cancelAnimationFrame(frame);
              resizeObserver.disconnect();
            },
          };
        },
      }),
    ];
  },
});
