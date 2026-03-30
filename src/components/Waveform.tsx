import { motion } from "motion/react";

export const Waveform = ({ isPlaying, progress, duration }: { isPlaying: boolean, progress: number, duration: number }) => {
  // Generate a fixed set of heights to ensure consistency
  const heights = [40, 60, 30, 80, 50, 70, 20, 90, 40, 60, 70, 30, 50, 80, 40, 60, 30, 70, 50, 40];
  const percentage = duration > 0 ? (progress / duration) * 100 : 0;
  
  return (
    <div className="flex items-center gap-0.5 h-6 w-32 relative">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${isPlaying ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
          initial={{ height: `${h}%` }}
          animate={isPlaying ? { height: [`${h}%`, `${Math.max(20, Math.min(90, h + (Math.random() * 20 - 10)))}%`] } : {}}
          transition={{ repeat: Infinity, duration: 0.5, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute top-0 bottom-0 w-0.5 bg-emerald-700" style={{ left: `${percentage}%` }} />
    </div>
  );
};
