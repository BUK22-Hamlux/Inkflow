import { RotateCcw } from "lucide-react";
import { useEditorContext } from "../../context/EditorContext";

const marginControls = [
  { key: "marginTop", label: "Top" },
  { key: "marginRight", label: "Right" },
  { key: "marginBottom", label: "Bottom" },
  { key: "marginLeft", label: "Left" },
];

const spacingControls = [
  { key: "lineHeight", label: "Line height", min: 1.1, max: 2.5, step: 0.1 },
  {
    key: "paragraphSpacing",
    label: "Paragraph spacing",
    min: 0,
    max: 32,
    step: 1,
  },
];

const NumberSlider = ({ label, value, min, max, step, unit, onChange }) => {
  const numericValue = Number(value);

  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-text-secondary">{label}</span>
        <span className="text-xs font-semibold text-text-primary">
          {numericValue}
          {unit}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 accent-[var(--accent-primary)]"
        />
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-8 w-16 rounded-md border border-border-input bg-editor px-2 text-xs text-text-primary outline-none focus:border-accent-primary"
        />
      </div>
    </label>
  );
};

const DocumentSettings = () => {
  const { pageSettings, updatePageSettings, resetPageSettings } =
    useEditorContext();

  return (
    <div className="h-full overflow-y-auto px-4 py-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">
            Page setup
          </h2>
          <p className="mt-1 text-xs leading-5 text-text-muted">
            Adjust the document canvas and paragraph spacing.
          </p>
        </div>

        <button
          type="button"
          onClick={resetPageSettings}
          className="toolbar-btn shrink-0"
          aria-label="Reset page setup"
          title="Reset page setup"
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </div>

      <section className="mb-6" aria-labelledby="page-size-heading">
        <h3
          id="page-size-heading"
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted"
        >
          Page
        </h3>
        <div className="rounded-lg border border-border-toolbar bg-editor p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-secondary">Size</span>
            <span className="font-semibold text-text-primary">A4 portrait</span>
          </div>
        </div>
      </section>

      <section className="mb-6" aria-labelledby="margins-heading">
        <h3
          id="margins-heading"
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted"
        >
          Margins
        </h3>
        <div className="space-y-4">
          {marginControls.map((control) => (
            <NumberSlider
              key={control.key}
              label={control.label}
              value={pageSettings[control.key]}
              min={40}
              max={160}
              step={4}
              unit="px"
              onChange={(value) => updatePageSettings({ [control.key]: value })}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="spacing-heading">
        <h3
          id="spacing-heading"
          className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted"
        >
          Spacing
        </h3>
        <div className="space-y-4">
          {spacingControls.map((control) => (
            <NumberSlider
              key={control.key}
              label={control.label}
              value={pageSettings[control.key]}
              min={control.min}
              max={control.max}
              step={control.step}
              unit={control.key === "lineHeight" ? "" : "px"}
              onChange={(value) => updatePageSettings({ [control.key]: value })}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DocumentSettings;
