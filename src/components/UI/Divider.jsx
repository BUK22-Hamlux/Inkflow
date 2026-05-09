const Divider = ({ orientation = "vertical", className = "" }) => {
  if (orientation === "horizontal") {
    return (
      <hr
        className={`w-full border-none h-px bg-border-toolbar ${className}`}
        aria-hidden="true"
        role="separator"
        aria-orientation="horizontal"
      />
    );
  }

  return (
    <div
      className={`shrink-0 w-px h-5 bg-border-toolbar ${className}`}
      aria-hidden="true"
      role="separator"
      aria-orientation="vertical"
    />
  );
};

export default Divider;
