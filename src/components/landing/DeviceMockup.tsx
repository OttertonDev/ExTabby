/** 2-D device frames: laptop + overlapping phone. No images, no animation. */
export function DeviceMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md select-none" style={{ aspectRatio: '4/3' }}>

      {/* ── Laptop ── */}
      <div className="absolute inset-0 flex flex-col items-center">
        {/* Screen body */}
        <div className="w-full rounded-t-xl ring-[3px] ring-border bg-surface-variant overflow-hidden"
          style={{ height: '82%' }}>
          {/* Bezel top bar */}
          <div className="flex items-center justify-center h-5 bg-muted">
            <div className="size-1.5 rounded-full bg-border" /> {/* camera dot */}
          </div>
          {/* Screen area */}
          <div className="h-[calc(100%-1.25rem)] bg-background" />
        </div>

        {/* Base + hinge */}
        <div className="w-full flex flex-col items-center" style={{ height: '18%' }}>
          {/* Hinge strip */}
          <div className="w-full h-[10%] bg-muted ring-[2px] ring-border" />
          {/* Base */}
          <div className="h-[90%] bg-muted ring-[2px] ring-border rounded-b-lg"
            style={{ width: '110%' }}>
            {/* Trackpad */}
            <div className="mx-auto mt-[15%] rounded-md ring-1 ring-border"
              style={{ width: '30%', height: '45%' }} />
          </div>
        </div>
      </div>

      {/* ── Phone ── */}
      <div
        className="absolute bottom-[8%] right-[-6%] flex flex-col items-center rounded-[1.6rem] ring-[3px] ring-border bg-muted overflow-hidden shadow-elevation-2"
        style={{ width: '24%', height: '62%' }}
      >
        {/* Dynamic island */}
        <div className="mt-2 w-[38%] h-[3.5%] rounded-full bg-black/60 z-10" />
        {/* Screen */}
        <img src="/tabby-assets/PHONE_MOCK.jpg" alt="Tabby Android app" className="flex-1 w-full object-cover object-top mt-1" />
        {/* Home indicator */}
        <div className="mb-2 w-[30%] h-1 rounded-full bg-border" />
      </div>

    </div>
  );
}
