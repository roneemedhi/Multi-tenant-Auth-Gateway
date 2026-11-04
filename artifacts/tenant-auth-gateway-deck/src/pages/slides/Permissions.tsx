export default function Permissions() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute right-0 top-0 h-[28vh] w-[39vw] bg-accent" />
      <div className="relative z-10 flex h-full flex-col px-[7vw] pt-[8vh] pb-[7vh]">
        <h2 className="max-w-[70vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">Permissions map to real routes</h2>
        <div className="mt-[9vh] grid flex-1 grid-cols-[0.8fr_1.2fr] gap-[5vw]">
          <div className="flex flex-col justify-between py-[1vh]">
            <p className="text-[2.2vw] leading-[1.2]"><span className="font-display font-bold text-forest">Built-in roles:</span> Owner, Admin, Editor, Viewer</p>
            <p className="text-[2.2vw] leading-[1.2]">Route middleware checks granular permissions</p>
            <p className="text-[2.2vw] leading-[1.2]">Custom roles cannot grant permissions their creator lacks</p>
            <p className="text-[2.2vw] leading-[1.2]">Tenant and resource actions are separated by permission</p>
          </div>
          <div className="relative border-y border-primary/25 py-[3vh]">
            <div className="grid h-full grid-cols-4 grid-rows-4">
              <div className="border-b border-r border-primary/25 bg-primary text-[1.75vw] font-semibold text-bg flex items-center justify-center">Owner</div>
              <div className="border-b border-r border-primary/25 bg-forest text-[1.75vw] font-semibold text-bg flex items-center justify-center">Admin</div>
              <div className="border-b border-r border-primary/25 bg-forest/45 text-[1.75vw] font-semibold text-primary flex items-center justify-center">Editor</div>
              <div className="border-b border-primary/25 bg-stone text-[1.75vw] font-semibold text-muted flex items-center justify-center">Viewer</div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-accent" /></div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-accent" /></div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-forest" /></div>
              <div className="border-b border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-primary/45" /></div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-accent" /></div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-forest" /></div>
              <div className="border-b border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-forest" /></div>
              <div className="border-b border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-primary/45" /></div>
              <div className="border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-accent" /></div>
              <div className="border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-forest" /></div>
              <div className="border-r border-primary/20 flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-primary/45" /></div>
              <div className="flex items-center justify-center"><span className="h-[1vw] w-[1vw] rounded-full bg-primary/45" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
