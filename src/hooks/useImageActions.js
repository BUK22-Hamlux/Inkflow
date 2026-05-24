import { useCallback, useRef } from "react";
import toast from "react-hot-toast";
import useDialog from "./useDialog";

const IMAGE_TOAST_STYLE = {
  background: "var(--bg-modal)",
  color: "var(--text-primary)",
  border: "1px solid var(--status-danger)",
  borderLeft: "4px solid var(--status-danger)",
  borderRadius: "10px",
  fontSize: "13px",
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const useImageActions = (editor) => {
  const { prompt, confirm } = useDialog();
  const imageInputRef = useRef(null);

  const insertImageFromUrl = useCallback(async () => {
    if (!editor) return;

    const values = await prompt({
      title: "Insert image",
      description: "Add an image URL and optional accessibility text.",
      confirmLabel: "Insert",
      fields: [
        {
          name: "src",
          label: "Image URL",
          type: "url",
          placeholder: "https://example.com/image.png",
        },
        {
          name: "alt",
          label: "Alt text",
          placeholder: "Describe the image",
        },
        {
          name: "title",
          label: "Title",
          placeholder: "Optional title",
        },
      ],
    });

    const src = values?.src?.trim();
    if (!src) return;

    editor
      .chain()
      .focus()
      .setImage({
        src,
        alt: values.alt?.trim() || null,
        title: values.title?.trim() || null,
        align: "left",
      })
      .run();
  }, [editor, prompt]);

  const chooseImageFile = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const insertImageFile = useCallback(
    async (file) => {
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please choose an image file.", {
          duration: 3000,
          position: "bottom-right",
          style: IMAGE_TOAST_STYLE,
        });
        return;
      }

      const values = await prompt({
        title: "Image details",
        description: "Alt text helps people understand images with assistive technology.",
        confirmLabel: "Insert",
        fields: [
          {
            name: "alt",
            label: "Alt text",
            placeholder: "Describe the image",
            value: file.name.replace(/\.[^.]+$/, ""),
          },
          {
            name: "title",
            label: "Title",
            placeholder: "Optional title",
          },
        ],
      });

      if (!values) return;

      const src = await readFileAsDataUrl(file);

      editor
        .chain()
        .focus()
        .setImage({
          src,
          alt: values.alt?.trim() || null,
          title: values.title?.trim() || null,
          align: "left",
        })
        .run();
    },
    [editor, prompt],
  );

  const onImageSelected = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      insertImageFile(file);
    },
    [insertImageFile],
  );

  const updateSelectedImageDetails = useCallback(async () => {
    if (!editor || !editor.isActive("image")) return;

    const attrs = editor.getAttributes("image");
    const values = await prompt({
      title: "Image details",
      confirmLabel: "Save",
      fields: [
        {
          name: "alt",
          label: "Alt text",
          placeholder: "Describe the image",
          value: attrs.alt ?? "",
        },
        {
          name: "title",
          label: "Title",
          placeholder: "Optional title",
          value: attrs.title ?? "",
        },
      ],
    });

    if (!values) return;

    editor
      .chain()
      .focus()
      .updateAttributes("image", {
        alt: values.alt?.trim() || null,
        title: values.title?.trim() || null,
      })
      .run();
  }, [editor, prompt]);

  const replaceSelectedImage = useCallback(async () => {
    if (!editor || !editor.isActive("image")) return;

    const attrs = editor.getAttributes("image");
    const values = await prompt({
      title: "Replace image",
      description: "Paste a new image URL. Existing alt text and title are kept.",
      confirmLabel: "Replace",
      fields: [
        {
          name: "src",
          label: "Image URL",
          type: "url",
          placeholder: "https://example.com/image.png",
          value: attrs.src ?? "",
        },
      ],
    });

    const src = values?.src?.trim();
    if (!src) return;

    editor.chain().focus().updateAttributes("image", { src }).run();
  }, [editor, prompt]);

  const alignSelectedImage = useCallback(
    (align) => {
      if (!editor || !editor.isActive("image")) return;
      editor.chain().focus().updateAttributes("image", { align }).run();
    },
    [editor],
  );

  const deleteSelectedImage = useCallback(async () => {
    if (!editor || !editor.isActive("image")) return;

    const confirmed = await confirm({
      title: "Delete image?",
      description: "This removes the selected image from the document.",
      confirmLabel: "Delete",
      variant: "danger",
    });

    if (!confirmed) return;
    editor.chain().focus().deleteSelection().run();
  }, [editor, confirm]);

  return {
    imageInputRef,
    chooseImageFile,
    insertImageFromUrl,
    insertImageFile,
    onImageSelected,
    updateSelectedImageDetails,
    replaceSelectedImage,
    alignSelectedImage,
    deleteSelectedImage,
  };
};

export default useImageActions;
