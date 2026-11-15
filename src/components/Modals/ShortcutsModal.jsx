import shortcuts from "../../config/shortcuts";
import ModalShell from "./ModalShell";

const ShortcutsModal = ({ onClose }) => (
  <ModalShell title="Keyboard shortcuts" onClose={onClose}>
    <div className="space-y-5">
      {shortcuts.map((group) => (
        <section key={group.group}>
          <h3 className="mb-2 text-xs font-semibold uppercase text-text-muted">{group.group}</h3>
          <div className="divide-y divide-border-toolbar">
            {group.items.map((item) => (
              <div key={item.action} className="grid grid-cols-[1fr_auto_auto] gap-3 py-2 text-sm">
                <span>{item.action}</span>
                <kbd className="rounded border border-border-input bg-editor px-2 py-0.5 text-xs">{item.windows}</kbd>
                <kbd className="rounded border border-border-input bg-editor px-2 py-0.5 text-xs">{item.mac}</kbd>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  </ModalShell>
);

export default ShortcutsModal;
