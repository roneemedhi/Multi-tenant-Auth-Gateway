import type { CSSProperties, PropsWithChildren } from 'react';
import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export function SceneShell({
  children,
  palette = 'dark',
  className = '',
  style,
}: PropsWithChildren<{ palette?: 'dark' | 'bone' | 'flat'; className?: string; style?: CSSProperties }>) {
  return (
    <motion.section
      className={`film-scene film-scene--${palette} ${className}`}
      style={style}
      initial={{ opacity: 1, scale: 1.035, clipPath: 'inset(0 0 0 0)' }}
      animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0 0)' }}
      exit={{ opacity: 0, scale: 1.055, clipPath: 'inset(4% 3% 4% 3%)' }}
      transition={{ duration: 0.48, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}

export function Kicker({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <div className={`scene-kicker ${className}`}>{children}</div>;
}

export function Foot({ children = 'TENANT AUTH GATEWAY  /  PROJECT FILM' }: { children?: string }) {
  return <div className="scene-foot">{children}</div>;
}

export function Packet({ label = 'REQ · 01', className = '' }: { label?: string; className?: string }) {
  return <div className={`request-packet ${className}`}>{label}</div>;
}

export function TraceLine({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ scaleX: 0, transformOrigin: 'left center' }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.75, ease: EASE }}
    />
  );
}

export const rise = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE },
};

export const pop = {
  initial: { opacity: 0, scale: 0.72, rotate: -7 },
  animate: { opacity: 1, scale: [0.72, 1.07, 1], rotate: 0 },
  transition: { duration: 0.62, ease: EASE },
};
