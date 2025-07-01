"use client"; // This hook is for client-side use

import { useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; 
import { clearCredentials } from '../store/authSlice'; 


const USER_ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

export const useInactivityLogout = (timeout: number) => {
  const dispatch = useDispatch();
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    console.log('User inactive. Logging out...');

    // 1. Clear state from Redux
    dispatch(clearCredentials());
    
    // The path option is important to ensure the cookie is removed correctly.
    Cookies.remove('accessToken', { path: '/' });

    // 3. Redirect to login page
    router.push('/login?reason=inactivity'); 
    
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