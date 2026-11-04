export default function OneGateway() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute inset-y-0 right-0 w-[32vw] bg-accent" />
      <div className="absolute right-[7vw] top-[13vh] h-[74vh] w-[18vw] border-[0.12vw] border-primary/25" />
      <div className="absolute right-[11vw] top-[24vh] h-[52vh] w-[10vw] border-[0.12vw] border-primary/25" />
      <div className="absolute right-[14vw] top-[43vh] h-[14vh] w-[4vw] rounded-full bg-primary" />
      <div className="relative z-10 flex h-full flex-col px-[7vw] pt-[8vh] pb-[7vh]">
        <h2 className="max-w-[73vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">One gateway, clear boundaries</h2>
        <div className="mt-[7vh] grid flex-1 grid-cols-[1fr_0.68fr] gap-[5vw]">
          <div className="flex flex-col justify-between py-[1vh]">
            <div className="flex gap-[1.4vw] border-b border-primary/20 pb-[2.8vh]">
              <span className="mt-[0.7vh] h-[1.15vw] w-[1.15vw] shrink-0 bg-forest" />
              <p className="max-w-[48vw] text-[2.15vw] leading-[1.2]">Express API routes registration, login, refresh, logout, and tenant operations</p>
            </div>
            <div className="flex gap-[1.4vw] border-b border-primary/20 py-[2.8vh]">
              <span className="mt-[0.7vh] h-[1.15vw] w-[1.15vw] shrink-0 bg-forest" />
              <p className="max-w-[48vw] text-[2.15vw] leading-[1.2]">PostgreSQL stores tenant-scoped users, roles, memberships, sessions, and audit events</p>
            </div>
            <div className="flex gap-[1.4vw] border-b border-primary/20 py-[2.8vh]">
              <span className="mt-[0.7vh] h-[1.15vw] w-[1.15vw] shrink-0 bg-forest" />
              <p className="max-w-[48vw] text-[2.15vw] leading-[1.2]">Redis backs live sessions, revocation, and rate limits</p>
            </div>
            <div className="flex gap-[1.4vw] pt-[2.8vh]">
              <span className="mt-[0.7vh] h-[1.15vw] w-[1.15vw] shrink-0 bg-forest" />
              <p className="max-w-[48vw] text-[2.15vw] leading-[1.2]">OpenAPI contracts generate Zod schemas and interactive Swagger docs</p>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 480 660" className="h-[58vh] w-[22vw]" aria-hidden="true">
              <path d="M240 78v104M240 286v93M240 467v105M85 232h310M85 422h310" fill="none" stroke="#153C35" strokeWidth="4" opacity=".38" />
              <rect x="90" y="32" width="300" height="110" rx="8" fill="#153C35" />
              <rect x="136" y="213" width="208" height="104" rx="4" fill="#3F755A" />
              <rect x="36" y="376" width="184" height="92" rx="4" fill="#DCE3DC" stroke="#153C35" strokeWidth="3" />
              <rect x="260" y="376" width="184" height="92" rx="4" fill="#DCE3DC" stroke="#153C35" strokeWidth="3" />
              <rect x="136" y="565" width="208" height="70" rx="35" fill="#B7D64A" />
              <circle cx="240" cy="88" r="12" fill="#B7D64A" />
              <circle cx="240" cy="265" r="12" fill="#B7D64A" />
              <circle cx="128" cy="422" r="9" fill="#3F755A" />
              <circle cx="352" cy="422" r="9" fill="#3F755A" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
