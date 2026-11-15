import { useMemo } from "react";
import { useEditorContext } from "../../context/EditorContext";
import { MARGIN_PRESETS, PAGE_SIZES, pixelsToMillimeters, millimetersToPixels } from "../../config/pageSetup";

const marginKeys = [
  { key: "marginTop", label: "Top" },
  { key: "marginRight", label: "Right" },
  { key: "marginBottom", label: "Bottom" },
  { key: "marginLeft", label: "Left" },
];

const PageSetupPanel = () => {
  const { pageSettings, updatePageSettings, updatePageSize, updatePageOrientation } = useEditorContext();

  const activePreset = useMemo(() => Object.entries(MARGIN_PRESETS).find(([, preset]) =>
    marginKeys.every(({ key }) => Number(pageSettings[key]) === preset[key]),
  )?.[0] || "custom", [pageSettings]);

  const applyPreset = (presetName) => {
    if (presetName === "custom") return;
    const { label: LABEL, ...margins } = MARGIN_PRESETS[presetName];
    updatePageSettings(margins);
  };

  return (
    <div className="max-h-[min(75vh,34rem)] overflow-y-auto p-3 text-text-primary" aria-label="Page setup controls">
      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-text-secondary">Orientation</legend>
        <div className="grid grid-cols-2 gap-1 rounded-md bg-accent-secondary p-1">
          {["portrait", "landscape"].map((orientation) => (
            <button
              key={orientation}
              type="button"
              aria-pressed={(pageSettings.orientation || "portrait") === orientation}
              onClick={() => updatePageOrientation(orientation)}
              className={`h-8 rounded text-xs font-medium capitalize transition-colors ${(pageSettings.orientation || "portrait") === orientation ? "bg-editor text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
            >
              {orientation}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-4 block text-xs font-semibold text-text-secondary" htmlFor="page-size-select">Paper size</label>
      <select
        id="page-size-select"
        value={pageSettings.pageSize || "a4"}
        onChange={(event) => updatePageSize(event.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-border-input bg-editor px-2 text-sm text-text-primary outline-none focus:border-accent-primary"
      >
        {Object.entries(PAGE_SIZES).map(([key, size]) => (
          <option key={key} value={key}>{size.label}</option>
        ))}
      </select>

      <label className="mt-4 block text-xs font-semibold text-text-secondary" htmlFor="margin-preset-select">Margins</label>
      <select
        id="margin-preset-select"
        value={activePreset}
        onChange={(event) => applyPreset(event.target.value)}
        className="mt-1 h-9 w-full rounded-md border border-border-input bg-editor px-2 text-sm text-text-primary outline-none focus:border-accent-primary"
      >
        {Object.entries(MARGIN_PRESETS).map(([key, preset]) => (
          <option key={key} value={key}>{preset.label}</option>
        ))}
        <option value="custom">Custom</option>
      </select>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {marginKeys.map(({ key, label }) => (
          <label key={key} className="block text-xs text-text-secondary">
            {label} (mm)
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={pixelsToMillimeters(pageSettings[key])}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "") return;
                updatePageSettings({ [key]: millimetersToPixels(Math.min(100, Math.max(0, Number(value)))) });
              }}
              className="mt-1 h-8 w-full rounded-md border border-border-input bg-editor px-2 text-sm text-text-primary outline-none focus:border-accent-primary"
            />
          </label>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-text-muted">Margin values are in millimeters.</p>
    </div>
  );
};

export default PageSetupPanel;
