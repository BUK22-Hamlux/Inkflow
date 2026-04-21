const Divider = ({ orientation = "vertical", className = "" }) => {
  if (orientation === "horizontal") {
    return (
      <hr
        className={`w-full border-none ${className}`}
        style={{
          height: "1px",
          backgroundColor: "var(--border-toolbar)",
        }}
        aria-hidden="true"
        role="separator"
        aria-orientation="horizontal"
      />
    );
  }

  return (
    <div
      className={`shrink-0 ${className}`}
      style={{
        width: "1px",
        height: "20px",
        backgroundColor: "var(--border-toolbar)",
      }}
      aria-hidden="true"
      role="separator"
      aria-orientation="vertical"
    />
  );
};

export default Divider;
