import { motion } from "framer-motion";

export default function TimeSlotScene() {
  const confetti = [
    { left: "78%", top: "12%", color: "#FF6B9D", delay: 0 },
    { left: "85%", top: "6%", color: "#F1C40F", delay: 0.4 },
    { left: "90%", top: "18%", color: "#3498DB", delay: 0.8 },
    { left: "82%", top: "26%", color: "#2ECC71", delay: 1.2 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      <motion.div
        className="hidden md:block absolute right-4 md:right-8 bottom-24 md:bottom-28"
        initial={{ y: 0, rotate: 0, opacity: 0.55 }}
        animate={{ y: [0, -8, 0], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 140, height: 180 }}
      >
        <div
          className="w-full h-full rounded-full shadow-[inset_-10px_-18px_24px_rgba(0,0,0,0.2)]"
          style={{
            background:
              "radial-gradient(120px 140px at 55% 40%, rgba(255,255,255,0.65), rgba(255,255,255,0.2) 60%, rgba(255,255,255,0) 70%), linear-gradient(160deg, rgba(156,81,187,0.65), rgba(113,60,151,0.65))",
          }}
        />
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 w-1 h-8 bg-purple-700/40" />
      </motion.div>
      {confetti.map((c, i) => (
        <motion.span
          key={i}
          className="hidden md:block absolute w-1.5 h-1.5 rounded-sm"
          style={{ left: c.left, top: c.top, backgroundColor: c.color }}
          initial={{ opacity: 0, y: -10, rotate: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2], y: [0, 14, 0], rotate: [0, 12, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, delay: c.delay }}
        />
      ))}
    </div>
  );
}
