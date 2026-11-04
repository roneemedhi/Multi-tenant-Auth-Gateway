export default function Plans() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute left-0 bottom-0 h-[29vh] w-full bg-accent" />
      <div className="relative z-10 flex h-full flex-col px-[7vw] pt-[8vh] pb-[7vh]">
        <h2 className="max-w-[70vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">Plans control custom roles</h2>
        <div className="mt-[8vh] grid flex-1 grid-cols-2 gap-[5vw]">
          <div className="relative flex flex-col border-t-[0.5vh] border-primary pt-[2.5vh]">
            <div className="absolute right-[1vw] top-[3vh] flex gap-[0.6vw]">
              <span className="h-[1.4vw] w-[1.4vw] rounded-full bg-forest" />
              <span className="h-[1.4vw] w-[1.4vw] rounded-full bg-forest" />
              <span className="h-[1.4vw] w-[1.4vw] rounded-full bg-forest" />
            </div>
            <p className="mt-[8vh] max-w-[34vw] text-[2.15vw] leading-[1.2]">Free tenants can create up to three custom roles</p>
            <p className="mt-[3vh] max-w-[34vw] text-[2.05vw] leading-[1.2]">Built-in roles do not count toward the limit</p>
          </div>
          <div className="relative flex flex-col border-t-[0.5vh] border-forest pt-[2.5vh]">
            <div className="absolute right-[1vw] top-[3vh] h-[5vw] w-[7vw] rounded-[50%] border-[0.4vw] border-primary" />
            <p className="mt-[8vh] max-w-[34vw] text-[2.15vw] leading-[1.2]">Premium tenants have no custom-role cap</p>
            <p className="mt-[3vh] max-w-[34vw] text-[2.05vw] leading-[1.2]">Stripe subscription synchronization is not connected</p>
          </div>
        </div>
        <div className="absolute bottom-[10vh] left-[7vw] h-[0.5vh] w-[12vw] bg-primary/45" />
      </div>
    </div>
  );
}
