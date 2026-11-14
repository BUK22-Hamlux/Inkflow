export const PAGE_SIZES = {
  a4: { label: "A4", width: 794, height: 1123 },
  letter: { label: "Letter", width: 816, height: 1056 },
  legal: { label: "Legal", width: 816, height: 1344 },
  a5: { label: "A5", width: 559, height: 794 },
};

export const MARGIN_PRESETS = {
  normal: { label: "Normal", marginTop: 96, marginRight: 96, marginBottom: 96, marginLeft: 96 },
  narrow: { label: "Narrow", marginTop: 48, marginRight: 48, marginBottom: 48, marginLeft: 48 },
  moderate: { label: "Moderate", marginTop: 96, marginRight: 72, marginBottom: 96, marginLeft: 72 },
  wide: { label: "Wide", marginTop: 96, marginRight: 144, marginBottom: 96, marginLeft: 144 },
};

export const getPageDimensions = (pageSize, orientation) => {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  const isLandscape = orientation === "landscape";
  return {
    width: isLandscape ? Math.max(size.width, size.height) : Math.min(size.width, size.height),
    height: isLandscape ? Math.min(size.width, size.height) : Math.max(size.width, size.height),
  };
};

export const pixelsToMillimeters = (pixels) => Math.round(((Number(pixels) * 25.4) / 96) * 10) / 10;
export const millimetersToPixels = (millimeters) => Math.round((Number(millimeters) * 96) / 25.4);
