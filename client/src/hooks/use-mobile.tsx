import { useState, useEffect } from "react";

export function useMobile(breakpoint = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check initial state
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize event listener
    window.addEventListener("resize", checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
