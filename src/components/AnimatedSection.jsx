import { motion } from 'framer-motion';

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  yOffset = 24,
  id,
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
