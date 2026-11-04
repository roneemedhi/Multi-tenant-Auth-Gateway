import { motion } from 'framer-motion';
import { Foot, Kicker, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;

export function RedisScene() {
  return (
    <SceneShell className="redis-scene">
      <div className="scene-safe">
        <Kicker>03 / Session state</Kicker>
        <motion.h1 className="redis-title scene-title scene-title--medium" {...rise} transition={{ ...rise.transition, delay: 0.12 }}>
          Redis-backed<br /><span>session plane.</span>
        </motion.h1>
        <div className="redis-network">
          <div className="redis-axis" />
          <motion.div className="redis-node redis-node--session" {...rise} transition={{ ...rise.transition, delay: 0.2 }}>
            <div className="node-orb">SID</div><span>ACTIVE SESSION</span>
          </motion.div>
          <motion.div className="redis-cache" initial={{ opacity: 0, scale: 0.65 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.58, duration: 0.6, ease }}>
            <small>SESSION CACHE</small><strong>tenantId<br />userId</strong><i />
          </motion.div>
          <motion.div className="redis-node redis-node--pass" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.05, duration: 0.4 }}>
            <span className="node-orb node-orb--pass">✓</span><b>200</b><small>SESSION OK</small>
          </motion.div>
          <motion.div className="redis-revoke" initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 1.55, duration: 0.55, ease }}>
            <div className="revoke-bolt">×</div><span>REVOKED SID → DENY</span>
          </motion.div>
          <motion.div className="redis-rate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.55, duration: 0.45 }}>
            <span>RATE LIMIT</span><strong>429</strong><div className="rate-bars"><i /><i /><i /><i /><i /></div>
          </motion.div>
          <motion.div className="redis-jti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.15, duration: 0.35 }}>JTI / SID REVOCATION</motion.div>
        </div>
        <motion.div className="redis-dependency" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 3.72, duration: 0.35 }}>
          DEPENDENCY FAILURE <b>→ 503</b>
        </motion.div>
        <Foot />
      </div>
    </SceneShell>
  );
}
