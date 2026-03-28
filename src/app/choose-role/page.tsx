"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Users, ShieldCheck, 
  Activity, Lock, Mail, ArrowLeft, LayoutDashboard 
} from 'lucide-react';
import Link from 'next/link';

export default function ChooseRolePage() {
  const router = useRouter();
  const [role, setRole] = useState<'HR' | 'EMPLOYEE'>('HR');
  const [hrMode, setHrMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [hrForm, setHrForm] = useState({ 
    name: '', email: '', password: '', phone: '', 
    organization: '', organizationDomain: '', confirm: '' 
  });
  
  const [empForm, setEmpForm] = useState({ identifier: '', password: '' });

  const handleHrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHrForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEmpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmpForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitHR = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = hrMode === 'signup' ? '/api/hr/signup' : '/api/hr/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hrMode === 'signup' ? hrForm : { email: hrForm.email, password: hrForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('hr', JSON.stringify(data.hr));
      router.push('/hr/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWorkforce = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: empForm.identifier, password: empForm.password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('user', JSON.stringify(data.employee));
      localStorage.setItem('token', data.token);

      if (data.employee.role === 'MANAGER') {
        router.push('/manager/dashboard');
      } else if (data.employee.role === 'ADMIN') {
        router.push('/hr/dashboard');
      } else {
        router.push('/employee/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-sans selection:bg-[#FFD541] selection:text-black">
      
      {/* --- LEFT SIDE: FIXED BRANDING (No Scroll) --- */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale-[40%]">
                <source src="/intel-bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 bg-[#FFD541] rounded-lg flex items-center justify-center">
                <LayoutDashboard size={18} className="text-black" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">AuraFlow</span>
            </div>
            {/* <h1 className="text-6xl font-medium tracking-tighter mb-6 leading-[0.95]">
                Professional <br/>
                <span className="text-[#FFD541] italic font-bold">Control.</span>
            </h1> */}
            <p className="text-white/40 max-w-[280px] text-base leading-relaxed">
              Synchronize your workspace with the industry-standard management infrastructure.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3">
            <Feature icon={<ShieldCheck size={14} className="text-[#FFD541]" />} text="Secure Auth" />
            <Feature icon={<Activity size={14} className="text-[#FFD541]" />} text="Staff Sync" />
          </motion.div>
        </div>
      </div>

      {/* --- RIGHT SIDE: INDEPENDENT SCROLLING AUTH --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 flex flex-col items-center">
        <div className="w-full max-w-md px-8 py-20">
          
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 text-left">
              <Link href="/" className="flex items-center gap-2 mb-6 text-white/30 hover:text-[#FFD541] transition-colors group">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest">Back to Overview</span>
              </Link>
              <h2 className="text-4xl font-bold tracking-tighter text-white mb-2">Identity Access</h2>
              <p className="text-white/30 font-bold uppercase text-[8px] tracking-[0.3em]">Select corporate portal</p>
          </motion.div>

          {/* Toggle Switcher */}
          <div className="flex bg-white/5 p-1 rounded-full mb-10 border border-white/5">
            <button onClick={() => setRole('HR')} className={`flex-1 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all ${role === 'HR' ? 'bg-[#FFD541] text-black shadow-lg shadow-[#FFD541]/10' : 'text-white/40 hover:text-white'}`}>Admin Gateway</button>
            <button onClick={() => setRole('EMPLOYEE')} className={`flex-1 py-3 rounded-full font-bold text-[9px] uppercase tracking-widest transition-all ${role === 'EMPLOYEE' ? 'bg-[#FFD541] text-black shadow-lg shadow-[#FFD541]/10' : 'text-white/40 hover:text-white'}`}>Staff Portal</button>
          </div>

          <AnimatePresence mode="wait">
            {role === 'HR' ? (
              <motion.div key="hr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleSubmitHR} className="space-y-5">
                  <div className="flex gap-6 mb-8 border-b border-white/5 pb-2">
                    <button type="button" onClick={() => setHrMode('login')} className={`pb-2 font-black text-[9px] uppercase tracking-widest transition-all relative ${hrMode === 'login' ? 'text-[#FFD541]' : 'text-white/20'}`}>
                        Sign In
                        {hrMode === 'login' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FFD541]" />}
                    </button>
                    <button type="button" onClick={() => setHrMode('signup')} className={`pb-2 font-black text-[9px] uppercase tracking-widest transition-all relative ${hrMode === 'signup' ? 'text-[#FFD541]' : 'text-white/20'}`}>
                        Register
                        {hrMode === 'signup' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#FFD541]" />}
                    </button>
                  </div>

                  {hrMode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 overflow-hidden">
                      <AuthInput label="Administrative Name" name="name" placeholder="John Doe" onChange={handleHrChange} value={hrForm.name} />
                      <div className="grid grid-cols-2 gap-4">
                        <AuthInput label="Organization" name="organization" placeholder="AuraFlow Corp" onChange={handleHrChange} value={hrForm.organization} />
                        <AuthInput label="Domain" name="organizationDomain" placeholder="auraflow.io" onChange={handleHrChange} value={hrForm.organizationDomain} />
                      </div>
                    </motion.div>
                  )}

                  <AuthInput label="Corporate Email" name="email" type="email" placeholder="admin@auraflow.io" onChange={handleHrChange} value={hrForm.email} icon={<Mail size={14}/>} />
                  
                  <div className="relative">
                    <AuthInput label="Access Key" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={handleHrChange} value={hrForm.password} icon={<Lock size={14}/>} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-[38px] text-white/20 hover:text-[#FFD541] transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button disabled={loading} className="w-full bg-[#FFD541] text-black py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl shadow-[#FFD541]/5 hover:bg-yellow-400 transition-all disabled:opacity-50 mt-4 active:scale-95">
                    {loading ? "Authenticating..." : hrMode === 'login' ? "Enter Workspace" : "Establish Network"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="emp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleSubmitWorkforce} className="space-y-6">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-center mb-8 backdrop-blur-md">
                    <p className="text-[8px] font-bold text-[#FFD541] uppercase tracking-[0.2em] leading-relaxed">Authorized Personnel Access<br/><span className="text-white/30">(Managers & Staff)</span></p>
                  </div>
                  <AuthInput label="Workforce Identity" name="identifier" placeholder="Corporate ID or Email" onChange={handleEmpChange} value={empForm.identifier} icon={<Users size={14}/>} />
                  <AuthInput label="Access Key" name="password" type="password" placeholder="••••••••" onChange={handleEmpChange} value={empForm.password} icon={<Lock size={14}/>} />
                  <button disabled={loading} className="w-full bg-[#FFD541] text-black py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-yellow-400 transition-all active:scale-[0.98] mt-4">
                    {loading ? "Validating..." : "Authorize Connection"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function AuthInput({ label, icon, ...props }: any) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[8px] uppercase tracking-[0.3em] font-black text-white/30 ml-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20">{icon}</div>}
        <input {...props} className={`w-full bg-white/5 border border-white/10 rounded-xl ${icon ? 'pl-12' : 'px-6'} py-3.5 text-white focus:border-[#FFD541]/50 outline-none transition-all font-medium text-xs backdrop-blur-sm placeholder:text-white/10`} />
      </div>
    </div>
  );
}

function Feature({ icon, text }: any) {
  return (
    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-[1.5rem] border border-white/10">
      <div className="p-1.5 bg-white/5 rounded-lg">{icon}</div>
      <span className="text-[10px] font-black tracking-widest uppercase">{text}</span>
    </div>
  );
}