/** Device mockup: desktop, phone, and watch product surfaces layered together. */
export function DeviceMockup() {
  return (
    <div className="relative w-full max-w-5xl select-none">
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

      {/* Watch mockup - grounded with the phone and shifted farther right */}
      <div className="absolute bottom-[2%] right-[-18%] z-10 w-[32%] md:right-[-22%] md:w-[34%]">
        <img
          src="/tabby-assets/WATCH_MOCK.png"
          alt="Tabby smartwatch app"
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
