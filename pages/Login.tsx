
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ShieldCheck, AlertCircle, Scissors, ArrowRight, Zap, RefreshCw } from 'lucide-react';

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
      // Tentativa de login real
      const { data, error: authError } = await (supabase.auth as any).signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      localStorage.removeItem('jb_admin_session');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error("Erro de login:", err);
      // Se falhar a conexão, avisamos o usuário
      if (err.message?.toLowerCase().includes('fetch') || err.message?.includes('network')) {
        setError('O sistema não conseguiu conectar ao banco de dados. Use o acesso de emergência abaixo.');
      } else {
        setError('E-mail ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    localStorage.setItem('jb_admin_session', 'true');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="bg-amber-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 rotate-3 border-4 border-neutral-900">
            <Scissors className="text-neutral-950" size={36} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Painel Admin</h1>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-2xl p-10 rounded-[3rem] border border-neutral-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Seu E-mail</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all"
                  placeholder="exemplo@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 mb-2 block">Sua Senha</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-500 text-[10px] font-bold uppercase flex items-center gap-3">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-3 uppercase tracking-widest italic"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <ShieldCheck size={20} />}
              Entrar no Painel
            </button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-800"></div></div>
              <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-widest"><span className="bg-neutral-900 px-4 text-neutral-600">Ou use</span></div>
            </div>

            <button 
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-4 border border-amber-500/30 text-amber-500 font-bold rounded-2xl hover:bg-amber-500/10 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <Zap size={16} /> Acesso de Emergência
            </button>
          </form>
        </div>
        
        <button onClick={() => navigate('/')} className="mt-8 w-full text-neutral-600 hover:text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          Voltar para o site <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
