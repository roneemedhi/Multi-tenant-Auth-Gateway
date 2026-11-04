import { motion } from 'framer-motion';
import { Foot, Kicker, Packet, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;

export function BoundaryScene() {
  return (
    <SceneShell className="boundary-scene">
      <div className="scene-safe">
        <Kicker>01 / Trust boundary</Kicker>
        <div className="boundary-title">
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ ...rise.transition, delay: 0.08 }}>A REQUEST.</motion.div>
          <motion.div className="boundary-tenant" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ ...rise.transition, delay: 1.0 }}>A TENANT.</motion.div>
          <motion.div className="boundary-word" initial={{ opacity: 0, y: 22, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...rise.transition, delay: 1.55 }}>A BOUNDARY.</motion.div>
        </div>
        <motion.div
          className="boundary-rule"
          initial={{ scaleY: 0, transformOrigin: 'top' }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.22, ease }}
        />
        <motion.div className="boundary-crosshair" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.48, ...rise.transition }}>
          <span />
        </motion.div>
        <motion.div className="boundary-packet" initial={{ opacity: 0, scale: 0.72 }} animate={{ opacity: [0, 1, 1, 1, 0], scale: [0.72, 1, 1, 1, 3.1], x: [0, -18, 0, 0, 44] }} transition={{ delay: 0.42, duration: 4.32, times: [0, 0.1, 0.5, 0.76, 1], ease }}>
          <Packet />
        </motion.div>
        <motion.div className="boundary-outcome boundary-outcome--allow" initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.55, duration: 0.38 }}>
          <span className="outcome-dot" /> ALLOW
        </motion.div>
        <motion.div className="boundary-outcome boundary-outcome--deny" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.86, duration: 0.38 }}>
          <span className="outcome-dot" /> DENY
        </motion.div>
        <motion.div className="boundary-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45, duration: 0.3 }}>
          AUTHORIZATION IS A BOUNDARY DECISION
        </motion.div>
        <Foot />
      </div>
    </SceneShell>
  );
}
