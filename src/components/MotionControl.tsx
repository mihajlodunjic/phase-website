export type MotionSettings = { enabled: boolean; reduced: boolean; toggle: () => void }

export function MotionControl({ motion, context }: { motion: MotionSettings; context?: string }) {
  return <button className="motion-control" aria-label={context ? `${motion.reduced ? 'Reduced motion' : motion.enabled ? 'Pause motion' : 'Enable motion'} ${context}` : undefined} aria-pressed={!motion.enabled} disabled={motion.reduced} onClick={motion.toggle}>
    <span className="motion-icon" aria-hidden="true">{motion.enabled ? 'Ⅱ' : '▷'}</span>{motion.reduced ? 'Reduced motion' : `Motion ${motion.enabled ? 'on' : 'off'}`}
  </button>
}
