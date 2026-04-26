"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, BarChart3, Shield, ArrowRight, Brain } from "lucide-react";
import { AppProvider, useApp } from "@/lib/app-state";

function LandingContent() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/chat");
  }, [user, router]);

  if (user) return null;

  const features = [
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "AI Emotional Support",
      description: "Have meaningful conversations with an AI companion trained to listen, understand, and support you through difficult moments.",
      color: "text-blue-400",
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Daily Mood Tracking",
      description: "Check in with yourself daily. Track your emotional patterns and discover insights about your mental wellbeing over time.",
      color: "text-rose-400",
    },
    {
      icon: <BarChart3 className="w-7 h-7" />,
      title: "Visual Mood Trends",
      description: "See your emotional journey visualized through beautiful charts. Identify patterns and celebrate your progress.",
      color: "text-emerald-400",
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Crisis Safety Net",
      description: "Built-in distress detection ensures you're connected to professional resources when you need them most.",
      color: "text-amber-400",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Breathing gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-serif font-bold text-foreground">MindBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push("/login")} className="text-muted-foreground hover:text-foreground">
              Log in
            </Button>
            <Button onClick={() => router.push("/signup")} className="rounded-xl bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </nav>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Heart className="w-4 h-4" />
              Your safe space for emotional wellbeing
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-foreground max-w-4xl leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Talk safely.
            <br />
            <span className="text-primary">Feel understood.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            MindBridge is an AI-powered companion that helps you track your emotions,
            have supportive conversations, and connect to real help when you need it.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={() => router.push("/signup")}
              className="rounded-xl bg-primary hover:bg-primary/90 text-lg px-8 py-6 gap-2"
            >
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/login")}
              className="rounded-xl text-lg px-8 py-6 border-border/50"
            >
              I have an account
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Features */}
      <section className="px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">How MindBridge Supports You</h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Four powerful tools working together to support your mental health journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-8 rounded-2xl neu-flat bg-card hover:bg-card/80 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-muted flex items-center justify-center ${feature.color} mb-5`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="px-6 md:px-12 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-serif font-semibold text-foreground mb-2">Important Disclaimer</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  MindBridge is not a replacement for professional mental health care. If you are in distress,
                  please seek help from a qualified professional or contact your local crisis support service.
                  In an emergency, call your local emergency services immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-12 py-8 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <span className="font-serif font-semibold">MindBridge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            An AI-powered mental health companion for young people
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <LandingContent />
    </AppProvider>
  );
}

