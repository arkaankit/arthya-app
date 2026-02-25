import svgPaths from "./svg-0xtmlylnrq";

/**
 * @figmaAssetKey 469fdca856b9f0a24c0fe1a05f860f2a0354fc6c
 */
function Abstract({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Abstract-15">
      <div className="absolute bottom-[20.45%] left-0 right-[46.71%] top-[20.45%]" data-name="strong">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 72">
          <path d={svgPaths.pd175b00} fill="var(--fill-0, #FE9A0C)" id="strong" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-[28.42%] right-0 top-0" data-name="glass">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 84 121">
          <foreignObject height="163" width="125.204" x="-21" y="-21">
            <div style={{ backdropFilter: "blur(10.5px)", clipPath: "url(#bgblur_0_2057_91_clip_path)", height: "100%", width: "100%" }} xmlns="http://www.w3.org/1999/xhtml" />
          </foreignObject>
          <g data-figma-bg-blur-radius="21" filter="url(#filter0_iiii_2057_91)" id="glass">
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
      <div className="absolute inset-[34.87%_57.94%_34.87%_14.77%]" data-name="subtle">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 37">
          <path d={svgPaths.p374eca40} fill="url(#paint0_linear_2057_89)" id="subtle" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2057_89" x1="27.9983" x2="27.4584" y1="3.02126e-05" y2="34.1461">
              <stop stopColor="white" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#242424] left-0 rounded-[10px] size-[160px] top-0" />
      <Abstract className="absolute h-[121px] left-[22px] top-[20px] w-[116.234px]" />
    </div>
  );
}