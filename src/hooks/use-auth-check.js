'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from '../lib/authClient';
import {
  initializeAuth,
  setSession,
  userLoggedOut,
} from '../redux/features/auth/authSlice';

export const useAuthCheck = () => {
  const dispatch = useDispatch();

  // Use the official Better Auth useSession hook
  const { data: session, isLoading, error } = useSession();

  // Get auth state from Redux
  const authState = useSelector(state => state.auth);

  useEffect(() => {
    // Initialize auth state from stored data
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (session) {
      // Update Redux state with session data
      dispatch(setSession(session));
    } else if (error) {
      // Handle authentication errors

      dispatch(userLoggedOut());
    }
  }, [session, error, dispatch]);

  const logout = async () => {
    try {
      // Try to sign out from Better Auth
      // This will automatically update the session state
      // and trigger the useSession hook to update
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    // Auth state from Better Auth + Redux
    isAuthenticated: !!session || authState.isAuthenticated,
    user: session?.user || authState.user,
    session: session || authState.session,
    accessToken: authState.accessToken,

    // Loading states
    isLoading: isLoading || authState.isLoading,

    // Actions
    logout,

    userInfo: authState.userInfo,
  };
};

export default useAuthCheck;
