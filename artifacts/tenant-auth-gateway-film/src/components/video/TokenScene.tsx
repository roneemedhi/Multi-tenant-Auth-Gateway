import { motion } from 'framer-motion';
import { Foot, Kicker, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;
const claims = [
  { label: 'HS256', tag: 'SIGNATURE', rotate: -6, x: -2.8, y: -1.6, color: '#d6f16b' },
  { label: 'ISSUER + AUDIENCE', tag: 'TRUST CONTEXT', rotate: 2.5, x: 1.1, y: 0.4, color: '#f0b962' },
  { label: '15 MIN ACCESS', tag: 'EXPIRY', rotate: 6, x: 4.1, y: 2.1, color: '#7eb6a8' },
];

export function TokenScene() {
  return (
    <SceneShell palette="bone" className="token-scene">
      <div className="scene-safe">
        <Kicker>02 / Request path</Kicker>
        <motion.div className="token-orbit" initial={{ rotate: -18, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.8, ease }}>
          <div className="token-orbit-ring token-orbit-ring--outer" />
          <div className="token-orbit-ring token-orbit-ring--inner" />
          {claims.map((claim, index) => (
            <motion.div
              key={claim.label}
              className={`claim-plane claim-plane--${index}`}
              style={{ borderColor: claim.color, ['--claim-color' as string]: claim.color }}
              initial={{ opacity: 0, x: 68, y: -22, rotate: claim.rotate * 2 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: claim.rotate }}
              transition={{ delay: 0.23 + index * 0.22, duration: 0.62, ease }}
            >
              <span className="claim-tag">{claim.tag}</span>
              <strong>{claim.label}</strong>
              <i />
            </motion.div>
          ))}
          <motion.div className="token-core" {...rise} transition={{ ...rise.transition, delay: 0.95 }}>JWT</motion.div>
        </motion.div>
        <motion.div className="token-title" {...rise} transition={{ ...rise.transition, delay: 0.25 }}>
          <div className="scene-label">SIGNED. SCOPED.</div>
          <h1 className="scene-title">SHORT-<br />LIVED.</h1>
        </motion.div>
        <div className="token-path">
          <motion.div className="token-path-line" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1.65, duration: 0.5, ease }} />
          <span>SESSION ID</span>
          <span className="token-path-node" />
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.1, duration: 0.4 }}>
            SIGNATURE VALID <b>≠</b> SESSION ACTIVE
          </motion.p>
        </div>
        <Foot />
      </div>
    </SceneShell>
  );
}
