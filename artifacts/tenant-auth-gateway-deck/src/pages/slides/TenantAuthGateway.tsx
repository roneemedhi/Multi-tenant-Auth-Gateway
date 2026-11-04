export default function TenantAuthGateway() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute inset-0 grid-lines opacity-80" />
      <div className="absolute right-0 top-0 h-[72vh] w-[52vw] rounded-[48%] bg-accent" />
      <div className="absolute right-[9vw] top-[13vh] h-[58vh] w-[34vw] rounded-[46%] border-[0.12vw] border-primary/20" />
      <div className="absolute right-[14vw] top-[20vh] h-[46vh] w-[24vw] rounded-[46%] border-[0.12vw] border-primary/25" />
      <div className="absolute right-[22vw] top-[32vh] h-[22vh] w-[9vw] rounded-full bg-primary" />
      <div className="absolute right-[24.5vw] top-[37vh] h-[11vh] w-[4vw] rounded-full border-[0.16vw] border-accent" />
      <div className="relative z-10 flex h-full flex-col justify-between px-[7vw] py-[8vh]">
        <div className="h-[1.2vw] w-[1.2vw] rotate-45 bg-primary" />
        <div className="max-w-[58vw]">
          <h1 className="font-display text-[7vw] font-bold leading-[0.98] tracking-[-0.065em] text-primary">
            Tenant Auth Gateway
          </h1>
          <p className="mt-[3.2vh] max-w-[47vw] text-[2.35vw] leading-[1.22] text-muted">
            A modular B2B API for identity, access control, and session security.
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div className="h-[0.55vh] w-[12vw] bg-forest" />
          <div className="h-[0.55vh] w-[5vw] bg-primary/35" />
        </div>
      </div>
    </div>
  );
}
