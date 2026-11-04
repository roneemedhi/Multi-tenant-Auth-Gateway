export default function TenantIsolation() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text">
      <div className="absolute left-0 top-0 h-full w-[25vw] bg-primary" />
      <div className="absolute left-[25vw] top-0 h-full w-[9vw] bg-forest/15" />
      <div className="absolute inset-0 grid-lines opacity-50" />
      <div className="relative z-10 flex h-full flex-col px-[7vw] pt-[8vh] pb-[7vh]">
        <h2 className="max-w-[80vw] font-display text-[4vw] font-bold leading-[1.02] tracking-[-0.055em]">Tenant isolation is enforced in queries</h2>
        <div className="mt-[7vh] grid flex-1 grid-cols-[0.74fr_1.26fr] gap-[5vw]">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 top-[10vh] h-[64vh] w-[24vw] border-y-[0.16vw] border-accent/80" />
            <svg viewBox="0 0 470 600" className="relative z-10 h-[58vh] w-[24vw]" aria-hidden="true">
              <rect x="24" y="24" width="422" height="552" fill="#153C35" />
              <rect x="56" y="58" width="358" height="106" fill="#3F755A" />
              <rect x="56" y="190" width="358" height="106" fill="#B7D64A" />
              <rect x="56" y="322" width="358" height="106" fill="#3F755A" />
              <rect x="56" y="454" width="358" height="88" fill="#DCE3DC" />
              <path d="M112 111h244M112 243h244M112 375h244M112 498h244" stroke="#F3F5F2" strokeWidth="8" opacity=".75" />
              <path d="M80 82v54M390 214v54M80 346v54" stroke="#F3F5F2" strokeWidth="7" />
              <circle cx="384" cy="111" r="12" fill="#B7D64A" />
              <circle cx="80" cy="243" r="12" fill="#153C35" />
              <circle cx="384" cy="375" r="12" fill="#B7D64A" />
            </svg>
          </div>
          <div className="flex flex-col justify-center gap-[4vh] py-[2vh]">
            <div className="flex gap-[1.5vw]">
              <span className="h-[3.8vh] w-[0.42vw] shrink-0 bg-forest" />
              <p className="text-[2.2vw] leading-[1.22]">Every application table carries tenant_id</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="h-[3.8vh] w-[0.42vw] shrink-0 bg-forest" />
              <p className="text-[2.2vw] leading-[1.22]">Authenticated tenant context scopes reads and writes</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="h-[3.8vh] w-[0.42vw] shrink-0 bg-forest" />
              <p className="text-[2.2vw] leading-[1.22]">Membership and role lookups include the tenant boundary</p>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="h-[3.8vh] w-[0.42vw] shrink-0 bg-accent" />
              <p className="text-[2.2vw] font-semibold leading-[1.22]">Cross-tenant access is denied</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
