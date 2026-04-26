"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, SmilePlus } from "lucide-react";
import { AppProvider, useApp, MoodEntry } from "@/lib/app-state";
import { AppNav } from "@/components/app-nav";
import { format, subDays, startOfDay } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const MOOD_LABELS: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

const MOOD_EMOJIS: Record<number, string> = {
  1: "😞",
  2: "😟",
  3: "😐",
  4: "😊",
  5: "😄",
};

function DashboardContent() {
  const { user, moods, initialized } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) router.push("/login");
  }, [user, router, initialized]);

  // Prepare chart data - last 14 days
  const chartData = useMemo(() => {
    const days = 14;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dayMoods = moods.filter(m => {
        const moodDate = startOfDay(new Date(m.date));
        return moodDate.getTime() === date.getTime();
      });
      const avgMood = dayMoods.length > 0
        ? dayMoods.reduce((sum, m) => sum + m.mood, 0) / dayMoods.length
        : null;
      data.push({
        date: format(date, "MMM d"),
        mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        count: dayMoods.length,
      });
    }
    return data;
  }, [moods]);

  // Mood distribution
  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    moods.forEach(m => { counts[m.mood] = (counts[m.mood] || 0) + 1; });
    return Object.entries(counts).map(([mood, count]) => ({
      mood: MOOD_EMOJIS[Number(mood)] + " " + MOOD_LABELS[Number(mood)],
      count,
      fill: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"][Number(mood) - 1],
    }));
  }, [moods]);

  // Stats
  const stats = useMemo(() => {
    if (moods.length === 0) return { avg: 0, total: 0, streak: 0, best: "N/A" };
    const avg = moods.reduce((s, m) => s + m.mood, 0) / moods.length;
    // Simple streak calculation
    let streak = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 30; i++) {
      const checkDate = startOfDay(subDays(today, i));
      const hasMood = moods.some(m => startOfDay(new Date(m.date)).getTime() === checkDate.getTime());
      if (hasMood) streak++;
      else break;
    }
    const moodCounts: Record<number, number> = {};
    moods.forEach(m => { moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1; });
    const bestMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      avg: Math.round(avg * 10) / 10,
      total: moods.length,
      streak,
      best: bestMood ? MOOD_EMOJIS[Number(bestMood[0])] + " " + MOOD_LABELS[Number(bestMood[0])] : "N/A",
    };
  }, [moods]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AppNav />
      <main className="flex-1 overflow-y-auto md:mt-0 mt-14">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Your Wellness Dashboard</h1>
            <p className="text-muted-foreground mb-10">Track your emotional journey over time</p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Average Mood", value: stats.avg || "—", icon: TrendingUp, color: "text-blue-400" },
                { label: "Total Entries", value: stats.total, icon: BarChart3, color: "text-emerald-400" },
                { label: "Day Streak", value: stats.streak + "d", icon: Calendar, color: "text-amber-400" },
                { label: "Most Common", value: stats.best, icon: SmilePlus, color: "text-rose-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-card neu-flat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {moods.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-serif font-semibold text-foreground mb-3">No data yet</h2>
                <p className="text-muted-foreground mb-6">Start logging your moods to see trends here.</p>
                <button
                  onClick={() => router.push("/mood")}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Log Your First Mood
                </button>
              </div>
            ) : (
              <>
                {/* Mood trend chart */}
                <div className="p-6 rounded-2xl bg-card neu-flat mb-8">
                  <h2 className="text-lg font-serif font-semibold text-foreground mb-6">Mood Trend (Last 14 Days)</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "hsl(215 25% 60%)", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(224 20% 18%)" }}
                        />
                        <YAxis
                          domain={[0, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          tickFormatter={(v) => MOOD_EMOJIS[v] || ""}
                          tick={{ fontSize: 16 }}
                          axisLine={{ stroke: "hsl(224 20% 18%)" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(224 20% 12%)",
                            border: "1px solid hsl(224 20% 18%)",
                            borderRadius: "12px",
                            color: "hsl(210 40% 95%)",
                          }}
                          formatter={(value: number) => [value ? `${value} (${MOOD_LABELS[Math.round(value)]})` : "No data", "Mood"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="mood"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#moodGradient)"
                          connectNulls={false}
                          dot={{ fill: "#3b82f6", r: 4 }}
                          activeDot={{ r: 6, fill: "#60a5fa" }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribution */}
                <div className="p-6 rounded-2xl bg-card neu-flat">
                  <h2 className="text-lg font-serif font-semibold text-foreground mb-6">Mood Distribution</h2>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(224 20% 18%)" />
                        <XAxis
                          dataKey="mood"
                          tick={{ fill: "hsl(215 25% 60%)", fontSize: 11 }}
                          axisLine={{ stroke: "hsl(224 20% 18%)" }}
                        />
                        <YAxis
                          tick={{ fill: "hsl(215 25% 60%)", fontSize: 12 }}
                          axisLine={{ stroke: "hsl(224 20% 18%)" }}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(224 20% 12%)",
                            border: "1px solid hsl(224 20% 18%)",
                            borderRadius: "12px",
                            color: "hsl(210 40% 95%)",
                          }}
                        />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {distribution.map((entry, index) => (
                            <Bar key={index} dataKey="count" fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}



