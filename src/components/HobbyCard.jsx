import { motion } from 'framer-motion';
import {
  Camera,
  Code2,
  Music,
  Sparkles,
  BookOpen,
  Palette,
  Gamepad2,
  Compass,
  Trophy,
  Dumbbell,
  Film,
  PenTool,
  Utensils,
  Layers,
  Cpu,
  ArrowRight,
  Users,
} from 'lucide-react';

const ICON_MAP = {
  Camera,
  Code2,
  Music,
  Sparkles,
  BookOpen,
  Palette,
  Gamepad2,
  Compass,
  Trophy,
  Dumbbell,
  Film,
  PenTool,
  Utensils,
  Layers,
  Cpu,
};

export default function HobbyCard({ hobby, studentCount, onSelect, index = 0 }) {
  const IconComponent = ICON_MAP[hobby.icon] || Sparkles;

  return (
    <motion.button
      type="button"
      className="hobby-card"
      onClick={() => onSelect(hobby.name)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="hobby-card-top">
        <span className="hobby-icon-wrap" style={{ backgroundColor: hobby.bgTint }}>
          <IconComponent size={25} strokeWidth={2.1} />
        </span>
        <span className="hobby-count-badge">
          <Users size={13} />
          {studentCount} {studentCount === 1 ? 'student' : 'students'}
        </span>
      </div>

      <h3>{hobby.name}</h3>
      <p>{hobby.shortDesc}</p>

      <span className="hobby-card-cta">
        Explore {hobby.name} friends <ArrowRight size={15} />
      </span>
    </motion.button>
  );
}
