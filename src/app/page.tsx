"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center overflow-hidden font-sans">
      
      {/* Background: Raw Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-100 grayscale"
        >
          <source src="/intel-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        
        {/* Modern Branding Label */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md mb-10"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
        </motion.div>

        {/* Scaled Headlines */}
        <div className="space-y-6 mb-12">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]"
          >
            Office Management 
            <span className="text-blue-300 font-medium">  Simplified.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-base md:text-lg text-white/80 font-medium leading-relaxed"
          >
            The central hub to coordinate your departments, manage your workforce, 
            and track every project in real-time.
          </motion.p>
        </div>

        {/* Compact Action Hub */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/choose-role" className="group flex items-center gap-3 px-10 py-4 bg-white text-black rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/20">
            Enter Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
{/*           
          <button className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-sm hover:bg-white/20 transition-all">
            View Features
          </button> */}
        </motion.div>

        {/* Bottom Status Bar */}
        <motion.div
           initial={{ opacity: 0 }} 
           animate={{ opacity: 0.7 }} 
           transition={{ delay: 0.6 }}
           className="mt-24 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60"
        >
           Secure Connection Established // AuraFlow Management
        </motion.div>

      </div>
    </div>
  );
}