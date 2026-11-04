export default function Sessions() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute right-0 top-0 h-[68vh] w-[40vw] rounded-bl-[35vw] bg-accent" />
      <div className="absolute right-[5vw] top-[12vh] h-[54vh] w-[29vw] rounded-bl-[24vw] border-[0.12vw] border-primary/25" />
      <div className="relative z-10 flex h-full flex-col px-[7vw] pt-[8vh] pb-[7vh]">
        <h2 className="max-w-[64vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">Sessions stay revocable</h2>
        <div className="relative mt-[10vh] h-[16vh]">
          <div className="absolute left-[4vw] right-[4vw] top-[7vh] h-[0.5vh] bg-primary/30" />
          <div className="absolute left-[4vw] top-[5.6vh] h-[3.2vh] w-[1.7vw] rounded-full bg-accent" />
          <div className="absolute left-[32vw] top-[5.6vh] h-[3.2vh] w-[1.7vw] rounded-full bg-accent" />
          <div className="absolute left-[61vw] top-[5.6vh] h-[3.2vh] w-[1.7vw] rounded-full bg-accent" />
          <div className="absolute left-[4vw] top-[5.7vh] h-[3vh] w-[1.7vw] rounded-full border-[0.3vw] border-primary" />
          <div className="absolute left-[32vw] top-[5.7vh] h-[3vh] w-[1.7vw] rounded-full border-[0.3vw] border-primary" />
          <div className="absolute left-[61vw] top-[5.7vh] h-[3vh] w-[1.7vw] rounded-full border-[0.3vw] border-primary" />
        </div>
        <div className="mt-[3vh] grid flex-1 grid-cols-2 gap-x-[5vw] gap-y-[3vh]">
          <p className="border-t border-primary/25 pt-[2.2vh] text-[2.05vw] leading-[1.2]">HS256 access tokens expire after 15 minutes</p>
          <p className="border-t border-primary/25 pt-[2.2vh] text-[2.05vw] leading-[1.2]">Refresh rotates tokens and extends the seven-day session</p>
          <p className="border-t border-primary/25 pt-[2.2vh] text-[2.05vw] leading-[1.2]">Redis supports immediate token and session revocation</p>
          <p className="border-t border-primary/25 pt-[2.2vh] text-[2.05vw] leading-[1.2]">Authentication fails closed when Redis is unavailable</p>
        </div>
      </div>
    </div>
  );
}
