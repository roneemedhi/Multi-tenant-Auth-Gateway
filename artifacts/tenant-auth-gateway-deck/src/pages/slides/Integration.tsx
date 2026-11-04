export default function Integration() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute left-0 top-0 h-full w-[38vw] bg-accent" />
      <div className="absolute left-[7vw] top-[17vh] h-[63vh] w-[24vw] border-[0.12vw] border-primary/30" />
      <div className="absolute left-[14vw] top-[31vh] h-[34vh] w-[10vw] rounded-[50%] bg-primary" />
      <div className="absolute left-[17.2vw] top-[40vh] h-[16vh] w-[3.5vw] rounded-[50%] border-[0.14vw] border-accent" />
      <div className="relative z-10 flex h-full flex-col justify-center pl-[45vw] pr-[7vw]">
        <h2 className="max-w-[52vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">Ready for integration, with clear dependencies</h2>
        <div className="mt-[5vh] flex flex-col gap-[2.6vh]">
          <p className="border-t border-primary/25 pt-[1.8vh] text-[2.05vw] leading-[1.18]">Jest suites cover auth policy, tenant boundaries, and validation</p>
          <p className="border-t border-primary/25 pt-[1.8vh] text-[2.05vw] leading-[1.18]">Swagger UI is served at /docs; health and readiness endpoints are available</p>
          <p className="border-t border-primary/25 pt-[1.8vh] text-[2.05vw] leading-[1.18]">Configure Redis and SESSION_SECRET for live authentication</p>
          <p className="border-t border-primary/25 pt-[1.8vh] text-[2.05vw] leading-[1.18]">Connect verified Stripe subscription events before activating paid tiers</p>
        </div>
      </div>
    </div>
  );
}
