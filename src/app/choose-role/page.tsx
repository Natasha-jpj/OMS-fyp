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
  const [hrErrors, setHrErrors] = useState<Record<string, string>>({});
  const [empErrors, setEmpErrors] = useState<Record<string, string>>({});

  const [hrForm, setHrForm] = useState({ 
    name: '', email: '', password: '', phone: '', 
    organization: '', organizationDomain: '', confirm: '' 
  });
  
  const [empForm, setEmpForm] = useState({ identifier: '', password: '' });

  const handleHrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHrForm(prev => ({ ...prev, [name]: value }));
    validateHrField(name, value);
  };

  const validateHrField = (name: string, value: string) => {
    const errors = { ...hrErrors };
    
    if (hrMode === 'signup') {
      if (name === 'name' && !value.trim()) {
        errors.name = 'Name is required';
      } else if (name === 'name') {
        delete errors.name;
      }
      
      if (name === 'organization' && !value.trim()) {
        errors.organization = 'Organization is required';
      } else if (name === 'organization') {
        delete errors.organization;
      }
      
      if (name === 'organizationDomain' && !value.trim()) {
        errors.organizationDomain = 'Domain is required';
      } else if (name === 'organizationDomain' && !/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(value)) {
        errors.organizationDomain = 'Enter valid domain (e.g., company.io)';
      } else if (name === 'organizationDomain') {
        delete errors.organizationDomain;
      }
    }
    
    if (name === 'email') {
      if (!value.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = 'Enter valid email';
      } else {
        delete errors.email;
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else if (value.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
        errors.password = 'Password must have uppercase letter and number';
      } else {
        delete errors.password;
      }
    }
    
    setHrErrors(errors);
  };

  const handleEmpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmpForm(prev => ({ ...prev, [name]: value }));
    validateEmpField(name, value);
  };

  const validateEmpField = (name: string, value: string) => {
    const errors = { ...empErrors };
    
    if (name === 'identifier') {
      if (!value.trim()) {
        errors.identifier = 'Email or ID is required';
      } else {
        delete errors.identifier;
      }
    }
    
    if (name === 'password') {
      if (!value) {
        errors.password = 'Password is required';
      } else {
        delete errors.password;
      }
    }
    
    setEmpErrors(errors);
  };

  const isHrFormValid = () => {
    if (hrMode === 'login') {
      return hrForm.email && hrForm.password && !hrErrors.email && !hrErrors.password;
    }
    return (
      hrForm.name && hrForm.email && hrForm.password &&
      hrForm.organization && hrForm.organizationDomain &&
      Object.keys(hrErrors).length === 0
    );
  };

  const isEmpFormValid = () => {
    return empForm.identifier && empForm.password && Object.keys(empErrors).length === 0;
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
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      
      {/* --- LEFT SIDE: FIXED BRANDING --- */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden border-r border-slate-200">
        <div className="absolute inset-0">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-100 ">
                <source src="/intel-bg.mp4" type="video/mp4" />
            </video>
        </div>

        {/* <div className="relative z-10 p-16 flex flex-col justify-between w-full h-full text-black">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="text-lg font-black tracking-tighter uppercase">AuraFlow</span>
            </div>
            <p className="text-slate-600 max-w-[280px] text-base leading-relaxed">
              Synchronize your workspace with the industry-standard management infrastructure.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-2 gap-3">
            <Feature icon={<ShieldCheck size={14} className="text-blue-950" />} text="Secure Auth" />
            <Feature icon={<Activity size={14} className="text-blue-950" />} text="Staff Sync" />
          </motion.div>
        </div> */}
      </div>

      {/* --- RIGHT SIDE: INDEPENDENT SCROLLING AUTH --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-20 flex flex-col items-center">
        <div className="w-full max-w-2xl px-16 py-20">
          
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-10 text-left">
              <Link href="/" className="flex items-center gap-2 mb-6 text-slate-400 hover:text-blue-950 transition-colors group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-medium uppercase tracking-widest">Back to Overview</span>
              </Link>
              <h2 className="text-5xl tracking-tighter text-black mb-2">Identity Access</h2>
              <p className="text-slate-600 font-medium uppercase text-xs tracking-[0.3em]">Select corporate portal</p>
          </motion.div>

          {/* Toggle Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-full mb-10 border border-slate-200">
            <button onClick={() => setRole('HR')} className={`flex-1 py-3 rounded-full font-medium text-sm uppercase tracking-widest transition-all ${role === 'HR' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-slate-600 hover:text-black'}`}>Admin Gateway</button>
            <button onClick={() => setRole('EMPLOYEE')} className={`flex-1 py-3 rounded-full font-medium text-sm uppercase tracking-widest transition-all ${role === 'EMPLOYEE' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-slate-600 hover:text-black'}`}>Staff Portal</button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {role === 'HR' ? (
              <motion.div key="hr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleSubmitHR} className="space-y-5">
                  <div className="flex gap-6 mb-8 border-b border-slate-200 pb-2">
                    <button type="button" onClick={() => setHrMode('login')} className={`pb-2 font-medium text-sm uppercase tracking-widest transition-all relative ${hrMode === 'login' ? 'text-black' : 'text-slate-400'}`}>
                        Sign In
                        {hrMode === 'login' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                    </button>
                    <button type="button" onClick={() => setHrMode('signup')} className={`pb-2 font-medium text-sm uppercase tracking-widest transition-all relative ${hrMode === 'signup' ? 'text-black' : 'text-slate-400'}`}>
                        Register
                        {hrMode === 'signup' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />}
                    </button>
                  </div>

                  {hrMode === 'signup' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 overflow-hidden">
                      <AuthInput label="Administrative Name" name="name" placeholder="John Doe" onChange={handleHrChange} value={hrForm.name} icon={undefined} error={hrErrors.name} />
                      <div className="grid grid-cols-2 gap-4">
                        <AuthInput label="Organization" name="organization" placeholder="AuraFlow Corp" onChange={handleHrChange} value={hrForm.organization} icon={undefined} error={hrErrors.organization} />
                        <AuthInput label="Domain" name="organizationDomain" placeholder="auraflow.io" onChange={handleHrChange} value={hrForm.organizationDomain} icon={undefined} error={hrErrors.organizationDomain} />
                      </div>
                    </motion.div>
                  )}

                  <AuthInput label="Corporate Email" name="email" type="email" placeholder="admin@auraflow.io" onChange={handleHrChange} value={hrForm.email} icon={<Mail size={14}/>} error={hrErrors.email} />
                  
                  <div className="relative">
                    <AuthInput label="Access Key" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={handleHrChange} value={hrForm.password} icon={<Lock size={14}/>} error={hrErrors.password} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-[38px] text-slate-400 hover:text-black transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button disabled={loading || !isHrFormValid()} className="w-full bg-black text-white py-4 rounded-full font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/10 hover:bg-slate-900 transition-all disabled:opacity-50 mt-4 active:scale-95">
                    {loading ? "Authenticating..." : hrMode === 'login' ? "Enter Workspace" : "Register"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="emp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <form onSubmit={handleSubmitWorkforce} className="space-y-6">
                  <div className="p-5 bg-slate-100 border border-slate-200 rounded-[1.5rem] text-center mb-8 backdrop-blur-md">
                    <p className="text-sm font-medium text-black uppercase tracking-[0.2em] leading-relaxed">Authorized Personnel Access<br/><span className="text-slate-600">(Managers & Staff)</span></p>
                  </div>
                  <AuthInput label="Workforce Identity" name="identifier" placeholder="Corporate ID or Email" onChange={handleEmpChange} value={empForm.identifier} icon={<Users size={14}/>} error={empErrors.identifier} />
                  <AuthInput label="Access Key" name="password" type="password" placeholder="••••••••" onChange={handleEmpChange} value={empForm.password} icon={<Lock size={14}/>} error={empErrors.password} />
                  <button disabled={loading || !isEmpFormValid()} className="w-full bg-black text-white py-4 rounded-full font-semibold uppercase text-sm tracking-widest shadow-lg shadow-black/10 hover:bg-slate-900 transition-all active:scale-[0.98] mt-4 disabled:opacity-50">
                    {loading ? "Validating..." : "Authorize Access"}
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

function AuthInput({ label, icon, error, ...props }: { label: string; icon: React.ReactNode; error?: string; [key: string]: unknown }) {
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] uppercase tracking-[0.3em] font-medium text-slate-600 ml-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
        <input {...props} className={`w-full bg-white border rounded-xl ${icon ? 'pl-12' : 'px-6'} py-3.5 text-black focus:outline-none transition-all font-medium text-sm placeholder:text-slate-400 ${error ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-blue-900'}`} />
      </div>
      {error && <p className="text-xs text-red-500 ml-2">{error}</p>}
    </div>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-100 border border-slate-200 p-4 rounded-[1.5rem]">
      <div className="p-1.5 bg-slate-200 rounded-lg">{icon}</div>
      <span className="text-[10px] font-black tracking-widest uppercase text-black">{text}</span>
    </div>
  );
}