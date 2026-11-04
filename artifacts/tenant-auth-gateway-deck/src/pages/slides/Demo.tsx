export default function Demo() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute inset-y-0 right-0 w-[43vw] bg-primary" />
      <div className="relative z-10 grid h-full grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col px-[7vw] pt-[8vh] pb-[7vh]">
          <h2 className="max-w-[49vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">The demo makes policy tangible</h2>
          <div className="mt-[8vh] flex flex-1 flex-col justify-between">
            <p className="border-l-[0.45vw] border-forest pl-[1.5vw] text-[2.05vw] leading-[1.2]">Three sample tenants with users, roles, sessions, and audit events</p>
            <p className="border-l-[0.45vw] border-forest pl-[1.5vw] text-[2.05vw] leading-[1.2]">Try role permission checks and cross-tenant denial</p>
            <p className="border-l-[0.45vw] border-forest pl-[1.5vw] text-[2.05vw] leading-[1.2]">Compare Free-limit and Premium role creation</p>
            <p className="border-l-[0.45vw] border-accent pl-[1.5vw] text-[2.05vw] leading-[1.2]">Revoke a sample session; demo state is local, not a live API write</p>
          </div>
        </div>
        <div className="relative flex items-center justify-center px-[2vw]">
          <div className="relative w-[36vw]">
            <div className="absolute left-[0.8vw] top-[0.8vh] h-[62vh] w-[33vw] border border-accent/70" />
            <div className="relative bg-bg p-[2vw] shadow-[0.8vw_0.8vw_0_#B7D64A]">
              <div className="mb-[2.2vh] h-[1vh] w-[8vw] bg-forest" />
              <div className="grid grid-cols-3 gap-[1vw]">
                <div className="h-[10vh] bg-accent" />
                <div className="h-[10vh] border border-primary/30 bg-bg" />
                <div className="h-[10vh] bg-stone" />
              </div>
              <div className="mt-[2.4vh] space-y-[1.5vh]">
                <div className="h-[1.2vh] w-[28vw] bg-primary/80" />
                <div className="h-[1.2vh] w-[24vw] bg-primary/25" />
                <div className="h-[1.2vh] w-[25vw] bg-primary/25" />
              </div>
              <div className="mt-[3vh] grid grid-cols-2 gap-[1vw]">
                <div className="h-[13vh] border border-primary/25 p-[1vw]">
                  <div className="h-[0.9vh] w-[7vw] bg-forest/70" />
                  <div className="mt-[2vh] h-[0.9vh] w-[10vw] bg-primary/20" />
                  <div className="mt-[1.2vh] h-[0.9vh] w-[8vw] bg-primary/20" />
                </div>
                <div className="h-[13vh] border border-primary/25 p-[1vw]">
                  <div className="h-[0.9vh] w-[7vw] bg-forest/70" />
                  <div className="mt-[2vh] flex gap-[0.5vw]">
                    <span className="h-[1.1vw] w-[1.1vw] rounded-full bg-accent" />
                    <span className="h-[1.1vw] w-[1.1vw] rounded-full bg-forest" />
                    <span className="h-[1.1vw] w-[1.1vw] rounded-full bg-primary/35" />
                  </div>
                  <div className="mt-[1.2vh] h-[0.9vh] w-[9vw] bg-primary/20" />
                </div>
              </div>
              <div className="mt-[2.2vh] h-[0.8vh] w-[31vw] bg-primary/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
