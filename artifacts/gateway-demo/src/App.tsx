import { type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useReadinessCheck } from '@workspace/api-client-react';
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Blocks, BookOpenCheck, Braces, Building2, Check, ChevronDown, CircleAlert, CircleCheck, CircleDashed, Clock3, Command, Copy, Database, Fingerprint, FlaskConical, KeyRound, Layers3, LockKeyhole, Network, RotateCcw, Search, Server, Shield, ShieldAlert, ShieldCheck, SlidersHorizontal, Terminal, Users, X } from 'lucide-react';
import { Link, Router as WouterRouter, useLocation } from 'wouter';

type Tenant = { id: string; name: string; plan: 'Free' | 'Premium'; customRoleCount: number };
type User = { id: string; tenantId: string; name: string; email: string; role: string; active: boolean };
type Role = { id: string; tenantId: string; name: string; permissions: string[]; builtIn: boolean };
type Session = { id: string; tenantId: string; userId: string; status: 'Active' | 'Revoked'; lastSeen: string };
type AuditEvent = { id: string; tenantId: string; action: string; result: string; createdAt: string };
type SimulationResult = { statusCode: number; allowed: boolean; reason: string; request: Record<string, unknown>; response: Record<string, unknown> };
type ReadinessResponse = { status: 'ready'; checks: Record<string, boolean> };

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
const seedTenants: Tenant[] = [
  { id: 'tn_northstar', name: 'Northstar Labs', plan: 'Premium', customRoleCount: 3 },
  { id: 'tn_fieldnote', name: 'Fieldnote Studio', plan: 'Free', customRoleCount: 2 },
  { id: 'tn_meridian', name: 'Meridian Health', plan: 'Premium', customRoleCount: 5 },
];
const seedUsers: User[] = [
  { id: 'usr_01H7K2', tenantId: 'tn_northstar', name: 'Mara Ellison', email: 'mara@northstar.example', role: 'Owner', active: true },
  { id: 'usr_01H7K8', tenantId: 'tn_northstar', name: 'Ilan Cho', email: 'ilan@northstar.example', role: 'Analyst', active: true },
  { id: 'usr_01H7M1', tenantId: 'tn_northstar', name: 'Nico Alvarez', email: 'nico@northstar.example', role: 'Billing admin', active: true },
  { id: 'usr_01H8A4', tenantId: 'tn_fieldnote', name: 'Priya Nair', email: 'priya@fieldnote.example', role: 'Owner', active: true },
  { id: 'usr_01H8A9', tenantId: 'tn_fieldnote', name: 'Theo Park', email: 'theo@fieldnote.example', role: 'Member', active: true },
  { id: 'usr_01H9B2', tenantId: 'tn_meridian', name: 'Ava Sinclair', email: 'ava@meridian.example', role: 'Owner', active: true },
  { id: 'usr_01H9B7', tenantId: 'tn_meridian', name: 'Omar Reed', email: 'omar@meridian.example', role: 'Auditor', active: false },
];
const seedRoles: Role[] = [
  { id: 'ns_owner', tenantId: 'tn_northstar', name: 'Owner', permissions: ['tenant:read', 'tenant:manage', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'ns_admin', tenantId: 'tn_northstar', name: 'Admin', permissions: ['tenant:read', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'ns_editor', tenantId: 'tn_northstar', name: 'Editor', permissions: ['tenant:read', 'roles:read', 'resources:read', 'resources:write'], builtIn: true },
  { id: 'ns_viewer', tenantId: 'tn_northstar', name: 'Viewer', permissions: ['tenant:read', 'roles:read', 'resources:read'], builtIn: true },
  { id: 'role_analyst', tenantId: 'tn_northstar', name: 'Analyst', permissions: ['tenant:read', 'resources:read', 'audit:read'], builtIn: false },
  { id: 'role_billing', tenantId: 'tn_northstar', name: 'Billing admin', permissions: ['tenant:read', 'users:read'], builtIn: false },
  { id: 'role_data_review', tenantId: 'tn_northstar', name: 'Data reviewer', permissions: ['tenant:read', 'resources:read', 'audit:read'], builtIn: false },
  { id: 'fn_owner', tenantId: 'tn_fieldnote', name: 'Owner', permissions: ['tenant:read', 'tenant:manage', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'fn_admin', tenantId: 'tn_fieldnote', name: 'Admin', permissions: ['tenant:read', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'fn_editor', tenantId: 'tn_fieldnote', name: 'Editor', permissions: ['tenant:read', 'roles:read', 'resources:read', 'resources:write'], builtIn: true },
  { id: 'fn_viewer', tenantId: 'tn_fieldnote', name: 'Viewer', permissions: ['tenant:read', 'roles:read', 'resources:read'], builtIn: true },
  { id: 'role_member', tenantId: 'tn_fieldnote', name: 'Member', permissions: ['resources:read'], builtIn: false },
  { id: 'role_operations', tenantId: 'tn_fieldnote', name: 'Operations', permissions: ['tenant:read', 'resources:read', 'resources:write'], builtIn: false },
  { id: 'md_owner', tenantId: 'tn_meridian', name: 'Owner', permissions: ['tenant:read', 'tenant:manage', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'md_admin', tenantId: 'tn_meridian', name: 'Admin', permissions: ['tenant:read', 'users:read', 'users:manage', 'roles:read', 'roles:create', 'roles:manage', 'resources:read', 'resources:write', 'audit:read', 'sessions:read', 'sessions:revoke'], builtIn: true },
  { id: 'md_editor', tenantId: 'tn_meridian', name: 'Editor', permissions: ['tenant:read', 'roles:read', 'resources:read', 'resources:write'], builtIn: true },
  { id: 'md_viewer', tenantId: 'tn_meridian', name: 'Viewer', permissions: ['tenant:read', 'roles:read', 'resources:read'], builtIn: true },
  { id: 'role_auditor', tenantId: 'tn_meridian', name: 'Auditor', permissions: ['tenant:read', 'resources:read', 'audit:read'], builtIn: false },
  { id: 'md_compliance', tenantId: 'tn_meridian', name: 'Compliance', permissions: ['tenant:read', 'audit:read', 'sessions:read'], builtIn: false },
  { id: 'md_analyst', tenantId: 'tn_meridian', name: 'Analyst', permissions: ['tenant:read', 'resources:read'], builtIn: false },
  { id: 'md_clinical', tenantId: 'tn_meridian', name: 'Clinical operations', permissions: ['tenant:read', 'resources:read', 'resources:write'], builtIn: false },
  { id: 'md_integration', tenantId: 'tn_meridian', name: 'Service integration', permissions: ['resources:read', 'resources:write'], builtIn: false },
];
const seedSessions: Session[] = [
  { id: 'ses_9f2c1a', tenantId: 'tn_northstar', userId: 'usr_01H7K2', status: 'Active', lastSeen: '2 min ago' },
  { id: 'ses_14a0d8', tenantId: 'tn_northstar', userId: 'usr_01H7K8', status: 'Active', lastSeen: '18 min ago' },
  { id: 'ses_b4027e', tenantId: 'tn_fieldnote', userId: 'usr_01H8A4', status: 'Active', lastSeen: '1 hr ago' },
  { id: 'ses_c91a33', tenantId: 'tn_meridian', userId: 'usr_01H9B7', status: 'Active', lastSeen: 'Yesterday' },
];
const seedEvents: AuditEvent[] = [
  { id: 'evt_001', tenantId: 'tn_northstar', action: 'roles.permission_check', result: 'allowed', createdAt: 'Today · 10:42:18' },
  { id: 'evt_002', tenantId: 'tn_fieldnote', action: 'tenant.resource_read', result: 'denied', createdAt: 'Today · 10:39:04' },
  { id: 'evt_003', tenantId: 'tn_meridian', action: 'session.revoked', result: 'simulated', createdAt: 'Today · 09:17:52' },
  { id: 'evt_004', tenantId: 'tn_northstar', action: 'roles.custom_limit', result: 'denied', createdAt: 'Yesterday · 16:08:11' },
];
const scenarios = [
  { id: 'permission', label: 'Permission check', note: 'Does the current role hold the requested permission?' },
  { id: 'cross-tenant', label: 'Cross-tenant read', note: 'Can a principal read a resource owned by another tenant?' },
  { id: 'free-limit', label: 'Free plan role limit', note: 'What happens when a Free tenant creates another custom role?' },
  { id: 'premium-limit', label: 'Premium plan role limit', note: 'Check the Premium custom-role ceiling.' },
  { id: 'revoke', label: 'Revoke session', note: 'Simulate immediate revocation in the local session fixture.' },
];

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Console /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Console() {
  const [location, setLocation] = useLocation();
  const [tenants, setTenants] = useState(seedTenants);
  const [users, setUsers] = useState(seedUsers);
  const [roles, setRoles] = useState(seedRoles);
  const [sessions, setSessions] = useState(seedSessions);
  const [events, setEvents] = useState(seedEvents);
  const [activeTenant, setActiveTenant] = useState(seedTenants[0].id);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'sessions' | 'audit'>('users');
  const [scenario, setScenario] = useState('permission');
  const [principalId, setPrincipalId] = useState(seedUsers[1].id);
  const [permission, setPermission] = useState('resources:read');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [search, setSearch] = useState('');
  const readiness = useReadinessCheck<{ status: 'ready'; checks: Record<string, boolean> }>();
  const selectedScenario = scenarios.find((item) => item.id === scenario)!;
  const filteredUsers = users.filter((user) => (user.name + user.email + user.role).toLowerCase().includes(search.toLowerCase()));
  const activeSessions = sessions.filter((session) => session.status === 'Active').length;
  const path = location === '/' ? '/' : location.replace(/\/$/, '');

  function resetDemo() {
    setTenants(seedTenants); setUsers(seedUsers); setRoles(seedRoles); setSessions(seedSessions); setEvents(seedEvents);
    setActiveTenant(seedTenants[0].id); setActiveTab('users'); setScenario('permission'); setPrincipalId(seedUsers[1].id);
    setPermission('resources:read'); setResult(null); setSearch('');
  }

  function runSimulation() {
    const user = users.find((item) => item.id === principalId) ?? users[0];
    const tenant = tenants.find((item) => item.id === user.tenantId) ?? tenants[0];
    const role = roles.find((item) => item.tenantId === tenant.id && item.name === user.role);
    let allowed = false; let statusCode = 403; let reason = '';
    let eventTenantId = user.tenantId;
    let createdRole: Role | null = null;
    let request: Record<string, unknown> = { method: 'GET', path: '/v1/resources/ledger', principal: user.id, tenantId: tenant.id };
    if (scenario === 'permission') {
      allowed = !!role?.permissions.includes(permission) && user.active;
      statusCode = allowed ? 200 : 403;
      reason = !user.active ? 'Principal is inactive; authorization stops before permission evaluation.' : allowed ? `${role?.name} includes ${permission}; tenant scope matches the resource.` : `${role?.name ?? 'Assigned role'} does not grant ${permission}.`;
      request = { ...request, action: permission, role: role?.name };
    } else if (scenario === 'cross-tenant') {
      const target = tenants.find((item) => item.id !== tenant.id)!;
      statusCode = 403; allowed = false; reason = `Tenant boundary mismatch: principal belongs to ${tenant.id}, resource belongs to ${target.id}. The request is denied before resource lookup.`;
      request = { ...request, resourceTenantId: target.id, action: 'resources:read' };
    } else if (scenario === 'free-limit' || scenario === 'premium-limit') {
      const target = tenants.find((item) => item.plan === (scenario === 'free-limit' ? 'Free' : 'Premium'))!;
      eventTenantId = target.id;
      const max = target.plan === 'Free' ? 3 : Number.POSITIVE_INFINITY;
      const nextCount = target.customRoleCount + 1;
      allowed = nextCount <= max; statusCode = allowed ? 201 : 402;
      reason = allowed
        ? target.plan === 'Free'
          ? `Free permits 3 custom roles. This local action creates role ${nextCount} of 3.`
          : `Premium has unlimited custom roles. This local action creates role ${nextCount}.`
        : `Free plan limit reached (${target.customRoleCount}/3 custom roles). No role was created.`;
      request = { method: 'POST', path: '/api/roles', tenantId: target.id, currentCustomRoles: target.customRoleCount, plan: target.plan, simulatedCreate: true };
      if (allowed) {
        const id = `role_demo_${Date.now()}`;
        createdRole = { id, tenantId: target.id, name: `Demo role ${nextCount}`, permissions: ['resources:read'], builtIn: false };
        setTenants((current) => current.map((item) => item.id === target.id ? { ...item, customRoleCount: nextCount } : item));
        setRoles((current) => [...current, createdRole!]);
      }
    } else {
      const targetSession = sessions.find((item) => item.userId === user.id && item.status === 'Active');
      allowed = !!targetSession; statusCode = allowed ? 200 : 404;
      reason = allowed ? `Session ${targetSession!.id} is marked revoked in browser memory. No token or backend session was touched.` : 'No active fixture session exists for this principal.';
      request = { method: 'POST', path: `/api/sessions/${targetSession?.id ?? '{sessionId}'}/revoke`, tenantId: tenant.id, sessionId: targetSession?.id ?? null, simulated: true };
      if (targetSession) setSessions((current) => current.map((item) => item.id === targetSession.id ? { ...item, status: 'Revoked' } : item));
    }
    const response = { status: statusCode, allowed, reason, ...(createdRole ? { createdRole } : {}) };
    setResult({ statusCode, allowed, reason, request, response });
    const event: AuditEvent = { id: `evt_sim_${Date.now()}`, tenantId: eventTenantId, action: `simulation.${scenario}`, result: allowed ? 'allowed' : 'denied', createdAt: 'Just now' };
    setEvents((current) => [event, ...current]);
  }

  return <div className="min-h-[100dvh] bg-[#edf3f2] text-[#142a32]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#17343c] text-[#d6e4e2] md:flex">
      <div className="flex h-[74px] items-center gap-3 border-b border-white/10 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#d7f179] text-[#17343c]"><ShieldCheck size={19}/></div>
        <div><div className="text-[14px] font-extrabold tracking-tight text-white">TENANT GATEWAY</div><div className="mono text-[9px] tracking-[.2em] text-[#8da7a8]">CONTROL CONSOLE</div></div>
      </div>
      <div className="mx-4 mt-5 rounded-lg border border-[#f1b85c]/35 bg-[#e9a840]/10 px-3 py-2.5" data-testid="status-simulation-banner">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.15em] text-[#f5c06d]"><FlaskConical size={13}/> Simulation mode</div>
        <p className="mt-1 text-[11px] leading-relaxed text-[#b5c8c7]">Fixtures only. No identity or billing changes reach a service.</p>
      </div>
      <div className="px-5 pb-2 pt-7 mono text-[9px] uppercase tracking-[.18em] text-[#7f9a9c]">Workspace</div>
      <nav className="space-y-1 px-3">
        <NavItem href="/" active={path === '/'} icon={<Activity size={16}/>} label="Overview"/>
        <NavItem href="/playground" active={path === '/playground'} icon={<Terminal size={16}/>} label="Request playground" badge="LIVE"/>
        <NavItem href="/directory" active={path === '/directory'} icon={<Users size={16}/>} label="Directory"/>
        <NavItem href="/integrations" active={path === '/integrations'} icon={<Blocks size={16}/>} label="Integrations"/>
      </nav>
      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2 px-1 text-[11px] text-[#a9bfbd]"><span className="h-1.5 w-1.5 rounded-full bg-[#a6d85d]"/><span>Local fixture state</span><span className="ml-auto mono text-[9px]">VOLATILE</span></div>
        <button onClick={resetDemo} data-testid="button-reset-demo" className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-white/10"><RotateCcw size={13}/> Reset demo state</button>
      </div>
    </aside>
    <main className="min-h-[100dvh] md:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-[#d7e1df] bg-[#edf3f2]/95 px-4 backdrop-blur md:px-8">
        <div className="flex items-center gap-2 text-[11px] text-[#718287]"><span className="mono">GATEWAY</span><span>/</span><strong className="text-[#203b42]">{path === '/' ? 'Overview' : path.slice(1).replace('-', ' ')}</strong></div>
        <div className="flex items-center gap-3"><div className="hidden items-center gap-2 rounded-full border border-[#e5b35d]/50 bg-[#fff8e7] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.11em] text-[#866019] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#d99b2c]"/> SIMULATED ENVIRONMENT</div><span className="mono hidden text-[10px] text-[#789095] sm:block">DEMO-01 · v0.4</span><button onClick={resetDemo} aria-label="Reset demo" data-testid="button-reset-top" className="grid h-8 w-8 place-items-center rounded-md border border-[#d7e1df] bg-white text-[#476067] hover:bg-[#f8fbfa]"><RotateCcw size={14}/></button></div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-[#d7e1df] bg-[#f6faf8] px-3 py-2 md:hidden" aria-label="Primary navigation">
        <NavItem href="/" active={path === '/'} icon={<Activity size={14}/>} label="Overview"/>
        <NavItem href="/playground" active={path === '/playground'} icon={<Terminal size={14}/>} label="Playground"/>
        <NavItem href="/directory" active={path === '/directory'} icon={<Users size={14}/>} label="Directory"/>
        <NavItem href="/integrations" active={path === '/integrations'} icon={<Blocks size={14}/>} label="Integrations"/>
      </nav>
      <div className="mx-auto max-w-[1440px] p-4 md:px-8 md:py-7">
        {path === '/' && <Overview tenants={tenants} sessions={sessions} readiness={readiness}/>}
        {path === '/playground' && <Playground tenants={tenants} users={users} sessions={sessions} activeTenant={activeTenant} setActiveTenant={setActiveTenant} scenario={scenario} setScenario={setScenario} selectedScenario={selectedScenario} principalId={principalId} setPrincipalId={setPrincipalId} permission={permission} setPermission={setPermission} result={result} runSimulation={runSimulation}/>}
        {path === '/directory' && <Directory tenants={tenants} users={filteredUsers} roles={roles} sessions={sessions} events={events} activeTab={activeTab} setActiveTab={setActiveTab} search={search} setSearch={setSearch} setSessions={setSessions} setEvents={setEvents} setResult={setResult}/>}
        {path === '/integrations' && <Integrations readiness={readiness}/>}
        {!['/', '/playground', '/directory', '/integrations'].includes(path) && <NotFoundPage goHome={() => setLocation('/')}/>}
      </div>
    </main>
  </div>;
}

function NavItem({ href, active, icon, label, badge }: { href: string; active: boolean; icon: ReactNode; label: string; badge?: string }) {
  return <Link href={href} data-testid={`link-nav-${href === '/' ? 'overview' : href.slice(1)}`} className={`flex h-10 items-center gap-3 rounded-md px-3 text-[12px] font-semibold transition ${active ? 'bg-[#264951] text-white shadow-inner' : 'text-[#aec3c1] hover:bg-white/5 hover:text-white'}`}>
    <span className={active ? 'text-[#d7f179]' : 'text-[#89a4a3]'}>{icon}</span><span>{label}</span>{badge && <span className="ml-auto rounded bg-[#d7f179]/15 px-1.5 py-0.5 mono text-[8px] tracking-wider text-[#d7f179]">{badge}</span>}
  </Link>;
}

function PageHeading({ eyebrow, title, detail, right }: { eyebrow: string; title: string; detail: string; right?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 border-b border-[#d5e0de] pb-5 sm:flex-row sm:items-end"><div><div className="mb-2 mono text-[9px] font-medium uppercase tracking-[.19em] text-[#13846d]">{eyebrow}</div><h1 className="text-[26px] font-extrabold leading-tight tracking-[-.04em] text-[#19343c] md:text-[32px]">{title}</h1><p className="mt-1.5 max-w-2xl text-[12px] leading-relaxed text-[#718287]">{detail}</p></div>{right}</div>;
}

function Overview({ tenants, sessions, readiness }: { tenants: Tenant[]; sessions: Session[]; readiness: ReturnType<typeof useReadinessCheck<ReadinessResponse>> }) {
  const checks = readiness.data?.checks ?? {};
  const services = Object.entries(checks);
  return <div className="rise-in">
    <PageHeading eyebrow="01 / System posture" title="Tenant boundary overview" detail="A live view of the demo topology. Identity records below are fabricated fixtures; readiness is the only service-backed signal." right={<div className="flex items-center gap-2 rounded-md border border-[#b8d7c9] bg-[#e4f3e9] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-[#28734c]"><span className="h-1.5 w-1.5 rounded-full bg-[#53a66b]"/> Read-only probe</div>}/>
    <section className="surface-grid relative mb-6 overflow-hidden rounded-xl bg-[#193b43] p-5 text-[#edf5f2] md:p-7">
      <div className="absolute -right-8 -top-10 h-48 w-48 rounded-full border border-[#d7f179]/15"/><div className="absolute -right-2 top-1 h-36 w-36 rounded-full border border-[#d7f179]/10"/>
      <div className="relative grid gap-6 md:grid-cols-[1.2fr_.8fr] md:items-center">
        <div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#d7f179]"><Shield size={14}/> Isolation test environment</div><h2 className="mt-3 max-w-xl text-[23px] font-extrabold leading-tight tracking-[-.035em] md:text-[28px]">Trust boundaries, made inspectable.</h2><p className="mt-2 max-w-xl text-[12px] leading-relaxed text-[#b6cbca]">Run authorization scenarios against realistic tenant fixtures. Every decision includes its policy reason and a structured request / response trace.</p><Link href="/playground" data-testid="link-open-playground" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#d7f179] px-4 py-2.5 text-[11px] font-extrabold text-[#18363d] transition hover:bg-[#e3ff8c]">Open request playground <ArrowRight size={14}/></Link></div>
        <div className="grid grid-cols-2 gap-2 md:pl-8"><Metric dark label="Sample tenants" value="03" foot="Free + Premium tiers"/><Metric dark label="Fixture identities" value="07" foot="Across 3 boundaries"/><Metric dark label="Active sessions" value={String(sessions.filter((session) => session.status === 'Active').length).padStart(2, '0')} foot="Browser memory only"/><Metric dark label="Mutation routes" value="0" foot="Deliberately not called"/></div>
      </div>
    </section>
    <div className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <section className="rounded-xl border border-[#dbe4e2] bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-[13px] font-extrabold">Tenant fixtures</div><div className="mt-1 text-[10px] text-[#869699]">Isolated sample organizations · wholly simulated</div></div><span className="mono rounded bg-[#eef4f2] px-2 py-1 text-[9px] text-[#657c80]">3 SEEDS</span></div>
        <div className="space-y-2">{tenants.map((tenant, i) => <div key={tenant.id} data-testid={`card-tenant-${tenant.id}`} className="flex items-center gap-3 rounded-lg border border-[#e7edeb] px-3 py-3 transition hover:border-[#b7d5cb]">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-[#edf5f1] text-[#207c65]"><Building2 size={16}/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[12px] font-bold">{tenant.name}</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${tenant.plan === 'Premium' ? 'bg-[#fff4d9] text-[#8e661a]' : 'bg-[#eaf0f1] text-[#60767a]'}`}>{tenant.plan}</span></div><div className="mono mt-1 text-[9px] text-[#899a9c]">{tenant.id} · {usersCount(tenant.id)} fixture users</div></div><div className="text-right"><div className="mono text-[12px] font-medium">{tenant.customRoleCount}<span className="text-[#9aa9aa]"> / {tenant.plan === 'Free' ? '3' : '∞'}</span></div><div className="text-[9px] text-[#899a9c]">custom roles</div></div><div className="hidden w-20 sm:block">{tenant.plan === 'Free' ? <div className="h-1.5 overflow-hidden rounded-full bg-[#ebf0ee]"><div className="h-full rounded-full bg-[#3d9e7e]" style={{ width: `${Math.min(100, tenant.customRoleCount / 3 * 100)}%` }}/></div> : <span className="mono text-[8px] text-[#4c8e77]">NO CAP</span>}</div><span className="mono text-[9px] text-[#9aa9aa]">0{i + 1}</span>
        </div>)}</div>
      </section>
      <section className="rounded-xl border border-[#dbe4e2] bg-white p-5">
        <div className="mb-4 flex items-center justify-between"><div><div className="text-[13px] font-extrabold">Dependency readiness</div><div className="mt-1 text-[10px] text-[#869699]">Actual read-only /api/readyz response</div></div><Database size={16} className="text-[#18856b]"/></div>
        {readiness.isLoading ? <div className="space-y-3 py-3" aria-label="Loading readiness"><div className="h-3 w-3/4 animate-pulse rounded bg-[#e7efec]"/><div className="h-3 w-2/3 animate-pulse rounded bg-[#e7efec]"/><div className="h-3 w-4/5 animate-pulse rounded bg-[#e7efec]"/></div> : readiness.isError ? <div className="rounded-lg border border-[#f0d0c7] bg-[#fff4f0] p-3" data-testid="status-readiness-error"><div className="flex items-center gap-2 text-[11px] font-bold text-[#a14839]"><CircleAlert size={15}/> Probe unavailable</div><p className="mt-1 text-[10px] text-[#9b746e]">Could not read readiness endpoint. This does not change simulation behavior.</p><button onClick={() => readiness.refetch()} data-testid="button-retry-readiness" className="mt-2 text-[10px] font-bold text-[#a14839] underline">Retry probe</button></div> : <div className="space-y-2">{services.length ? services.map(([name, ready]) => <div key={name} className="flex items-center gap-2 rounded-md bg-[#f6f9f8] px-3 py-2.5" data-testid={`status-dependency-${name}`}><span className={`grid h-5 w-5 place-items-center rounded-full ${ready ? 'bg-[#e4f3e9] text-[#3a8957]' : 'bg-[#fff0e8] text-[#b46243]'}`}>{ready ? <Check size={12}/> : <X size={12}/>}</span><span className="flex-1 text-[11px] font-semibold capitalize">{name.replace(/[_-]/g, ' ')}</span><span className={`mono text-[9px] uppercase ${ready ? 'text-[#408759]' : 'text-[#ad6852]'}`}>{ready ? 'READY' : 'NOT READY'}</span></div>) : <div className="rounded-md bg-[#f6f9f8] px-3 py-3 text-[10px] text-[#809194]">Readiness response contained no dependency checks.</div>}<div className="mono pt-1 text-[9px] text-[#9aa9aa]">STATUS: {readiness.data?.status?.toUpperCase() ?? 'UNKNOWN'} · LIVE SIGNAL</div></div>}
      </section>
    </div>
    <div className="mt-5 grid gap-4 sm:grid-cols-3"><InfoTile icon={<LockKeyhole size={16}/>} title="Tenant-scoped by default" detail="Every simulated principal and target has an explicit tenant ID."/><InfoTile icon={<BookOpenCheck size={16}/>} title="Explainable decisions" detail="Allow and deny outcomes include the exact boundary or policy reason."/><InfoTile icon={<RotateCcw size={16}/>} title="Nothing persists" detail="Reset restores the original browser-only fixture snapshot."/></div>
  </div>;
}
function usersCount(tenantId: string) { return seedUsers.filter((user) => user.tenantId === tenantId).length; }

function Metric({ label, value, foot, dark }: { label: string; value: string; foot: string; dark?: boolean }) {
  return <div className={`rounded-lg border p-3 ${dark ? 'border-white/10 bg-white/[.045]' : 'border-[#dce6e3] bg-white'}`}><div className={`text-[9px] font-bold uppercase tracking-[.12em] ${dark ? 'text-[#a8c1bd]' : 'text-[#819296]'}`}>{label}</div><div className={`mt-1 text-[23px] font-extrabold tracking-[-.04em] ${dark ? 'text-white' : 'text-[#1b3c43]'}`}>{value}</div><div className={`mt-0.5 text-[9px] ${dark ? 'text-[#8da8a6]' : 'text-[#8c9b9d]'}`}>{foot}</div></div>;
}
function InfoTile({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return <div className="flex gap-3 rounded-lg border border-[#dce6e3] bg-[#f8fbfa] p-4"><div className="mt-0.5 text-[#17836d]">{icon}</div><div><div className="text-[11px] font-extrabold">{title}</div><div className="mt-1 text-[10px] leading-relaxed text-[#819194]">{detail}</div></div></div>;
}

function Playground(props: { tenants: Tenant[]; users: User[]; sessions: Session[]; activeTenant: string; setActiveTenant: (id: string) => void; scenario: string; setScenario: (id: string) => void; selectedScenario: { id: string; label: string; note: string }; principalId: string; setPrincipalId: (id: string) => void; permission: string; setPermission: (id: string) => void; result: SimulationResult | null; runSimulation: () => void }) {
  const scopedUsers = props.users.filter((user) => user.tenantId === props.activeTenant);
  const principal = scopedUsers.find((user) => user.id === props.principalId) ?? scopedUsers[0] ?? props.users[0];
  const principalTenant = principal?.tenantId ?? props.activeTenant;
  const session = props.sessions.find((item) => item.userId === props.principalId && item.status === 'Active');
  const inputClass = 'w-full rounded-md border border-[#d6e1df] bg-[#fbfdfc] px-3 py-2.5 text-[11px] text-[#244249] focus:border-[#2a9a7c] focus:outline-none focus:ring-2 focus:ring-[#2a9a7c]/15';
  return <div className="rise-in">
    <PageHeading eyebrow="02 / Policy lab" title="Request playground" detail="Build a request, evaluate it against local fixtures, and inspect the authorization explanation. No simulator action reaches the API." right={<div className="inline-flex items-center gap-2 rounded-md border border-[#f0d49a] bg-[#fff8e8] px-3 py-2 mono text-[9px] uppercase tracking-wider text-[#8c681e]"><FlaskConical size={13}/> Local simulator</div>}/>
    <div className="mb-5 grid gap-4 sm:grid-cols-3"><div className="sm:col-span-2 rounded-lg border border-[#e5d8b4] bg-[#fff9e9] px-4 py-3"><div className="flex gap-2.5"><CircleAlert size={15} className="mt-0.5 shrink-0 text-[#b17a1f]"/><div><div className="text-[11px] font-extrabold text-[#72551e]">Simulation only — no live authorization</div><p className="mt-1 text-[10px] leading-relaxed text-[#8d7950]">Results are computed in this browser using fixture records. They are not a security assessment or production decision.</p></div></div></div><div className="rounded-lg border border-[#dce6e3] bg-white p-3"><div className="mono text-[9px] uppercase tracking-wider text-[#819296]">Boundaries enforced</div><div className="mt-2 flex flex-wrap gap-1.5"><span className="tag">tenant scope</span><span className="tag">role grants</span><span className="tag">plan limits</span></div></div></div>
    <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <section className="overflow-hidden rounded-xl border border-[#d9e3e1] bg-white">
        <div className="flex items-center gap-3 border-b border-[#e8eeec] px-5 py-4"><div className="grid h-8 w-8 place-items-center rounded-md bg-[#eaf5f0] text-[#19816a]"><SlidersHorizontal size={15}/></div><div><div className="text-[12px] font-extrabold">Request parameters</div><div className="mono mt-0.5 text-[9px] text-[#91a0a2]">FORM / FIXTURE INPUT</div></div><span className="ml-auto mono text-[9px] text-[#a2b0b0]">01</span></div>
        <div className="space-y-4 p-5">
          <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#50666a]">Test scenario</span><select className={inputClass} value={props.scenario} onChange={(e) => props.setScenario(e.target.value)} data-testid="select-scenario">{scenarios.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span className="mt-1.5 block text-[10px] text-[#8c9b9d]">{props.selectedScenario.note}</span></label>
           {props.scenario !== 'free-limit' && props.scenario !== 'premium-limit' && <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#50666a]">Principal tenant</span><select className={inputClass} value={props.activeTenant} onChange={(e) => { props.setActiveTenant(e.target.value); const firstUser = props.users.find((user) => user.tenantId === e.target.value); if (firstUser) props.setPrincipalId(firstUser.id); }} data-testid="select-active-tenant">{props.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name} · {tenant.plan}</option>)}</select></label>}
           {props.scenario !== 'free-limit' && props.scenario !== 'premium-limit' && <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#50666a]">Principal fixture</span><select className={inputClass} value={principal?.id ?? ''} onChange={(e) => props.setPrincipalId(e.target.value)} data-testid="select-principal">{scopedUsers.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.role}</option>)}</select><span className="mono mt-1.5 block text-[9px] text-[#9aa8a9]">{principal?.id} · tenant {principalTenant}</span></label>}
           {props.scenario === 'permission' && <label className="block"><span className="mb-1.5 block text-[10px] font-bold text-[#50666a]">Required permission</span><select className={inputClass} value={props.permission} onChange={(e) => props.setPermission(e.target.value)} data-testid="select-permission">{['tenant:read','tenant:manage','users:read','users:manage','roles:read','roles:create','roles:manage','resources:read','resources:write','audit:read','sessions:read','sessions:revoke'].map((permission) => <option key={permission} value={permission}>{permission}</option>)}</select></label>}
          {props.scenario === 'revoke' && <div className="rounded-md border border-[#e5ece9] bg-[#f6f9f8] p-3"><div className="text-[10px] font-bold text-[#486166]">Target session</div><div className="mono mt-1 text-[11px] text-[#1e4c4c]">{session?.id ?? 'No active session'}</div><div className="mt-1 text-[9px] text-[#89999b]">Current fixture status: {session?.status ?? 'not found'}</div></div>}
          <div className="rounded-md border border-dashed border-[#d5e1de] p-3"><div className="mb-2 flex items-center gap-1.5 mono text-[9px] uppercase tracking-wider text-[#88999b]"><Braces size={12}/> Evaluation context</div><div className="grid grid-cols-2 gap-y-2 text-[10px]"><span className="text-[#879799]">Tenant boundary</span><span className="mono text-right text-[#4d676b]">{props.scenario === 'free-limit' || props.scenario === 'premium-limit' ? 'plan fixture' : principalTenant}</span><span className="text-[#879799]">External call</span><span className="mono text-right text-[#2c805c]">none</span></div></div>
          <button onClick={props.runSimulation} data-testid="button-run-simulation" className="flex w-full items-center justify-center gap-2 rounded-md bg-[#147c67] px-4 py-3 text-[11px] font-extrabold text-white transition hover:bg-[#0d6b58] active:translate-y-px"><Terminal size={14}/> Run simulation <ArrowRight size={14}/></button>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-[#d9e3e1] bg-[#18353d] text-[#e3efec]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4"><div className="grid h-8 w-8 place-items-center rounded-md bg-[#d7f179] text-[#19373d]"><Braces size={15}/></div><div><div className="text-[12px] font-extrabold text-white">Decision trace</div><div className="mono mt-0.5 text-[9px] text-[#89a5a5]">JSON-LIKE · SIMULATED RESPONSE</div></div><span className="ml-auto flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 mono text-[8px] text-[#b4c8c5]"><span className="h-1.5 w-1.5 rounded-full bg-[#e8b34d]"/> FIXTURE</span></div>
        {!props.result ? <div className="flex min-h-[400px] flex-col items-center justify-center px-8 text-center"><div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[.04] text-[#a6c1bd]"><Command size={20}/></div><div className="mt-4 text-[13px] font-bold text-white">Awaiting request</div><p className="mt-1 max-w-xs text-[10px] leading-relaxed text-[#91a9a9]">Choose a scenario and run it to see the full request payload, status, and reasoned decision.</p><div className="mt-5 flex items-center gap-2 mono text-[9px] text-[#668486]"><span className="h-px w-7 bg-[#446368]"/> OUTPUT AREA <span className="h-px w-7 bg-[#446368]"/></div></div> :
          <div className="p-5 rise-in">
            <div className={`mb-4 flex items-center gap-3 rounded-md border px-3 py-3 ${props.result.allowed ? 'border-[#4b9b79]/30 bg-[#164c43]' : 'border-[#dc8d73]/30 bg-[#593c3a]'}`}><div className={`grid h-8 w-8 place-items-center rounded-full ${props.result.allowed ? 'bg-[#2e8668] text-[#e6fff3]' : 'bg-[#b7614c] text-white'}`}>{props.result.allowed ? <CircleCheck size={17}/> : <ShieldAlert size={17}/>}</div><div className="flex-1"><div className="text-[11px] font-extrabold text-white">{props.result.allowed ? 'Request allowed' : 'Request denied'}</div><div className="mt-0.5 text-[9px] text-[#c1d4ce]">Decision computed from simulated fixture policy</div></div><div className={`mono text-[18px] font-medium ${props.result.allowed ? 'text-[#bce68e]' : 'text-[#f0ab91]'}`}>{props.result.statusCode}</div></div>
            <div className="mb-4 rounded-md border border-white/10 bg-[#10282e] p-3.5"><div className="mb-2 flex items-center gap-2 mono text-[9px] uppercase tracking-wider text-[#94b5b1]"><CircleAlert size={12}/> Why this happened</div><p className="text-[11px] leading-relaxed text-[#e1eae7]" data-testid="text-decision-reason">{props.result.reason}</p></div>
            <JsonBlock label="REQUEST" value={props.result.request}/><JsonBlock label="RESPONSE" value={props.result.response}/>
            <div className="mt-4 flex items-start gap-2 border-t border-white/10 pt-3 text-[9px] leading-relaxed text-[#8ea8a7]"><Fingerprint size={12} className="mt-0.5 shrink-0"/>Local simulation result — not an authorization decision from the gateway.</div>
          </div>}
      </section>
    </div>
    <style>{`.tag{border-radius:4px;background:#eef4f2;padding:4px 7px;font-family:var(--app-font-mono);font-size:9px;color:#60767a}`}</style>
  </div>;
}

function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> }) {
  return <div className="mb-3 rounded-md border border-white/10 bg-[#10282e] p-3"><div className="mb-2 mono text-[8px] font-medium tracking-[.16em] text-[#769a9a]">{label}</div><pre className="overflow-x-auto whitespace-pre-wrap break-all mono text-[10px] leading-[1.75] text-[#cfdfda]">{JSON.stringify(value, null, 2)}</pre></div>;
}

function Directory(props: { tenants: Tenant[]; users: User[]; roles: Role[]; sessions: Session[]; events: AuditEvent[]; activeTab: 'users' | 'roles' | 'sessions' | 'audit'; setActiveTab: (tab: 'users' | 'roles' | 'sessions' | 'audit') => void; search: string; setSearch: (value: string) => void; setSessions: React.Dispatch<React.SetStateAction<Session[]>>; setEvents: React.Dispatch<React.SetStateAction<AuditEvent[]>>; setResult: React.Dispatch<React.SetStateAction<SimulationResult | null>> }) {
  const [tenantFilter, setTenantFilter] = useState('all');
  const visibleUsers = props.users.filter((user) => tenantFilter === 'all' || user.tenantId === tenantFilter);
  const tabs = [{ id: 'users', label: 'Users', icon: <Users size={14}/> }, { id: 'roles', label: 'Roles & permissions', icon: <KeyRound size={14}/> }, { id: 'sessions', label: 'Sessions', icon: <Clock3 size={14}/> }, { id: 'audit', label: 'Audit events', icon: <BookOpenCheck size={14}/> }] as const;
  function revoke(session: Session) {
    props.setSessions((current) => current.map((item) => item.id === session.id ? { ...item, status: 'Revoked' } : item));
    props.setEvents((current) => [{ id: `evt_sim_${Date.now()}`, tenantId: session.tenantId, action: 'simulation.session.revoked', result: 'simulated', createdAt: 'Just now' }, ...current]);
    props.setResult({ statusCode: 200, allowed: true, reason: `Session ${session.id} marked revoked in browser fixture state. No backend session was changed.`, request: { method: 'POST', path: '/v1/sessions/revoke', sessionId: session.id, simulated: true }, response: { status: 'revoked', simulated: true } });
  }
  return <div className="rise-in">
    <PageHeading eyebrow="03 / Identity fixtures" title="Directory" detail="Browse the fabricated identities, role grants, browser-only sessions, and simulated audit trail used by the policy lab." right={<span className="rounded-md border border-[#e5d8b4] bg-[#fff8e8] px-3 py-2 mono text-[9px] uppercase tracking-wider text-[#8c681e]">Simulated data</span>}/>
    <div className="mb-5 grid gap-3 sm:grid-cols-4"><Metric label="Fixture users" value="07" foot="3 tenants"/><Metric label="Role definitions" value={String(props.roles.length).padStart(2,'0')} foot="Built-in + custom"/><Metric label="Live fixture sessions" value={String(props.sessions.filter((s) => s.status === 'Active').length).padStart(2,'0')} foot="Revocation is local"/><Metric label="Audit events" value={String(props.events.length).padStart(2,'0')} foot="Includes this demo run"/></div>
    <section className="overflow-hidden rounded-xl border border-[#d9e3e1] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eeec] px-4 pt-3 md:px-5"><div className="flex gap-1 overflow-x-auto">{tabs.map((tab) => <button key={tab.id} onClick={() => props.setActiveTab(tab.id)} data-testid={`tab-directory-${tab.id}`} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[10px] font-bold transition ${props.activeTab === tab.id ? 'border-[#16816a] text-[#177961]' : 'border-transparent text-[#819194] hover:text-[#304c52]'}`}>{tab.icon}{tab.label}</button>)}</div><div className="flex items-center gap-2 pb-2"><select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} data-testid="filter-directory-tenant" className="rounded-md border border-[#dce5e3] bg-[#fbfdfc] px-2 py-2 text-[10px] text-[#587075]"><option value="all">All tenants</option>{props.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</select>{props.activeTab === 'users' && <div className="relative"><Search size={13} className="absolute left-2.5 top-2.5 text-[#9aa9aa]"/><input value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Find user…" data-testid="input-directory-search" className="w-[150px] rounded-md border border-[#dce5e3] bg-[#fbfdfc] py-2 pl-8 pr-2 text-[10px] focus:border-[#2a9a7c] focus:outline-none"/></div>}</div></div>
      <div className="overflow-x-auto">{props.activeTab === 'users' && <table className="w-full min-w-[700px] text-left"><thead className="bg-[#f6f9f8] mono text-[8px] uppercase tracking-[.14em] text-[#8b9c9e]"><tr><th className="px-5 py-3">Identity</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Access</th><th className="px-4 py-3">Fixture ID</th></tr></thead><tbody>{visibleUsers.map((user) => <tr key={user.id} data-testid={`row-user-${user.id}`} className="border-t border-[#edf1f0] hover:bg-[#fbfdfc]"><td className="px-5 py-3"><div className="flex items-center gap-2.5"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#e8f2ee] text-[10px] font-extrabold text-[#277662]">{user.name.split(' ').map((part) => part[0]).join('')}</div><div><div className="text-[11px] font-bold">{user.name}</div><div className="text-[9px] text-[#87989a]">{user.email}</div></div></div></td><td className="px-4 py-3 text-[10px] text-[#5e7579]">{props.tenants.find((t) => t.id === user.tenantId)?.name}</td><td className="px-4 py-3"><span className="rounded bg-[#eef4f2] px-2 py-1 text-[9px] font-semibold text-[#536e72]">{user.role}</span></td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-[9px] ${user.active ? 'text-[#408659]' : 'text-[#b56c56]'}`}><span className={`h-1.5 w-1.5 rounded-full ${user.active ? 'bg-[#56a773]' : 'bg-[#d77e61]'}`}/>{user.active ? 'Active' : 'Inactive'}</span></td><td className="px-4 py-3 mono text-[9px] text-[#839496]">{user.id}</td></tr>)}</tbody></table>}
        {props.activeTab === 'roles' && <table className="w-full min-w-[760px] text-left"><thead className="bg-[#f6f9f8] mono text-[8px] uppercase tracking-[.14em] text-[#8b9c9e]"><tr><th className="px-5 py-3">Role</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Permission grants</th></tr></thead><tbody>{props.roles.filter((r) => tenantFilter === 'all' || r.tenantId === tenantFilter).map((role) => <tr key={role.id} data-testid={`row-role-${role.id}`} className="border-t border-[#edf1f0] align-top"><td className="px-5 py-3 text-[11px] font-bold">{role.name}<div className="mono mt-1 text-[9px] font-normal text-[#89999b]">{role.id}</div></td><td className="px-4 py-3 text-[10px] text-[#5e7579]">{props.tenants.find((t) => t.id === role.tenantId)?.name}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[9px] ${role.builtIn ? 'bg-[#eaf3f1] text-[#4b7470]' : 'bg-[#fff4d9] text-[#8e661a]'}`}>{role.builtIn ? 'Built-in' : 'Custom fixture'}</span></td><td className="px-4 py-3"><div className="flex max-w-[490px] flex-wrap gap-1">{role.permissions.map((permission) => <span key={permission} className="rounded bg-[#f0f5f3] px-1.5 py-1 mono text-[8px] text-[#597276]">{permission}</span>)}</div></td></tr>)}</tbody></table>}
        {props.activeTab === 'sessions' && <table className="w-full min-w-[700px] text-left"><thead className="bg-[#f6f9f8] mono text-[8px] uppercase tracking-[.14em] text-[#8b9c9e]"><tr><th className="px-5 py-3">Session</th><th className="px-4 py-3">Principal</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Last seen</th><th className="px-4 py-3">Status / action</th></tr></thead><tbody>{props.sessions.filter((s) => tenantFilter === 'all' || s.tenantId === tenantFilter).map((session) => <tr key={session.id} data-testid={`row-session-${session.id}`} className="border-t border-[#edf1f0]"><td className="px-5 py-3 mono text-[10px]">{session.id}</td><td className="px-4 py-3 text-[10px]">{seedUsers.find((u) => u.id === session.userId)?.name}</td><td className="px-4 py-3 text-[10px] text-[#5e7579]">{props.tenants.find((t) => t.id === session.tenantId)?.name}</td><td className="px-4 py-3 text-[10px] text-[#839496]">{session.lastSeen}</td><td className="px-4 py-3">{session.status === 'Active' ? <button onClick={() => revoke(session)} data-testid={`button-revoke-${session.id}`} className="rounded border border-[#f0d6ce] px-2 py-1 text-[9px] font-bold text-[#a65342] hover:bg-[#fff3ef]">Simulate revoke</button> : <span className="rounded bg-[#f2e9e5] px-2 py-1 text-[9px] font-bold text-[#a45e4e]">Revoked · simulated</span>}</td></tr>)}</tbody></table>}
        {props.activeTab === 'audit' && <table className="w-full min-w-[650px] text-left"><thead className="bg-[#f6f9f8] mono text-[8px] uppercase tracking-[.14em] text-[#8b9c9e]"><tr><th className="px-5 py-3">Event</th><th className="px-4 py-3">Tenant</th><th className="px-4 py-3">Outcome</th><th className="px-4 py-3">Timestamp</th></tr></thead><tbody>{props.events.filter((event) => tenantFilter === 'all' || event.tenantId === tenantFilter).map((event) => <tr key={event.id} data-testid={`row-event-${event.id}`} className="border-t border-[#edf1f0]"><td className="px-5 py-3"><div className="text-[10px] font-semibold">{event.action}</div><div className="mono mt-1 text-[8px] text-[#98a6a7]">{event.id}</div></td><td className="px-4 py-3 text-[10px] text-[#5e7579]">{props.tenants.find((t) => t.id === event.tenantId)?.name}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 mono text-[8px] ${event.result === 'allowed' ? 'bg-[#e7f4e9] text-[#3b8354]' : event.result === 'denied' ? 'bg-[#fff0e9] text-[#a55742]' : 'bg-[#fff4d9] text-[#8e661a]'}`}>{event.result}</span></td><td className="px-4 py-3 text-[9px] text-[#87989a]">{event.createdAt}</td></tr>)}</tbody></table>}
        {props.activeTab === 'users' && visibleUsers.length === 0 && <EmptyState text="No fixture users match those filters."/>}
      </div>
      <div className="flex items-center justify-between border-t border-[#e8eeec] bg-[#fbfdfc] px-5 py-3"><div className="mono text-[9px] text-[#8a9a9c]">SIMULATED FIXTURE DATA · NOT CONNECTED TO LIVE DIRECTORY</div><div className="text-[9px] text-[#8a9a9c]">Local state only</div></div>
    </section>
  </div>;
}

function EmptyState({ text }: { text: string }) { return <div className="p-12 text-center"><div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#eff4f2] text-[#799294]"><Search size={16}/></div><p className="mt-3 text-[11px] text-[#788d90]">{text}</p></div>; }

function Integrations({ readiness }: { readiness: ReturnType<typeof useReadinessCheck<ReadinessResponse>> }) {
  const checks = readiness.data?.checks ?? {};
  return <div className="rise-in">
    <PageHeading eyebrow="04 / Dependency map" title="Integrations" detail="Production dependencies are intentionally unavailable in this demo. Here is what the real readiness probe reports—and what the simulator substitutes." right={<div className="flex items-center gap-2 rounded border border-[#e4c6b7] bg-[#fff2eb] px-3 py-2 mono text-[9px] uppercase tracking-wider text-[#a25f49]"><CircleDashed size={13}/> Not connected</div>}/>
    {readiness.isError && <div className="mb-4 flex items-center justify-between rounded-lg border border-[#efcfc6] bg-[#fff5f1] p-3 text-[10px] text-[#9f5746]" data-testid="status-integrations-error"><span>Read-only readiness probe did not return. Integration states below remain explanatory demo labels.</span><button onClick={() => readiness.refetch()} data-testid="button-retry-integrations" className="font-bold underline">Retry</button></div>}
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-4">
        <IntegrationCard icon={<Database size={18}/>} name="Redis session store" kind="Authentication dependency" state={checks.redis === undefined ? (readiness.isLoading ? 'Checking' : 'Unavailable') : checks.redis ? 'Ready' : 'Unavailable'} stateType={checks.redis ? 'good' : 'warn'} detail="Production session caching and immediate revocation require Redis. The demo never opens a Redis connection." simulated="Session records are plain in-memory fixtures. Revocation changes only a local status field."/>
        <IntegrationCard icon={<Blocks size={18}/>} name="Stripe billing" kind="Plan source" state="Not connected" stateType="quiet" detail="A production deployment would verify a tenant subscription and entitlement source. This console has no Stripe integration." simulated="Free and Premium tiers are hard-coded fixture values that drive the role-limit examples."/>
        <IntegrationCard icon={<Server size={18}/>} name="API gateway" kind="Authorization enforcement" state="Bypassed" stateType="quiet" detail="No simulator scenario makes a request to authentication, user, role, session, or billing mutation endpoints." simulated="Policy outcomes are generated locally from sample role permissions and tenant IDs."/>
      </div>
      <section className="overflow-hidden rounded-xl border border-[#d8e2e0] bg-white">
        <div className="border-b border-[#e7eeec] px-5 py-4"><div className="text-[12px] font-extrabold">Readiness endpoint</div><div className="mono mt-1 text-[9px] text-[#829396]">GET /api/readyz · READ ONLY</div></div>
        <div className="p-5"><div className="mb-4 rounded-md bg-[#193b43] p-4 text-[#d5e8e2]"><div className="flex items-center gap-2 mono text-[9px] text-[#a2c4bd]"><Activity size={12}/> LIVE BACKEND SIGNAL</div><pre className="mt-3 overflow-x-auto mono text-[10px] leading-[1.8]">{JSON.stringify(readiness.data ? { status: readiness.data.status, checks: readiness.data.checks } : readiness.isLoading ? { status: 'checking' } : { status: 'unavailable' }, null, 2)}</pre></div>
          {readiness.isLoading ? <div className="space-y-2"><div className="h-3 w-3/4 animate-pulse rounded bg-[#e8efed]"/><div className="h-3 w-1/2 animate-pulse rounded bg-[#e8efed]"/></div> : Object.entries(checks).map(([key, value]) => <div key={key} className="flex items-center gap-2 border-b border-[#edf1ef] py-2.5 text-[10px]"><span className={`h-1.5 w-1.5 rounded-full ${value ? 'bg-[#4b9a68]' : 'bg-[#d07c59]'}`}/><span className="flex-1 capitalize text-[#536a6e]">{key.replace(/[_-]/g, ' ')}</span><span className={`mono text-[9px] ${value ? 'text-[#42845b]' : 'text-[#a8664d]'}`}>{value ? 'READY' : 'NOT READY'}</span></div>)}
          {readiness.isError && <div className="text-[10px] text-[#9b746e]">Endpoint unavailable. Retry from this panel or the overview.</div>}
          <div className="mt-4 flex gap-2 rounded-md bg-[#f3f7f5] p-3 text-[9px] leading-relaxed text-[#75898c]"><ShieldCheck size={13} className="mt-0.5 shrink-0 text-[#19816a]"/>Only readiness is service-backed. Every user, session, permission, and decision shown elsewhere is simulated and ephemeral.</div>
        </div>
      </section>
    </div>
    <div className="mt-5 rounded-xl border border-[#dbe4e2] bg-[#f7faf9] p-5"><div className="flex items-center gap-2 text-[11px] font-extrabold"><Network size={15} className="text-[#19816a]"/> Data boundary map</div><div className="mt-4 grid gap-3 md:grid-cols-3"><BoundaryCard title="Actual network" value="GET /api/readyz" note="Read-only dependency readiness query." color="green"/><BoundaryCard title="Browser fixture state" value="Users · roles · sessions · audit" note="Seeded in memory; reset restores original samples." color="amber"/><BoundaryCard title="Never called here" value="Auth · role · revoke · billing mutations" note="Generated mutation hooks intentionally unused." color="rose"/></div></div>
  </div>;
}
function IntegrationCard({ icon, name, kind, state, stateType, detail, simulated }: { icon: ReactNode; name: string; kind: string; state: string; stateType: string; detail: string; simulated: string }) {
  return <section className="rounded-xl border border-[#d9e3e1] bg-white p-5"><div className="flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#edf4f2] text-[#147c67]">{icon}</div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-[12px] font-extrabold">{name}</h2><span className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${stateType === 'good' ? 'bg-[#e7f4e9] text-[#42845b]' : stateType === 'warn' ? 'bg-[#fff0e9] text-[#a55742]' : 'bg-[#eef2f1] text-[#75888b]'}`}>{state}</span></div><div className="mt-1 text-[9px] text-[#87989a]">{kind}</div></div></div><p className="mt-4 text-[10px] leading-relaxed text-[#667d81]">{detail}</p><div className="mt-3 rounded-md border-l-2 border-[#d5ab59] bg-[#fff9eb] px-3 py-2 text-[9px] leading-relaxed text-[#806d46]"><strong className="mr-1 text-[#72591e]">Demo substitute:</strong>{simulated}</div></section>;
}
function BoundaryCard({ title, value, note, color }: { title: string; value: string; note: string; color: string }) {
  const border = color === 'green' ? 'border-[#b9d7c7]' : color === 'amber' ? 'border-[#e8d5a9]' : 'border-[#e7c8bf]';
  return <div className={`rounded-lg border ${border} bg-white p-3`}><div className="mono text-[8px] uppercase tracking-wider text-[#829396]">{title}</div><div className="mt-2 text-[10px] font-extrabold">{value}</div><div className="mt-1 text-[9px] leading-relaxed text-[#829396]">{note}</div></div>;
}
function NotFoundPage({ goHome }: { goHome: () => void }) { return <div className="mx-auto max-w-lg py-24 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e5efeb] text-[#17816b]"><Search size={20}/></div><h1 className="mt-4 text-xl font-extrabold">Route not found</h1><p className="mt-2 text-[11px] text-[#778b8e]">This console only exposes the documented demo surfaces.</p><button onClick={goHome} data-testid="button-notfound-home" className="mt-5 rounded-md bg-[#147c67] px-4 py-2 text-[10px] font-bold text-white">Back to overview</button></div>; }

export default App;
