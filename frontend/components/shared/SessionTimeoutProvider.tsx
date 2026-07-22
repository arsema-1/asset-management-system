'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/api';

const TIMEOUT_KEY = 'session_timeout_minutes';
const WARNING_BEFORE = 60; // seconds before timeout to show warning

export default function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARNING_BEFORE);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTimeoutMinutes = useCallback((): number => {
    if (typeof window === 'undefined') return 30;
    const saved = localStorage.getItem(TIMEOUT_KEY);
    return saved ? parseInt(saved, 10) : 30;
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    warningRef.current = null;
    countdownRef.current = null;
  }, []);

  const doLogout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await logoutUser();
    router.replace('/login?reason=timeout');
  }, [clearTimers, router]);

  const extendSession = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    setCountdown(WARNING_BEFORE);
    startTimersRef.current();
  }, [clearTimers]);

  // Using a ref for startTimers to avoid circular dependency
  const startTimersRef = useRef<() => void>(() => {});

  startTimersRef.current = useCallback(() => {
    clearTimers();
    const minutes = getTimeoutMinutes();
    if (minutes <= 0) return; // disabled

    const ms = minutes * 60 * 1000;

    // Schedule the warning
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(WARNING_BEFORE);

      // Tick the countdown every second
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // Time's up — auto logout
            clearTimers();
            setShowWarning(false);
            doLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, ms - WARNING_BEFORE * 1000);

    // Safety net — logout at the final expiry as well
    timerRef.current = setTimeout(() => {
      clearTimers();
      setShowWarning(false);
      doLogout();
    }, ms);
  }, [clearTimers, doLogout, getTimeoutMinutes]);

  const resetTimer = useCallback(() => {
    if (showWarning) {
      // User was active during warning — just extend silently
      extendSession();
      return;
    }
    startTimersRef.current();
  }, [showWarning, extendSession]);

  // Start on mount
  useEffect(() => {
    startTimersRef.current();
    return clearTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for activity events
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'click', 'scroll', 'touchstart'] as const;
    const handler = () => resetTimer();
    // Debounce — reset at most once every 5 seconds to avoid spam
    let lastReset = 0;
    const debouncedHandler = () => {
      const now = Date.now();
      if (now - lastReset > 5000) {
        lastReset = now;
        handler();
      }
    };

    events.forEach(e => window.addEventListener(e, debouncedHandler, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, debouncedHandler));
  }, [resetTimer]);

  return (
    <>
      {children}

      {/* Session timeout warning modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant p-xl max-w-sm w-full mx-md animate-scale-in">
            {/* Icon */}
            <div className="w-14 h-14 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-lg">
              <span className="material-symbols-outlined text-warning text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                timer
              </span>
            </div>

            <h3 className="text-title-lg font-bold text-on-surface text-center mb-sm">
              Your session is about to expire
            </h3>
            <p className="text-body-md text-on-surface-variant text-center mb-lg">
              You will be automatically signed out in <strong className="text-warning">{countdown}</strong> seconds due to inactivity.
            </p>

            {/* Countdown bar */}
            <div className="w-full h-2 bg-surface-container-high rounded-full mb-lg overflow-hidden">
              <div
                className="h-full bg-warning rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / WARNING_BEFORE) * 100}%` }}
              />
            </div>

            <div className="flex gap-md">
              <button
                onClick={async () => {
                  clearTimers();
                  setShowWarning(false);
                  await logoutUser();
                  router.replace('/login?reason=timeout');
                }}
                className="flex-1 px-md py-2.5 rounded-lg border border-outline-variant text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Sign Out Now
              </button>
              <button
                onClick={extendSession}
                className="flex-1 px-md py-2.5 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:brightness-110 transition-all shadow-sm"
              >
                I&apos;m Here
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
