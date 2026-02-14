
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ShieldCheck, AlertCircle, Scissors, ArrowRight, Zap, RefreshCw, ExternalLink } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      
      // Limpa qualquer sessão demo ao entrar com conta real
      localStorage.removeItem('jb_admin_session');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error("Erro de login:", err);
      // Tratamento específico para erro de rede/conexão
      if (err.message?.toLowerCase().includes('fetch') || err.message?.includes('network')) {
        setError('ERRO DE CONEXÃO: O sistema não conseguiu alcançar o banco de dados.');
      } else {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    // Grava uma marca no navegador para permitir o acesso sem o Supabase
    localStorage.setItem('jb_admin_session', 'true');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 selection:bg-amber-500 selection:text-neutral-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-amber-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 rotate-3 border-4 border-neutral-900">
            <Scissors className="text-neutral-950" size={36} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Jardel Barber Control</p>
        </div>

        <div className="bg-neutral-900/40 backdrop-blur-2xl p-10 rounded-[3rem] border border-neutral-800 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Usuário</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all text-sm"
                  placeholder="Seu e-mail"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all text-sm"
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                    <AlertCircle size={18} className="shrink-0" /> {error}
                  </div>
                </div>
                
                {/* Botão de Emergência destacado em caso de erro de rede */}
                <button 
                  type="button"
                  onClick={handleDemoAccess}
                  className="w-full py-5 bg-amber-500/10 text-amber-500 border border-amber-500/40 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-neutral-950 transition-all flex items-center justify-center gap-3 group shadow-[0_10px_30px_rgba(245,158,11,0.1)]"
                >
                  <Zap size={16} className="group-hover:fill-current" /> USAR ACESSO LOCAL DE EMERGÊNCIA
                </button>
              </div>
            )}

            {!error && (
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs italic flex items-center justify-center gap-3"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <ShieldCheck size={20} /> Entrar no Painel
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        <div className="mt-10 text-center space-y-4">
          <button 
            onClick={() => navigate('/')}
            className="text-neutral-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto group"
          >
            Sair e voltar ao site público <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
