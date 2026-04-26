"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User { id: string; email: string; name: string; token: string; }
export interface MoodEntry { id: string; mood: number; label: string; emoji: string; date: string; note?: string; }
export interface ChatMessage { id: string; role: "user" | "assistant"; content: string; timestamp: string; isDistress?: boolean; }

interface AppState {
  user: User | null; moods: MoodEntry[]; chatMessages: ChatMessage[];
  isLoading: boolean; initialized: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addMood: (mood: number, label: string, emoji: string, note?: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function apiFetch(path: string, opts: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  if (!res.ok) { const err = await res.text(); throw new Error(err || `API error ${res.status}`); }
  return res.json();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mindbridge_user");
    if (saved) { const u = JSON.parse(saved); setUser(u); loadData(u.token); }
    setInitialized(true);
  }, []);

  async function loadData(token: string) {
    try {
      const [chatData, moodData] = await Promise.all([
        apiFetch("/chat/history?limit=50", {}, token),
        apiFetch("/mood?days=30", {}, token),
      ]);
      const msgs: ChatMessage[] = [];
      for (const c of chatData) {
        msgs.push({ id: c.id + "-u", role: "user", content: c.message, timestamp: c.timestamp });
        msgs.push({ id: c.id + "-a", role: "assistant", content: c.response, timestamp: c.timestamp, isDistress: c.isDistress });
      }
      setChatMessages(msgs);
      setMoods(moodData);
    } catch (e) { console.error("Load failed:", e); }
  }

  useEffect(() => {
    if (user) localStorage.setItem("mindbridge_user", JSON.stringify(user));
    else localStorage.removeItem("mindbridge_user");
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const d = await apiFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      const u: User = { id: d.userId, email: d.email, name: d.name, token: d.token };
      setUser(u); await loadData(u.token); return true;
    } catch { return false; } finally { setIsLoading(false); }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const d = await apiFetch("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      const u: User = { id: d.userId, email: d.email, name: d.name, token: d.token };
      setUser(u); return true;
    } catch { return false; } finally { setIsLoading(false); }
  };

  const logout = () => { setUser(null); setChatMessages([]); setMoods([]); localStorage.removeItem("mindbridge_user"); };

  const addMood = async (mood: number, label: string, emoji: string, note?: string) => {
    if (!user) return;
    try {
      const d = await apiFetch("/mood", { method: "POST", body: JSON.stringify({ mood, label, emoji, note }) }, user.token);
      setMoods(prev => [d, ...prev]);
    } catch (e) { console.error("Mood failed:", e); }
  };

  const sendMessage = async (content: string) => {
    if (!user) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    try {
      const d = await apiFetch("/chat/send", { method: "POST", body: JSON.stringify({ message: content }) }, user.token);
      setChatMessages(prev => [...prev, { id: d.id, role: "assistant", content: d.response, timestamp: d.timestamp, isDistress: d.isDistress }]);
    } catch {
      setChatMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Could not connect to the server. Make sure your backend is running at " + API, timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  };

  return (
    <AppContext.Provider value={{ user, moods, chatMessages, isLoading, initialized, login, signup, logout, addMood, sendMessage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
