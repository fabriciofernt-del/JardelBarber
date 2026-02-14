
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Fix: Use any for session to bypass 'Session' not exported error from library
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Access auth with type assertion to bypass property existence errors
    const auth = supabase.auth as any;

    // Check current session
    auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Autenticando...</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
