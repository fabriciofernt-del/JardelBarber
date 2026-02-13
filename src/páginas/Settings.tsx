
import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Save, 
  MapPin, 
  ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Scissors, 
  Upload, 
  Image as LucideImage 
} from 'lucide-react';
import { CURRENT_TENANT, SETTINGS } from '../constants';

export const Settings: React.FC = () => {
  const [tenantName, setTenantName] = useState(CURRENT_TENANT.name);
  const [logoUrl, setLogoUrl] = useState(CURRENT_TENANT.logo_url || '');
  const [headerBgUrl, setHeaderBgUrl] = useState(CURRENT_TENANT.header_bg_url || '');
  const [instagram, setInstagram] = useState(SETTINGS.social_instagram || '');
  const [facebook, setFacebook] = useState(SETTINGS.social_facebook || '');
  const [whatsapp, setWhatsapp] = useState(SETTINGS.whatsapp_number || '');
  const [address, setAddress] = useState(SETTINGS.location_address);
  const [city, setCity] = useState(SETTINGS.location_city);
  const [state, setState] = useState(SETTINGS.location_state);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    
    const updatedTenant = {
      ...CURRENT_TENANT,
      name: tenantName,
      logo_url: logoUrl,
      header_bg_url: headerBgUrl
    };

    const updatedSettings = {
      ...SETTINGS,
      location_address: address,
      location_city: city,
      location_state: state,
      social_instagram: instagram,
      social_facebook: facebook,
      whatsapp_number: whatsapp
    };

    // Simulate API call and persist to localStorage
    setTimeout(() => {
      localStorage.setItem('jb_tenant_data', JSON.stringify(updatedTenant));
      localStorage.setItem('jb_settings_data', JSON.stringify(updatedSettings));
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Force reload to update Layout and other components
      window.location.reload();
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'header') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'logo') setLogoUrl(base64);
        else setHeaderBgUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Header Preview / Cover Photo */}
        <div className="h-64 bg-neutral-950 relative overflow-hidden group/header">
          {headerBgUrl ? (
            <img 
              src={headerBgUrl} 
              alt="Background Preview" 
              className="w-full h-full object-cover opacity-60 group-hover/header:scale-105 transition-transform duration-700" 
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop'; }}
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex flex-col items-center justify-center gap-2">
               <LucideImage size={48} className="text-neutral-800" />
               <span className="text-[10px] font-black text-neutral-800 uppercase tracking-widest">Sem Imagem de Capa</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 to-transparent"></div>
          
          <div className="absolute top-8 right-8 flex gap-3 z-20">
            <button 
              onClick={() => headerInputRef.current?.click()}
              className="px-6 py-4 bg-white text-neutral-950 rounded-2xl hover:bg-amber-500 transition-all shadow-2xl flex items-center gap-3 text-[11px] font-black uppercase tracking-widest italic group/btn"
            >
              <Upload size={18} className="group-hover/btn:scale-110 transition-transform" /> UPAR FOTO DE CAPA
            </button>
            <input type="file" ref={headerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'header')} />
          </div>

          <div className="absolute -bottom-14 left-12">
            <div className="relative group/logo">
              <div className="w-40 h-40 rounded-[2.5rem] bg-neutral-950 p-2 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.6)] border-4 border-white overflow-hidden flex items-center justify-center">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&h=400&auto=format&fit=crop'; }}
                  />
                ) : (
                  <span className="text-3xl font-black text-amber-500 italic">JB</span>
                )}
              </div>
              <button 
                onClick={() => logoInputRef.current?.click()}
                className="absolute inset-0 bg-neutral-950/70 rounded-[2.5rem] opacity-0 group-hover/logo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2 border-4 border-amber-500/50"
              >
                <Camera size={32} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">TROCAR PERFIL</span>
              </button>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
            </div>
          </div>
        </div>
        
        <div className="pt-24 p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Visual Identity Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 text-neutral-950 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
                  <Scissors size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-neutral-950 uppercase italic tracking-tighter">Identidade Visual</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customize a marca da sua barbearia</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Nome da Barbearia</label>
                  <input 
                    type="text" 
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-black text-neutral-950 italic uppercase tracking-tight text-lg" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">URL ou Código da Logo</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type="text" 
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="Cole um link ou use o botão de upload acima"
                      className="w-full pl-14 pr-5 py-5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-bold text-xs" 
                    />
                  </div>
                </div>
                {/* Visual indicator for upload preference */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                   <div className="bg-white p-2 rounded-xl shadow-sm text-amber-500">
                      <Upload size={16} />
                   </div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Toque nas fotos acima para upar direto do celular</p>
                </div>
              </div>
            </div>
            
            {/* Location Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-amber-500 text-neutral-950 p-3 rounded-2xl shadow-lg shadow-amber-500/20">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-neutral-950 uppercase italic tracking-tighter">Localização</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Endereço da unidade física</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, Número, Bairro"
                    className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-black text-neutral-900 text-sm" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Cidade</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-black text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">UF</label>
                    <input 
                      type="text" 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all font-black text-sm" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[11px] tracking-widest animate-in fade-in slide-in-from-left-4">
                  <CheckCircle2 size={20} /> Perfil Jardel Barber Atualizado!
                </div>
              )}
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-neutral-950 text-amber-500 px-12 py-6 rounded-[2rem] font-black hover:bg-amber-500 hover:text-neutral-950 transition-all shadow-2xl shadow-amber-500/10 flex items-center gap-3 uppercase tracking-[0.2em] text-xs italic border-2 border-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save size={20} />
              )}
              {isSaving ? 'SALVANDO MARCA...' : 'SALVAR PERFIL JARDEL BARBER'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-500/5 p-8 rounded-[2.5rem] border border-amber-500/10 flex items-start gap-6">
        <div className="bg-amber-500 text-neutral-950 p-3 rounded-2xl shadow-lg shadow-amber-900/10">
           <AlertCircle size={24} />
        </div>
        <div>
           <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Aviso de Sincronização</p>
           <p className="text-sm text-slate-500 font-medium leading-relaxed">
             Suas alterações serão refletidas instantaneamente na <b>Página Pública</b> e no seu <b>Painel Administrativo</b> assim que você clicar em salvar. Use fotos em alta definição para um resultado premium.
           </p>
        </div>
      </div>
    </div>
  );
};

