"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Check, Sparkles } from "lucide-react";
import { AppProvider, useApp } from "@/lib/app-state";
import { AppNav } from "@/components/app-nav";
import { format } from "date-fns";

const MOODS = [
  { value: 1, emoji: "😞", label: "Awful", color: "bg-red-500/20 border-red-500/40 text-red-400" },
  { value: 2, emoji: "😟", label: "Bad", color: "bg-orange-500/20 border-orange-500/40 text-orange-400" },
  { value: 3, emoji: "😐", label: "Okay", color: "bg-yellow-500/20 border-yellow-500/40 text-yellow-400" },
  { value: 4, emoji: "😊", label: "Good", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" },
  { value: 5, emoji: "😄", label: "Great", color: "bg-blue-500/20 border-blue-500/40 text-blue-400" },
];

function MoodContent() {
  const { user, moods, addMood, initialized } = useApp();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (initialized && !user) router.push("/login");
  }, [user, router, initialized]);

  const handleSubmit = () => {
    if (selectedMood === null) return;
    const mood = MOODS.find(m => m.value === selectedMood)!;
    addMood(mood.value, mood.label, mood.emoji, note || undefined);
    setShowSuccess(true);
    setSelectedMood(null);
    setNote("");
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const todayMoods = moods.filter(m => {
    const moodDate = new Date(m.date);
    const today = new Date();
    return moodDate.toDateString() === today.toDateString();
  });

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AppNav />
      <main className="flex-1 overflow-y-auto md:mt-0 mt-14">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">How are you feeling?</h1>
            <p className="text-muted-foreground mb-10">Take a moment to check in with yourself today.</p>

            {/* Mood selector */}
            <div className="flex justify-center gap-4 mb-10">
              {MOODS.map((mood) => (
                <motion.button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedMood === mood.value
                      ? mood.color + " scale-110"
                      : "border-transparent bg-muted/30 hover:bg-muted/50"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-4xl md:text-5xl">{mood.emoji}</span>
                  <span className={`text-xs font-medium ${
                    selectedMood === mood.value ? "" : "text-muted-foreground"
                  }`}>
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Note */}
            <AnimatePresence>
              {selectedMood !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8"
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Want to add a note? <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="What's on your mind today?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="rounded-xl bg-muted/50 border-border/50 focus:border-primary resize-none"
                  />
                  <div className="mt-4">
                    <Button
                      onClick={handleSubmit}
                      className="rounded-xl bg-primary hover:bg-primary/90 px-8"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Log My Mood
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success message */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-medium">Mood logged! Keep tracking to see your patterns.</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Today's moods */}
            {todayMoods.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Today's Check-ins</h2>
                <div className="space-y-3">
                  {todayMoods.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 neu-flat"
                    >
                      <span className="text-2xl">{entry.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{entry.label}</p>
                        {entry.note && <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), "h:mm a")}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent history */}
            {moods.length > todayMoods.length && (
              <div className="mt-10">
                <h2 className="text-lg font-serif font-semibold text-foreground mb-4">Recent History</h2>
                <div className="space-y-2">
                  {moods.slice(0, 10).filter(m => !todayMoods.includes(m)).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-xl">{entry.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{entry.label}</p>
                        {entry.note && <p className="text-xs text-muted-foreground">{entry.note}</p>}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), "MMM d, h:mm a")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function MoodPage() {
  return (
    <AppProvider>
      <MoodContent />
    </AppProvider>
  );
}



