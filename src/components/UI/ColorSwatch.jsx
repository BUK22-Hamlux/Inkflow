const ColorSwatch = ({ hex, name, onClick, isActive = false, size = 20 }) => (
  <button
    type="button"
    onClick={() => onClick(hex)}
    aria-label={`${name || hex} color`}
    aria-pressed={isActive}
    title={name || hex}
    className="
      rounded-sm
      transition-all duration-100
      hover:scale-110 hover:z-10
      focus:outline-none focus:ring-1 focus:ring-accent-primary
      relative
    "
    style={{
      width: size,
      height: size,
      backgroundColor: hex,
      border: isActive
        ? "2px solid var(--accent-primary)"
        : hex.toUpperCase() === "#FFFFFF"
          ? "1px solid var(--border-input)"
          : "1px solid transparent",
      flexShrink: 0,
    }}
  />
);

export default ColorSwatch;
