import React from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AIPanel from '../AIPanel';

export default function HeroSection({ onGetStarted }) {
  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Gradient & Glow Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-black to-black z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] mix-blend-screen"></div>

      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-10 opacity-70">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#818cf8" />
          <pointLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
          <AIPanel />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto text-center pointer-events-none">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 pointer-events-auto shadow-[0_0_20px_rgba(79,70,229,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span className="text-sm font-medium text-[#cbd5e1]">Powered by Next-Gen AI</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-6 leading-[1.1]"
        >
          AI-Powered <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#e879f9]">
            Interview Simulator
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
          className="text-lg md:text-2xl text-[#cbd5e1] max-w-3xl mb-12 font-medium drop-shadow-md"
        >
          Practice real interviews with AI. Get instant feedback, refine your answers, and improve faster before the real deal.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
          className="pointer-events-auto"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="group relative px-10 py-5 bg-white text-black font-extrabold text-xl rounded-full overflow-hidden transition-all shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:shadow-[0_0_80px_rgba(255,255,255,1)] flex items-center justify-center gap-3"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#e2e8f0] to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative flex items-center justify-center gap-3">
               Get Started Now
               <svg 
                className="w-6 h-6 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
               >
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </span>
          </motion.button>
        </motion.div>
      </div>

    </div>
  );
}
