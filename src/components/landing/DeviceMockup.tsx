/** Device mockup: Desktop (DISPLAY_MOCK.png) + Phone (SAM_MOCK.png) layered */
export function DeviceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-4xl select-none">
      {/* Desktop mockup */}
      <div className="w-full">
        <img
          src="/tabby-assets/DISPLAY_MOCK.png"
          alt="Tabby on desktop"
          className="w-full h-auto"
        />
      </div>

      {/* Phone mockup - overlaid on bottom right */}
      <div className="absolute bottom-[2%] right-[-10%] w-[35%]">
        <img
          src="/tabby-assets/SAM_MOCK.png"
          alt="Tabby mobile app"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
