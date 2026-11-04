import { motion } from 'framer-motion';
import { Foot, Kicker, Packet, SceneShell, rise } from './FilmPrimitives';

const ease = [0.22, 1, 0.36, 1] as const;
const tenants = [
  { name: 'NORTHSTAR LABS', id: 'tn_northstar', tone: 'lane--one' },
  { name: 'FIELDNOTE STUDIO', id: 'tn_fieldnote', tone: 'lane--two' },
  { name: 'MERIDIAN HEALTH', id: 'tn_meridian', tone: 'lane--three' },
];

export function TenantScopeScene() {
  return (
    <SceneShell palette="bone" className="scope-scene">
      <div className="scene-safe">
        <Kicker>TENANT-SCOPED QUERIES</Kicker>
        <motion.div className="scope-heading" {...rise} transition={{ ...rise.transition, delay: 0.1 }}>
          <span>SAME REQUEST.</span><strong>DIFFERENT TENANT.</strong>
        </motion.div>
        <div className="tenant-lanes">
          {tenants.map((tenant, index) => (
            <motion.div key={tenant.id} className={`tenant-lane ${tenant.tone}`} initial={{ opacity: 0, x: -36 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.18, duration: 0.48, ease }}>
              <span className="lane-name">{tenant.name}</span>
              <span className="lane-id">{tenant.id}</span>
              <i className="lane-track" />
              {index === 1 && <motion.div className="scope-packet" initial={{ x: -220 }} animate={{ x: 130 }} transition={{ delay: 1.25, duration: 0.85, ease }}><Packet label="GET" /></motion.div>}
              {index === 2 && <motion.div className="scope-resource" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.65 }}>RESOURCE</motion.div>}
            </motion.div>
          ))}
        </div>
        <motion.div className="scope-barrier" initial={{ scaleY: 0, transformOrigin: 'top' }} animate={{ scaleY: 1 }} transition={{ delay: 0.48, duration: 0.65, ease }} />
        <motion.div className="scope-403" initial={{ opacity: 0, scale: 1.45 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.65, duration: 0.48, ease }}>
          <strong>403</strong><span>FORBIDDEN</span>
        </motion.div>
        <motion.div className="scope-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.52, duration: 0.3 }}>SCOPE BEFORE RESOURCE ACCESS</motion.div>
        <Foot />
      </div>
    </SceneShell>
  );
}
