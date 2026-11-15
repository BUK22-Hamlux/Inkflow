import { useState } from "react";
import toast from "react-hot-toast";
import ModalShell from "./ModalShell";

const FindReplacePanel = ({ editor, onClose }) => {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");

  const findMatches = () => {
    if (!editor || !query) return [];
    const matches = [];
    editor.state.doc.descendants((node, position) => {
      if (!node.isTextblock) return;
      const text = node.textContent;
      let index = text.indexOf(query);
      while (index >= 0) {
        matches.push({ from: position + 1 + index, to: position + 1 + index + query.length });
        index = text.indexOf(query, index + query.length);
      }
    });
    return matches;
  };

  const findNext = () => {
    const matches = findMatches();
    if (!matches.length) return toast.error("No matches found.");
    const next = matches.find((match) => match.from >= editor.state.selection.to) || matches[0];
    editor.commands.setTextSelection(next);
    editor.commands.focus();
  };

  const replaceCurrent = () => {
    const { from, to } = editor.state.selection;
    if (from === to || editor.state.doc.textBetween(from, to) !== query) return findNext();
    editor.chain().focus().insertContent(replacement).run();
  };

  const replaceAll = () => {
    const matches = findMatches();
    if (!matches.length) return toast.error("No matches found.");
    const transaction = editor.state.tr;
    [...matches].reverse().forEach(({ from, to }) => transaction.insertText(replacement, from, to));
    editor.view.dispatch(transaction);
    toast.success(`${matches.length} occurrence${matches.length === 1 ? "" : "s"} replaced.`);
  };

  return (
    <ModalShell title="Find and replace" onClose={onClose} width="max-w-md">
      <div className="space-y-3">
        <label className="block text-sm text-text-secondary">Find
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-border-input bg-editor px-3 text-text-primary outline-none focus:border-accent-primary" />
        </label>
        <label className="block text-sm text-text-secondary">Replace with
          <input value={replacement} onChange={(event) => setReplacement(event.target.value)} className="mt-1 h-10 w-full rounded-md border border-border-input bg-editor px-3 text-text-primary outline-none focus:border-accent-primary" />
        </label>
        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" onClick={findNext} className="h-9 rounded-md border border-border-input px-3 text-sm">Find next</button>
          <button type="button" onClick={replaceCurrent} disabled={!query} className="h-9 rounded-md border border-border-input px-3 text-sm disabled:opacity-50">Replace</button>
          <button type="button" onClick={replaceAll} disabled={!query} className="h-9 rounded-md bg-accent-primary px-3 text-sm text-text-on-accent disabled:opacity-50">Replace all</button>
        </div>
      </div>
    </ModalShell>
  );
};

export default FindReplacePanel;
