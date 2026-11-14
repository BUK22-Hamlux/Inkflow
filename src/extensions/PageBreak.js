import { Node } from "@tiptap/core";
import { Selection } from "@tiptap/pm/state";

export const PageBreak = Node.create({
  name: "pageBreak",
  group: "block",
  atom: true,
  selectable: true,
  priority: 1000,

  parseHTML() {
    return [
      { tag: 'hr.inkflow-page-break' },
      { tag: 'hr[data-inkflow-page-break]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hr", { ...HTMLAttributes, class: "inkflow-page-break", "data-inkflow-page-break": "true" }];
  },

  addKeyboardShortcuts() {
    const insertPageBreak = () => this.editor.chain()
      .focus()
      .insertContent([{ type: this.name }, { type: "paragraph" }])
      .run();

    const removeEmptyPageBreak = () => {
      const { state, view } = this.editor;
      const { $from, empty } = state.selection;
      if (!empty || !$from.parent.isTextblock || $from.parent.content.size !== 0 || $from.parentOffset !== 0) {
        return false;
      }

      const previousNode = $from.nodeBefore;
      if (previousNode?.type.name !== this.name) return false;

      const breakTo = $from.before();
      const breakFrom = breakTo - previousNode.nodeSize;
      const transaction = state.tr.delete(breakFrom, breakTo);
      const cursor = transaction.mapping.map($from.pos, -1);
      transaction.setSelection(Selection.near(transaction.doc.resolve(Math.max(0, cursor)), -1));
      view.dispatch(transaction.scrollIntoView());
      return true;
    };

    return {
      "Mod-Enter": insertPageBreak,
      Backspace: removeEmptyPageBreak,
    };
  },
});
