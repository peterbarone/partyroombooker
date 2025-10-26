"use client";
import { motion } from "framer-motion";

export default function Greeting({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-full w-full overflow-visible z-40 pt-[calc(theme(spacing.8)+env(safe-area-inset-top))] md:pt-[calc(theme(spacing.12)+env(safe-area-inset-top))]">
      {/* CTA at bottom of the scene */}
      <div className="fixed inset-x-0 bottom-[calc(theme(spacing.4)+env(safe-area-inset-bottom))] flex items-center justify-center px-4 z-50">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className="px-8 md:px-10 py-4 md:py-5 rounded-full text-white text-lg md:text-xl font-extrabold shadow-[0_8px_0_rgba(0,0,0,0.25)] bg-[linear-gradient(180deg,#1bb1d1_0%,#0a7ca0_100%)] border-2 border-[#0a6e8f]"
        >
          Enter the party portal!
        </motion.button>
      </div>
    </div>
  );
}
