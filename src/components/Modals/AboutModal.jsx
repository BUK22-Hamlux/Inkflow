import { PenLine } from "lucide-react";
import ModalShell from "./ModalShell";

const AboutModal = ({ onClose }) => (
  <ModalShell title="About InkFlow" onClose={onClose} width="max-w-md">
    <div className="flex flex-col items-center py-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary text-text-on-accent">
        <PenLine size={24} />
      </div>
      <h3 className="text-lg font-semibold">InkFlow</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
        A focused, offline-first writing space. Your work is saved on this device, with account sync available when you sign in.
      </p>
    </div>
  </ModalShell>
);

export default AboutModal;
