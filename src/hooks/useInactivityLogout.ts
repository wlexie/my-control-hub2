// src/hooks/useInactivityLogout.ts
"use client"; // This hook is for client-side use

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation'; // <-- IMPORTANT: Use 'next/navigation'
import { clearCredentials } from '../store/authSlice'; // Adjust path

const USER_ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export const useInactivityLogout = (timeout: number) => {
  const dispatch = useDispatch();
  const router = useRouter(); // Use the App Router's hook
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    console.log('User inactive. Logging out...');
    dispatch(clearCredentials());
    router.push('/login'); // Redirect to login
  }, [dispatch, router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, timeout);
  }, [logout, timeout]);

  useEffect(() => {
    resetTimer();

    USER_ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      USER_ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);
};