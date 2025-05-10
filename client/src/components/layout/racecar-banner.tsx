import React, { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import carAnimation from "@/components/layout/animation/animate.json";

const QUOTES = [
  "Complete your daily protein intake!",
  "Don't forget your water intake!",
  "Crush your workout today!",
  "Track your progress!",
  "Stay consistent, results will follow!",
  "Eat clean, train mean!",
  "Rest and recover!",
  "Push your limits!"
];

export const AnimatedRacecarBanner: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) return;
    // Listen for animationiteration on the car loop
    const handleLap = () => {
      setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
    };
    banner.addEventListener("animationiteration", handleLap);
    return () => banner.removeEventListener("animationiteration", handleLap);
  }, []);

  return (
    <div className="hidden md:block absolute top-1/2 left-[60px] w-[calc(100%-60px)] h-20 pointer-events-none z-10" style={{transform: 'translateY(-50%)'}}>
      <div className="absolute animate-car-loop" style={{right: 0, top: 0}} ref={bannerRef}>
        <div className="flex items-center relative" style={{height: 72}}>
          {/* Lottie Car Animation */}
          <div style={{ width: 120, height: 172, zIndex: 2 }}>
            <Lottie animationData={carAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
          </div>
          {/* String (rope) from car rear to banner */}
          <svg width="57" height="40" style={{position: 'absolute', left: 90, top: 0.5, zIndex: 1, pointerEvents: 'none'}}>
            {/* Start at car rear (x=0, y=36), end at banner (x=60, y=24) */}
            <path id="banner-string" d="M0,36 Q30,32 60,24" stroke="#bcbcbc" strokeWidth="3" fill="none" />
          </svg>
          {/* Wavy cloth banner */}
          <div className="ml-2 relative flex items-center" style={{zIndex: 2, minWidth: 240, height: 38}}>
            <svg width="240" height="40" viewBox="0 0 240 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full pointer-events-none" style={{zIndex: 1}}>
              <path className="banner-wave-path" d="M10,8 Q50,2 120,8 Q190,14 230,8 L230,30 Q190,36 120,30 Q50,24 10,30 Z" fill="#ff3a54"/>
            </svg>
            <div className="relative px-8 py-2 text-white font-semibold text-xs whitespace-nowrap flex items-center justify-center w-full" style={{zIndex: 2, minWidth: 180, textAlign: 'center'}}>
              {QUOTES[quoteIdx]}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes car-loop {
          0% { right: 0; }
          100% { right: 100vw; }
        }
        .animate-car-loop {
          animation: car-loop 8s linear infinite;
        }
        .banner-wave-path {
          animation: banner-wind 2s ease-in-out infinite alternate;
        }
        @keyframes banner-wind {
          0% {
            d: path('M10,8 Q50,2 120,8 Q190,14 230,8 L230,30 Q190,36 120,30 Q50,24 10,30 Z');
          }
          50% {
            d: path('M10,8 Q50,12 120,6 Q190,2 230,10 L230,30 Q190,26 120,34 Q50,38 10,28 Z');
          }
          100% {
            d: path('M10,8 Q50,2 120,8 Q190,14 230,8 L230,30 Q190,36 120,30 Q50,24 10,30 Z');
          }
        }
      `}</style>
    </div>
  );
}

// Animation styles (should be in global CSS, but included here for reference)
// .animate-car-loop {
//   animation: car-move 7s linear infinite;
// }
// @keyframes car-move {
//   0% { right: 0; }
//   100% { right: 100%; }
// }
// .animate-banner-wave {
//   animation: banner-wave 1.5s ease-in-out infinite alternate;
// }
// @keyframes banner-wave {
//   0% { transform: translateY(0); }
//   100% { transform: translateY(-3px); }
// } 