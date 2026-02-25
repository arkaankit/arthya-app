import svgPaths from "../imports/svg-0xtmlylnrq";

interface ArthyaLogoProps {
  className?: string;
  size?: number; // Size in pixels, defaults to 40
}

/**
 * Arthya Logo Component
 * A reusable logo component that displays the Arthya brand mark
 */
export function ArthyaLogo({ className = "", size = 40 }: ArthyaLogoProps) {
  // Scale factor to maintain aspect ratio from original 160x160
  const scale = size / 160;
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
      }}
    >
      {/* Background */}
      <div 
        className="absolute bg-[#242424] left-0 rounded-xl size-full top-0" 
        style={{
          borderRadius: `${10 * scale}px`,
          border: '0.020px solid transparent',
          backgroundImage: 'linear-gradient(#242424, #242424), linear-gradient(to right, #f59e0b, #ca8a04, #ea580c)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'padding-box, border-box'
        }}
      />
      
      {/* Abstract Logo Mark */}
      <div 
        className="absolute"
        style={{
          height: `${121 * scale}px`,
          left: `${22 * scale}px`,
          top: `${20 * scale}px`,
          width: `${116.234 * scale}px`
        }}
      >
        {/* Strong layer - Solid orange triangle */}
        <div 
          className="absolute"
          style={{
            bottom: '20.45%',
            left: 0,
            right: '46.71%',
            top: '20.45%'
          }}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 72">
            <path d={svgPaths.pd175b00} fill="#FE9A0C" />
          </svg>
        </div>
        
        {/* Glass layer - Semi-transparent triangle with blur */}
        <div 
          className="absolute"
          style={{
            bottom: 0,
            left: '28.42%',
            right: 0,
            top: 0
          }}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 121">
            <foreignObject height="163" width="125.204" x="-21" y="-21">
              <div 
                style={{ 
                  backdropFilter: "blur(10.5px)", 
                  clipPath: "url(#bgblur_0_2057_91_clip_path)", 
                  height: "100%", 
                  width: "100%" 
                }} 
                xmlns="http://www.w3.org/1999/xhtml" 
              />
            </foreignObject>
            <g filter="url(#filter0_iiii_2057_91)">
              <path d={svgPaths.p17d9e200} fill="url(#paint0_linear_2057_91)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="163" id="filter0_iiii_2057_91" width="125.204" x="-21" y="-21">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="10" dy="10" />
                <feGaussianBlur stdDeviation="11.5" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.603922 0 0 0 0 0.0470588 0 0 0 0.18 0" />
                <feBlend in2="shape" mode="normal" result="effect1_innerShadow_2057_91" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="2" />
                <feGaussianBlur stdDeviation="3" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
                <feBlend in2="effect1_innerShadow_2057_91" mode="normal" result="effect2_innerShadow_2057_91" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="1" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0" />
                <feBlend in2="effect2_innerShadow_2057_91" mode="normal" result="effect3_innerShadow_2057_91" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="-10" />
                <feGaussianBlur stdDeviation="5" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.603922 0 0 0 0 0.0470588 0 0 0 0.4 0" />
                <feBlend in2="effect3_innerShadow_2057_91" mode="overlay" result="effect4_innerShadow_2057_91" />
              </filter>
              <clipPath id="bgblur_0_2057_91_clip_path" transform="translate(21 21)">
                <path d={svgPaths.p17d9e200} />
              </clipPath>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2057_91" x1="41.602" x2="-60.1901" y1="239.514" y2="53.9803">
                <stop stopColor="#FE9A0C" stopOpacity="0.01" />
                <stop offset="1" stopColor="#FE9A0C" stopOpacity="0.12" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        {/* Subtle layer - White gradient triangle */}
        <div 
          className="absolute"
          style={{
            inset: '34.87% 57.94% 34.87% 14.77%'
          }}
        >
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 37">
            <path d={svgPaths.p374eca40} fill="url(#paint0_linear_2057_89)" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2057_89" x1="27.9983" x2="27.4584" y1="3.02126e-05" y2="34.1461">
                <stop stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
