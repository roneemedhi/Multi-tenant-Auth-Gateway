# Tenant Auth Gateway — Project Film

## Director's treatment
- **Promise:** One request enters; tenant identity, role policy, and live session state decide whether it can pass.
- **Identity:** An editorial systems film, not a company brand film. Deep blue-green, bone, acid chartreuse, and restrained amber; Space Grotesk display, DM Sans supporting copy, JetBrains Mono for protocol labels.
- **Hero:** A single luminous request packet traveling through a tenant boundary, permission gate, and Redis session plane.
- **Motion:** Camera push-throughs along the packet's route; split-panel policy comparisons; type and wireframe elements that assemble around real architecture.
- **Arc:** A sharp isolation hook opens into the request path, then widens to show security, roles, and session lifecycle before landing on honest project scope.
- **Payoff:** The three-tenant topology folds into one clear system diagram, then resolves to a restrained project lockup rather than another feature shot.
- **Format:** 16:9 landscape.

## Full shot script

| Shot | Time | Focus | Motion event | Composition | Handoff |
|---|---:|---|---|---|---|
| 01 | 0.00–4.80 | A request hits a boundary | Packet impact, boundary draws, deny/allow split | Asymmetric, huge clipped word + diagram | Packet becomes a request trace |
| 02 | 4.80–9.10 | Token/session request path | Token layers orbit then snap into a route | Macro protocol schematic, diagonal flow | Session node expands into a cache plane |
| 03 | 9.10–13.90 | Redis revocation and rate limits | Cache branches pulse; revoked session collapses | Wide network topology, amber event | Boundary line becomes tenant partition |
| 04 | 13.90–18.75 | Tenant-scoped authorization | Three lanes; cross-tenant packet is stopped | Horizontal triptych then macro denial | Permission matrix shards into role tiles |
| 05 | 18.75–23.55 | Roles and plan limits | Built-ins arrange; Free cap closes; Premium opens | Dense typographic role matrix with moving rule | Open rule bends into sliding refresh loop |
| 06 | 23.55–27.85 | Access + refresh lifecycle | 15-minute access token expires; 7-day session rotates | Giant clock/ring mechanism | Ring expands into final overview |
| 07 | 27.85–33.00 | System overview and honest scope | Three tenants assemble; subscription gap remains outlined | Calm, centered architectural lockup | Boundary ring contracts to opening packet |

### Shot 01 / 0.00–4.80s / 4.80s — “WHO GETS THROUGH?”
**Purpose:** Establish that authorization is a boundary decision, not merely a login screen.
**Exact content:** At 0.08s, “A REQUEST.” appears at 0.5–1.0s; “A TENANT.” replaces it at 1.0–1.55s; “A BOUNDARY.” lands at 1.55–2.35s. At 2.55s, labels “ALLOW” and “DENY” appear on opposite sides of the boundary. Keep the small footer “TENANT AUTH GATEWAY / PROJECT FILM” visible from 0.15s through 4.2s.
**Composition:** Dark blue-green field. A bright mint request capsule occupies the center-right and is about 35% of frame height; a thin vertical boundary sits just right of center. Giant 20vmin type anchors left with 5% inset. The outgoing frame has the packet enlarged to 1.35x, crossing toward lens center.
**Artistic idea:** A single request is physically divided by a tenant boundary; the word “BOUNDARY” is cut by the same line.
**Timed choreography:** 0.00–0.20s packet impact with a stiff snap; line begins drawing at 0.24s. 0.45–1.0s first phrase masks on from behind the boundary. 1.0–1.55s phrase swaps with two tight type punches. 1.55–2.35s “BOUNDARY” scales to 20vmin while the line slices through its center. 2.55–3.35s ALLOW / DENY labels materialize sequentially; packet attempts crossing and deflects once. 3.45–4.60s packet surges through camera, blurs and dims as a small trace chip stays visible.
**Transition contract:** The packet center persists into shot 02 as the first row of a request trace; combine scale-through with a vertical line split and carry the same mint capsule.
**Assets and technique:** No brand assets. CSS/SVG packet and rule, masked type, deterministic dotted field; no external imagery.
**Sound intent:** Instrumental electronic pulse; first impact accent aligned to bed if supported. No VO or SFX requested.

### Shot 02 / 4.80–9.10s / 4.30s — “SIGNED. SCOPED. SHORT-LIVED.”
**Purpose:** Make token validation concrete without implying that a JWT alone is the session.
**Exact content:** Header “REQUEST PATH” at 4.95s. Labels “HS256” at 5.20s, “ISSUER + AUDIENCE” at 5.95s, “15 MIN ACCESS” at 6.75s, “SESSION ID” at 7.45s. At 8.25s final line “SIGNATURE VALID ≠ SESSION ACTIVE” remains through 8.9s.
**Composition:** A broad diagonal route runs lower-left to upper-right across the frame. A large outlined token plane fills the center, with three nested claim layers; small supporting labels own the perimeter, never adjacent to the main type. Palette flips to pale bone behind dark green token geometry.
**Artistic idea:** Token claims behave like transparent layers that only align when signature, issuer/audience, and time fit together.
**Timed choreography:** 0.00–0.35s opening route line tracks the carried packet. 0.45–1.05s three token planes snap into alignment, each with a short rotational settle. 1.15–1.75s HS256 stamps onto the signature layer. 1.85–2.45s issuer/audience guides draw and lock to the frame. 2.55–3.05s “15 MIN ACCESS” appears as a short shrinking time bar. 3.15–3.65s session ID node lights separately from the token. 3.7–4.2s final contrast line types on while the session node is pulled toward the viewer.
**Transition contract:** Session node scales through the lens; a pale panel unfolds into the Redis plane, retaining the same circular session ID mark. Compound transition: push-through plus split-unfold.
**Assets and technique:** SVG claim planes, clipped route, text masks and vector ticks; no logos or implied cryptographic proof beyond supplied project facts.
**Sound intent:** Continue instrumental with crisp rhythmic accents; sync cuts only after onset analysis.

### Shot 03 / 9.10–13.90s / 4.80s — “SESSION STATE LIVES BEYOND THE TOKEN.”
**Purpose:** Show the role of Redis-backed cache, revocation, and rate limits.
**Exact content:** At 9.25s header “REDIS-BACKED SESSION PLANE”. At 9.8s label “ACTIVE SESSION”. At 10.7s “REVOKED SID → DENY”. At 11.7s “JTI / SID REVOCATION”. At 12.55s “RATE LIMIT → 429”. Footer “DEPENDENCY FAILURE → 503” appears 13.1s–13.7s.
**Composition:** Wide central cache plane with three horizontal signal rails, dark field and amber revocation event. Session node lands left; a cached tenant/user tuple sits center; revoked sid branch terminates on right. Header occupies upper-left and remains clear of the diagram.
**Artistic idea:** Revocation is a cut in the signal path, not a crossed-out token icon.
**Timed choreography:** 0.00–0.4s circular sid node expands into a three-rail cache grid. 0.5–1.25s active session pulse runs through the top rail to a green endpoint. 1.45–2.15s amber revoke marker drops onto middle rail and its endpoint shutters closed. 2.3–3.0s token-id and session-id branches diverge; one by one both are blocked. 3.1–3.75s rate counter increments as a small group of four requests arrives, fifth is stopped. 3.8–4.8s camera tracks along the tenant-keyed rail into a full-width partition boundary.
**Transition contract:** The moving tenant-key rail transforms into a hard partition line; use camera push plus a foreground panel wipe, carrying that exact line into shot 04.
**Assets and technique:** SVG rails, node pulses and deterministic particles; amber only flags denial/failure, never decoration.
**Sound intent:** Instrumental continues; revocation beat gets a percussive accent if onset analysis supports it.

### Shot 04 / 13.90–18.75s / 4.85s — “TENANT SCOPE IS THE FIRST FILTER.”
**Purpose:** Communicate tenant isolation and scoped data access.
**Exact content:** Top-left “TENANT-SCOPED QUERIES”. Three tenant labels at 14.3s: “NORTHSTAR LABS”, “FIELDNOTE STUDIO”, “MERIDIAN HEALTH”. At 15.1s, “SAME REQUEST. DIFFERENT TENANT.” At 16.4s, the cross-tenant result reads “403 / FORBIDDEN”. At 17.35s footer “SCOPE BEFORE RESOURCE ACCESS”.
**Composition:** Three lanes occupy three unequal horizontal bands (top and bottom narrow, middle dominant). Each lane has its own muted tint and boundary; the middle has the request packet. A packet crosses toward the wrong lane and is intercepted at its boundary. Oversized “403” lands in a compact side zone.
**Artistic idea:** The three organization lanes are adjacent in frame but the data paths never connect; a forbidden crossing is visibly cut off before the resource glyph.
**Timed choreography:** 0.00–0.4s carried boundary line branches into three stacked lanes. 0.5–1.2s tenant IDs resolve sequentially beside the real sample names. 1.35–2.0s same mint packet travels within its own lane; camera tracks with it. 2.15–2.75s packet turns across a tenant boundary, hits a sharp barrier and stops. 2.85–3.5s 403 expands to 14vmin and settles while resource glyph stays untouched behind the line. 3.55–4.6s lanes shear inward into a permission grid, retaining the blocked packet as a square cell.
**Transition contract:** Three lanes fold into permission columns; carry the blocked packet as the first denied cell. Combine split-fold with an impact type reveal.
**Assets and technique:** Vector tenant lanes and resource marks, CSS line masks, no imported brand marks.
**Sound intent:** Low instrumental pulse with a dry stop accent, planned only; no separate SFX.

### Shot 05 / 18.75–23.55s / 4.80s — “FOUR BUILT-IN ROLES. ROOM TO EXTEND.”
**Purpose:** Show the role model and correct plan limit behavior.
**Exact content:** Built-in labels “OWNER”, “ADMIN”, “EDITOR”, “VIEWER” appear 19.0–20.25s. At 20.35s “FREE · 3 CUSTOM ROLES” appears; at 21.35s the fourth custom-role tile meets a closing rule and is labeled “CAP”. At 22.15s “PREMIUM · UNLIMITED CUSTOM ROLES” stretches along the opening rule through 23.25s.
**Composition:** Four tall role tiles form an uneven matrix on a bone ground, with permission ticks as quiet texture. The Free plan is a short bounded rail in lower-left. Premium is an expansive, open line to the right. Large role names use 7–9vmin; no three-card marketing arrangement.
**Artistic idea:** Permission roles are not colored badges; a single rule literally limits one plan while continuing unbounded for another.
**Timed choreography:** 0.00–0.35s incoming denied cell rotates and becomes a role tile. 0.4–1.25s four built-in roles stamp in a brisk left-to-right sequence with each permission footprint changing. 1.35–2.15s three custom-role blocks fill the Free rail; a fourth approaches, touches the cap, and rebounds. 2.25–3.1s Premium rail extends across the frame and accepts successive role marks without closing. 3.2–4.0s “Owner / Admin / Editor / Viewer” remain readable as camera pushes to the open rail. 4.0–4.8s rail curls into a refresh-session loop.
**Transition contract:** Premium rail curls to form a circular refresh track, transitioning through the ring into shot 06; the Free cap line withdraws as a secondary shear.
**Assets and technique:** Typographic role tiles, deterministic permission ticks, track masks. No fabricated plan price/benefit or payment status.
**Sound intent:** Brighter instrumental lift over Premium rail; confirm beats after generation.

### Shot 06 / 23.55–27.85s / 4.30s — “15 MINUTES. THEN ROTATE.”
**Purpose:** Clarify the short-lived access token and seven-day sliding refresh session.
**Exact content:** At 23.7s “ACCESS TOKEN” with “15 MIN” appears. At 24.65s token ring contracts and label “EXPIRES” appears. At 25.1s “REFRESH SESSION” and “7 DAYS · SLIDING” appear. At 26.1s old refresh token hash is replaced; at 26.95s “ROTATE → NEW ACCESS” appears through 27.7s.
**Composition:** Oversized time wheel centered slightly right, 58% of frame height, divided into a short bright arc and a long muted loop. Type occupies left safe column. Background returns to deep blue-green, but with a crisp circular graphic system distinct from earlier lanes.
**Artistic idea:** The short access-token arc disappears while a much larger seven-day loop remains alive and rotates its refresh credential.
**Timed choreography:** 0.00–0.45s carried rail completes a ring with a quick eased closure. 0.5–1.2s short 15-minute arc illuminates; access token slug rides it. 1.25–1.7s arc drains to zero and slug extinguishes. 1.85–2.55s seven-day outer loop blooms into view and receives the active session ID. 2.65–3.35s old refresh hash flips into a new hash block while expiry marker slides forward. 3.45–4.0s a new 15-minute access arc spins out from the long loop. 4.0–4.6s wheel pushes forward and opens into the final architectural view.
**Transition contract:** Ring scale-through plus nested circular aperture; three tenant nodes appear behind it without an empty frame.
**Assets and technique:** SVG clock arcs and hash blocks, type masking and route choreography; no actual token strings or secrets displayed.
**Sound intent:** Main lift at refresh rotation if a usable onset exists.

### Shot 07 / 27.85–33.00s / 5.15s — “ONE GATEWAY. THREE TENANTS.”
**Purpose:** Resolve the system model and state the known implementation boundary honestly.
**Exact content:** At 28.0s central title “TENANT AUTH GATEWAY”. At 28.65s three names appear around gateway node: “NORTHSTAR LABS”, “FIELDNOTE STUDIO”, “MERIDIAN HEALTH”. At 29.65s architecture strip reads “NODE / EXPRESS · POSTGRESQL · REDIS”. At 30.55s line “ROLES · SESSIONS · TENANT SCOPE”. At 31.4s “STRIPE SYNC NOT CONNECTED” appears as an outlined amber note; at 32.2s “LOCAL DEMO FIXTURES ONLY” appears. Keep all final copy stable and legible to 32.65s, then begin closing contraction to 33.0s.
**Composition:** Calm centered topology: gateway hub at center, three tenant nodes on an asymmetric orbit. A narrow architecture line sits across lower third; scope note sits in a separate upper-right region. Final layout is not the same as the opening: small, resolved, centered against warm bone, with a single dark-green ring.
**Artistic idea:** The opening boundary ring becomes a map connecting three distinct tenants, while the disconnected subscription sync remains deliberately unfilled.
**Timed choreography:** 0.00–0.45s ring aperture reveals the hub with three nodes already inside the safe frame. 0.55–1.1s title assembles from separated letter groups. 1.2–1.9s tenant names orbit into three distinct anchors, connected by fine paths. 2.0–2.7s architecture line resolves one layer at a time. 2.8–3.5s scope line appears, then amber Stripe note outlines but does not fill. 3.6–4.15s local-fixture qualifier appears; nodes settle into clear held topology. 4.2–5.0s ring contracts around the center packet until it matches shot 01's first packet scale/position; title remains until last 0.3s, then snaps away with the packet.
**Transition contract:** The final packet contracts into shot 01's initial bright capsule at the exact center-right coordinate, while the outer ring disappears through an inverse aperture; frame one begins with packet impact, so loop handoff has no blank tail.
**Assets and technique:** SVG topology, CSS masks, typography. No real company brand logo and no invented Stripe connection or performance claim.
**Sound intent:** Resolved instrumental ending with a soft loop-friendly tail; no added VO/SFX.

## Audio spec
- Runtime: 33 s (SCENE_DURATIONS total)
- Music: restrained driving electronic instrumental for a security systems film, 112 BPM, analog bass pulse, dry hand percussion, restrained granular synth, confident but measured; patient first 4 seconds, stronger accents near 9, 18, 23 and 28 seconds, resolved seamless-feeling ending. No vocals, no harsh highs.
- Playback file: bg_music.mp3
- Production note: the music-generation callback required paid-mode confirmation unavailable in this delegated run. A locally synthesized instrumental bed was used instead; it contains no voices or sampled third-party audio.
- Beat alignment: measured onsets at 4.80, 9.10, 13.90, 18.75, 23.55, and 27.85s; cuts were moved to those onsets. Total runtime remains 33s.
