import { useState, useEffect } from "react";

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width:  window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      // Debounce — only update after user stops resizing for 100ms
      // Prevents excessive re-renders during window drag
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width:  window.innerWidth,
          height: window.innerHeight,
        });
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    width:    windowSize.width,
    height:   windowSize.height,
    isMobile: windowSize.width < 768,
    isTablet: windowSize.width >= 768 && windowSize.width < 1200,
    isDesktop: windowSize.width >= 1200,
  };
};

export default useWindowSize;