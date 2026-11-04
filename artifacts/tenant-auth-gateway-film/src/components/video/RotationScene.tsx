import { motion } from 'framer-motion';
import { Foot, Kicker, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;

export function RotationScene() {
  return (
    <SceneShell className="rotation-scene">
      <div className="scene-safe">
        <Kicker>06 / Session lifecycle</Kicker>
        <motion.div className="rotation-title" {...rise} transition={{ ...rise.transition, delay: 0.1 }}>
          <h1 className="scene-title">15 MINUTES.</h1>
          <div className="scene-label">THEN ROTATE.</div>
        </motion.div>
        <motion.div className="time-wheel" initial={{ rotate: -45, scale: 0.72 }} animate={{ rotate: 0, scale: 1 }} transition={{ duration: 0.82, ease }}>
          <div className="wheel-ring wheel-ring--outer" />
          <div className="wheel-ring wheel-ring--middle" />
          <div className="wheel-ring wheel-ring--inner" />
          <motion.div className="wheel-access-arc" initial={{ rotate: -145, scale: 0.3, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ delay: 0.35, duration: 0.68, ease }} />
          <motion.div className="wheel-pointer" animate={{ rotate: [0, 72, 139, 205, 270] }} transition={{ delay: 0.55, duration: 2.6, ease }} />
          <motion.div className="wheel-token" {...rise} transition={{ ...rise.transition, delay: 0.38 }}>ACCESS<br /><b>15 MIN</b></motion.div>
          <motion.div className="wheel-expire" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.35, duration: 0.38 }}>EXPIRES</motion.div>
          <motion.div className="wheel-refresh" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.85, duration: 0.5, ease }}>
            <span>REFRESH SESSION</span><strong>7 DAYS · SLIDING</strong>
          </motion.div>
        </motion.div>
        <motion.div className="rotation-hash" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.65, duration: 0.38 }}>
          <span>REFRESH HASH</span><code>7a30…9c12</code><b>→</b><code className="hash-new">bf18…4d67</code>
        </motion.div>
        <motion.div className="rotation-new-access" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.45, duration: 0.4 }}>
          ROTATE <span>→</span> NEW ACCESS
        </motion.div>
        <Foot />
      </div>
    </SceneShell>
  );
}
