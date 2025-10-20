"use client";
import { motion } from "framer-motion";

export default function Greeting({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-full w-full">
      {/* Characters inside content column */}
      <img
        src="/assets/greeting/wizzygreeting.png"
        alt="Wizzy"
        className="pointer-events-none select-none absolute bottom-20 left-[-100px] w-[70%] sm:w-[80%] md:w-[80%] max-w-[480px]"
      />
      <img
        src="/assets/greeting/rufffsgreeting.png"
        alt="Ruffs"
        className="pointer-events-none select-none absolute bottom-24 right-0 w-[40%] max-w-[210px]"
      />

      {/* CTA */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center px-4 z-10">
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
