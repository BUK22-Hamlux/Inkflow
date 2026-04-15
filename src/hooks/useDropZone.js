import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import openDocx from "../utils/openDocx";
import openTxt from "../utils/openTxt";

const ACCEPTED_TYPES = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

const ACCEPTED_EXTENSIONS = [".docx", ".txt"];

const getFileType = (file) => {
  if (ACCEPTED_TYPES[file.type]) {
    return ACCEPTED_TYPES[file.type];
  }
  const name = file.name.toLowerCase();
  const ext = ACCEPTED_EXTENSIONS.find((e) => name.endsWith(e));
  return ext ? ext.replace(".", "") : null;
};

const useDropZone = ({ enabled = true, onFileDrop }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;

      const fileType = getFileType(file);

      if (!fileType) {
        toast.error(
          `Unsupported file type "${file.name}". Please use a .docx or .txt file.`,
          {
            duration: 4000,
            position: "bottom-right",
            style: {
              background: "var(--bg-modal)",
              color: "var(--text-primary)",
              border: "1px solid var(--status-danger)",
              borderLeft: "4px solid var(--status-danger)",
              borderRadius: "10px",
              fontSize: "13px",
            },
          },
        );
        return;
      }

      setIsProcessing(true);

      try {
        let html = "";

        if (fileType === "docx") {
          html = await openDocx(file);
        } else if (fileType === "txt") {
          html = await openTxt(file);
        }

        toast.success(`"${file.name}" opened successfully`, {
          duration: 3000,
          position: "bottom-right",
          style: {
            background: "var(--bg-modal)",
            color: "var(--text-primary)",
            border: "1px solid var(--status-success)",
            borderLeft: "4px solid var(--status-success)",
            borderRadius: "10px",
            fontSize: "13px",
          },
        });

        onFileDrop(html, file.name);
      } catch (error) {
        console.error("File processing error:", error);
        toast.error(
          `Failed to open "${file.name}". The file may be corrupted or password protected.`,
          {
            duration: 5000,
            position: "bottom-right",
            style: {
              background: "var(--bg-modal)",
              color: "var(--text-primary)",
              border: "1px solid var(--status-danger)",
              borderLeft: "4px solid var(--status-danger)",
              borderRadius: "10px",
              fontSize: "13px",
            },
          },
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [onFileDrop],
  );

  const handleDragEnter = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!enabled) return;
      setIsDraggingOver(true);
    },
    [enabled],
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!enabled) return;
      e.dataTransfer.dropEffect = "copy";
      setIsDraggingOver(true);
    },
    [enabled],
  );

  const handleDragLeave = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!enabled) return;
      if (e.currentTarget.contains(e.relatedTarget)) return;
      setIsDraggingOver(false);
    },
    [enabled],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!enabled) return;
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      if (files.length > 1) {
        toast.error("Please drop one file at a time.", {
          duration: 3000,
          position: "bottom-right",
          style: {
            background: "var(--bg-modal)",
            color: "var(--text-primary)",
            border: "1px solid var(--status-warning)",
            borderLeft: "4px solid var(--status-warning)",
            borderRadius: "10px",
            fontSize: "13px",
          },
        });
        return;
      }
      processFile(files[0]);
    },
    [enabled, processFile],
  );

  const handleFileInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  return {
    isDraggingOver,
    isProcessing,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  };
};

export default useDropZone;
