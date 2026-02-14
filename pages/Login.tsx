
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ShieldCheck, AlertCircle, Scissors, ArrowRight, Zap, ChevronRight } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await (supabase.auth as any).signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error("Erro de login:", err);
      setError(err.message === 'Failed to fetch' 
        ? 'Erro de Conexão: O banco de dados está inacessível no momento.' 
        : 'Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Define uma sessão local para o ProtectedRoute aceitar
    localStorage.setItem('jb_admin_session', 'true');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 selection:bg-amber-500 selection:text-neutral-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-amber-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 rotate-3">
            <Scissors className="text-neutral-950" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Scheduly Admin</h1>
          <p className="text-amber-500/60 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Gestão de Barbearia Elite</p>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-neutral-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-4 pl-12 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all text-sm"
                  placeholder="admin@jardelbarber.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-4 pl-12 rounded-xl text-white font-bold outline-none focus:border-amber-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-[9px] font-black uppercase tracking-widest">
                  <AlertCircle size={16} /> {error}
                </div>
                {/* Botão de Emergência caso o Supabase falhe */}
                <button 
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-4 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-neutral-950 transition-all flex items-center justify-center gap-2 group"
                >
                  <Zap size={14} className="group-hover:fill-current" /> Entrar via Acesso Local (Offline)
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-amber-500 text-neutral-950 font-black rounded-2xl hover:bg-amber-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs italic flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={18} /> Acessar Painel
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center space-y-4">
          {!error && (
            <button 
              onClick={handleDemoAccess}
              className="text-neutral-600 hover:text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Zap size={12} /> Usar Acesso Local (Modo Demo)
            </button>
          )}
          <button 
            onClick={() => navigate('/')}
            className="text-neutral-700 hover:text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto group"
          >
            Página de Agendamento <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
