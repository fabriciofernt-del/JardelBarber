
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ShieldCheck, AlertCircle, Scissors, ArrowRight, Zap } from 'lucide-react';

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
      // Tentativa de login real
      const { data, error: authError } = await (supabase.auth as any).signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      
      // Sucesso: Vai para o painel administrativo
      navigate('/admin', { replace: true });
    } catch (err: any) {
      console.error("Erro de login:", err);
      setError(err.message === 'Failed to fetch' 
        ? 'Erro de Conexão: O sistema não conseguiu alcançar o banco de dados.' 
        : 'Credenciais inválidas ou acesso negado.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
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
        <div className="text-center mb-12">
          <div className="bg-amber-500 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 rotate-3 border-4 border-neutral-900">
            <Scissors className="text-neutral-950" size={36} />
          </div>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Scheduly Admin</h1>
          <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Acesso Restrito à Gestão Elite</p>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-xl p-10 rounded-[3rem] border border-neutral-800 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail Profissional</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                  placeholder="Seu e-mail de admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Chave de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-amber-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 p-5 pl-14 rounded-2xl text-white font-bold outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-amber-500 text-neutral-950 font-black rounded-[2rem] hover:bg-amber-400 transition-all shadow-[0_20px_40px_-10px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-xs italic flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={20} /> Entrar no Painel
                </>
              )}
            </button>
            
            {/* Atalho de emergência caso queira apenas visualizar o painel sem logar no Supabase agora */}
            <button 
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-4 text-neutral-500 hover:text-amber-500 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Zap size={14} /> Usar Acesso Local (Apenas Visualização)
            </button>
          </form>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-neutral-600 hover:text-amber-500 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Voltar para Página Pública <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
