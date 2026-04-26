"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreathingExerciseProps {
  open: boolean;
  onClose: () => void;
}

const PHASES = [
  { label: "Breathe In", duration: 4, scale: 1.6, opacity: 1 },
  { label: "Hold", duration: 4, scale: 1.6, opacity: 0.85 },
  { label: "Breathe Out", duration: 6, scale: 1, opacity: 0.6 },
  { label: "Hold", duration: 2, scale: 1, opacity: 0.5 },
];

const TOTAL_CYCLE = PHASES.reduce((s, p) => s + p.duration, 0); // 16s

function Bubble({ delay, size, x, color }: { delay: number; size: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -size,
        background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
        opacity: 0.25,
      }}
      animate={{
        y: ["-0vh", "-110vh"],
        x: [0, Math.sin(delay) * 40],
        opacity: [0.15, 0.35, 0],
        scale: [0.8, 1.2, 0.6],
      }}
      transition={{
        duration: 8 + delay * 2,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
    />
  );
}

export function BreathingExercise({ open, onClose }: BreathingExerciseProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timer, setTimer] = useState(PHASES[0].duration);
  const [cycles, setCycles] = useState(0);
  const [started, setStarted] = useState(false);

  const currentPhase = PHASES[phaseIndex];

  const resetExercise = useCallback(() => {
    setPhaseIndex(0);
    setTimer(PHASES[0].duration);
    setCycles(0);
    setStarted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      resetExercise();
      return;
    }
  }, [open, resetExercise]);

  useEffect(() => {
    if (!started || !open) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          const nextIndex = (phaseIndex + 1) % PHASES.length;
          setPhaseIndex(nextIndex);
          if (nextIndex === 0) setCycles((c) => c + 1);
          return PHASES[nextIndex].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, open, phaseIndex]);

  const bubbles = [
    { delay: 0, size: 60, x: 10, color: "rgba(59,130,246,0.5)" },
    { delay: 1.5, size: 40, x: 25, color: "rgba(139,92,246,0.4)" },
    { delay: 0.8, size: 80, x: 45, color: "rgba(59,130,246,0.3)" },
    { delay: 2.2, size: 50, x: 65, color: "rgba(96,165,250,0.4)" },
    { delay: 1, size: 35, x: 80, color: "rgba(139,92,246,0.3)" },
    { delay: 3, size: 70, x: 90, color: "rgba(59,130,246,0.35)" },
    { delay: 0.5, size: 45, x: 15, color: "rgba(96,165,250,0.3)" },
    { delay: 2.8, size: 55, x: 55, color: "rgba(139,92,246,0.35)" },
    { delay: 1.8, size: 30, x: 35, color: "rgba(59,130,246,0.4)" },
    { delay: 3.5, size: 65, x: 75, color: "rgba(96,165,250,0.35)" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#0a0f1e]" />

          {/* Floating bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            {bubbles.map((b, i) => (
              <Bubble key={i} {...b} />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={() => { onClose(); resetExercise(); }}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {!started ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mb-8"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="w-12 h-12 text-blue-400" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-4">
                  Let's take a moment to breathe
                </h2>
                <p className="text-white/60 max-w-md mb-8 leading-relaxed">
                  It's okay to feel overwhelmed. This gentle breathing exercise can help calm your mind and body. You're safe here.
                </p>
                <Button
                  onClick={() => setStarted(true)}
                  className="rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-8 py-6 text-lg"
                >
                  Begin Breathing Exercise
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center"
              >
                {/* Breathing circle */}
                <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center mb-10">
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
                    }}
                    animate={{
                      scale: currentPhase.scale * 1.2,
                      opacity: currentPhase.opacity * 0.5,
                    }}
                    transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
                  />
                  {/* Main circle */}
                  <motion.div
                    className="absolute inset-4 rounded-full border-2 border-blue-400/30"
                    style={{
                      background: "radial-gradient(circle at 40% 40%, rgba(59,130,246,0.25), rgba(139,92,246,0.1), transparent)",
                    }}
                    animate={{
                      scale: currentPhase.scale,
                      opacity: currentPhase.opacity,
                    }}
                    transition={{ duration: currentPhase.duration, ease: "easeInOut" }}
                  />
                  {/* Inner content */}
                  <div className="relative z-10 text-center">
                    <motion.p
                      key={currentPhase.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl md:text-2xl font-serif font-semibold text-white"
                    >
                      {currentPhase.label}
                    </motion.p>
                    <p className="text-4xl font-light text-blue-300 mt-2">{timer}</p>
                  </div>
                </div>

                {/* Cycle counter */}
                <p className="text-white/40 text-sm">
                  {cycles === 0 ? "First cycle" : `${cycles} cycle${cycles > 1 ? "s" : ""} completed`}
                </p>

                {/* Encouragement */}
                {cycles >= 2 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-blue-300/70 text-sm"
                  >
                    You're doing great. Take as many cycles as you need.
                  </motion.p>
                )}

                <button
                  onClick={() => { onClose(); resetExercise(); }}
                  className="mt-8 text-white/40 hover:text-white/60 text-sm underline underline-offset-4 transition-colors"
                >
                  I'm feeling better, close this
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

