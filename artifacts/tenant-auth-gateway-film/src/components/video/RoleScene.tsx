import { motion } from 'framer-motion';
import { Foot, Kicker, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;
const builtins = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'];

export function RoleScene() {
  return (
    <SceneShell palette="bone" className="role-scene">
      <div className="scene-safe">
        <Kicker>05 / Permission model</Kicker>
        <motion.h1 className="roles-title scene-title scene-title--medium" {...rise} transition={{ ...rise.transition, delay: 0.1 }}>
          Four roles.<br /><span>Room to extend.</span>
        </motion.h1>
        <div className="role-matrix">
          {builtins.map((role, index) => (
            <motion.div
              key={role}
              className="role-tile"
              initial={{ opacity: 0, y: index % 2 ? 34 : -28, rotate: index % 2 ? 4 : -4 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.34 + index * 0.17, duration: 0.5, ease }}
            >
              <span className="role-index">0{index + 1}</span><strong>{role}</strong>
              <div className="permission-ticks"><i /><i /><i /><i /></div>
            </motion.div>
          ))}
        </div>
        <motion.div className="plan-rail plan-rail--free" initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 1.25, duration: 0.55, ease }}>
          <span className="plan-label">FREE · 3 CUSTOM ROLES</span>
          <div className="free-slots"><i /><i /><i /></div>
          <motion.div className="fourth-role" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.95, duration: 0.35 }}>04</motion.div>
          <motion.div className="free-cap" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 2.2, duration: 0.28, ease }}><span>CAP</span></motion.div>
        </motion.div>
        <motion.div className="plan-rail plan-rail--premium" initial={{ opacity: 0, scaleX: 0, transformOrigin: 'left' }} animate={{ opacity: 1, scaleX: 1 }} transition={{ delay: 2.55, duration: 0.72, ease }}>
          <span className="plan-label">PREMIUM · UNLIMITED CUSTOM ROLES</span>
          <div className="premium-points"><i /><i /><i /><i /><i /></div>
          <strong>NO CAP</strong>
        </motion.div>
        <motion.div className="roles-subline" {...rise} transition={{ ...rise.transition, delay: 0.9 }}>Owner · Admin · Editor · Viewer</motion.div>
        <Foot />
      </div>
    </SceneShell>
  );
}
