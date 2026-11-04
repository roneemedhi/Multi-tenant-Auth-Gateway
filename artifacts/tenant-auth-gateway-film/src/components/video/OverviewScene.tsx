import { motion } from 'framer-motion';
import { Foot, Kicker, SceneShell } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;
const nodes = [
  { title: 'NORTHSTAR LABS', x: '18%', y: '31%' },
  { title: 'FIELDNOTE STUDIO', x: '76%', y: '26%' },
  { title: 'MERIDIAN HEALTH', x: '72%', y: '72%' },
];

export function OverviewScene() {
  return (
    <SceneShell palette="bone" className="overview-scene">
      <div className="scene-safe">
        <Kicker>07 / Project overview</Kicker>
        <motion.h1 className="overview-title scene-title" initial={{ opacity: 0, y: 28, letterSpacing: '-.1em' }} animate={{ opacity: 1, y: 0, letterSpacing: '-.075em' }} transition={{ delay: 0.2, duration: 0.58, ease }}>
          TENANT AUTH<br />GATEWAY
        </motion.h1>
        <div className="overview-map">
          <svg className="overview-links" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
            <motion.path d="M500 250 C360 180 280 160 180 160 M500 250 C650 170 730 145 790 135 M500 250 C630 325 710 365 760 365" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 8" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.58 }} transition={{ delay: 0.65, duration: 0.9, ease }} />
          </svg>
          <motion.div className="gateway-hub" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 0.7, ease }}>
            <span className="hub-core" /><b>GATEWAY</b>
          </motion.div>
          {nodes.map((node, index) => (
            <motion.div key={node.title} className={`overview-tenant overview-tenant--${index}`} style={{ left: node.x, top: node.y }} initial={{ opacity: 0, scale: 0.68 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.85 + index * 0.22, duration: 0.48, ease }}>
              <span className="tenant-pin" /><strong>{node.title}</strong>
            </motion.div>
          ))}
        </div>
        <motion.div className="overview-architecture" initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 1.9, duration: 0.56, ease }}>
          <span>NODE / EXPRESS</span><i /><span>POSTGRESQL</span><i /><span>REDIS</span>
        </motion.div>
        <motion.div className="overview-scope" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.45, duration: 0.4 }}>
          ROLES <b>·</b> SESSIONS <b>·</b> TENANT SCOPE
        </motion.div>
        <motion.div className="scope-note" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 3.12, duration: 0.35 }}>
          STRIPE SYNC NOT CONNECTED
        </motion.div>
        <motion.div className="fixture-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.87, duration: 0.3 }}>
          LOCAL DEMO FIXTURES ONLY
        </motion.div>
        <motion.div className="overview-loop-close" initial={{ opacity: 0, scale: 11 }} animate={{ opacity: [0, 1, 1], scale: [11, 1.25, 0.9] }} transition={{ delay: 4.2, duration: 0.75, times: [0, 0.66, 1], ease }} aria-hidden="true" />
        <Foot />
      </div>
    </SceneShell>
  );
}
