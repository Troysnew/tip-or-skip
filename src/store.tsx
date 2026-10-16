import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { usePersistentState } from './lib/storage';
import type { HistoryEntry, HolidayPlan, Polls, Preset } from './state';

interface Store {
  pro: boolean;
  setPro: (v: boolean) => void;
  history: HistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryEntry[]>>;
  presets: Preset[];
  setPresets: React.Dispatch<React.SetStateAction<Preset[]>>;
  holiday: HolidayPlan;
  setHoliday: React.Dispatch<React.SetStateAction<HolidayPlan>>;
  polls: Polls;
  setPolls: React.Dispatch<React.SetStateAction<Polls>>;
  requests: string[];
  setRequests: React.Dispatch<React.SetStateAction<string[]>>;
  /** Open the upgrade screen. `feature` names what the person tapped. */
  paywall: string | null;
  openPaywall: (feature: string) => void;
  closePaywall: () => void;
  toast: string | null;
  flash: (msg: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pro, setPro] = usePersistentState<boolean>('tos.pro', false);
  const [history, setHistory] = usePersistentState<HistoryEntry[]>('tos.history', []);
  const [presets, setPresets] = usePersistentState<Preset[]>('tos.presets', []);
  const [holiday, setHoliday] = usePersistentState<HolidayPlan>('tos.holiday', { year: new Date().getFullYear(), items: [] });
  const [polls, setPolls] = usePersistentState<Polls>('tos.polls', {});
  const [requests, setRequests] = usePersistentState<string[]>('tos.requests', []);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const value: Store = {
    pro, setPro, history, setHistory, presets, setPresets, holiday, setHoliday,
    polls, setPolls, requests, setRequests,
    paywall, openPaywall: setPaywall, closePaywall: () => setPaywall(null),
    toast, flash,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** Run `action` if Pro is unlocked, otherwise show the upgrade screen for `feature`. */
export function useProGate() {
  const { pro, openPaywall } = useStore();
  return (feature: string, action: () => void) => (pro ? action() : openPaywall(feature));
}
