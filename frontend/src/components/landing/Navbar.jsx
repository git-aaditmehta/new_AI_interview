import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

export default function Navbar({ onGetStarted }) {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-md rounded-full"></div>
            <BrainCircuit size={32} className="text-white relative z-10" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            AI Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Pro</span>
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-[#cbd5e1] font-medium">
          <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How it Works</a>
        </div>

        {/* CTA */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-6 py-2.5 bg-white text-black font-bold rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-shadow group"
          onClick={onGetStarted}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white to-[#cbd5e1] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10">Get Started</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
