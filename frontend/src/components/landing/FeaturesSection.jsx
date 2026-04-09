import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Mic, Brain, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <Mic className="w-8 h-8 text-[#818cf8]" />,
    title: "Voice-Based Interviews",
    description: "Engage in natural, real-time voice conversations with an AI that adapts to your responses, just like a real human recruiter."
  },
  {
    icon: <Brain className="w-8 h-8 text-[#a78bfa]" />,
    title: "AI Evaluation & Feedback",
    description: "Receive instant, objective feedback on your answers, body language, and speaking pace to pinpoint areas for improvement."
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-[#e879f9]" />,
    title: "Performance Analytics",
    description: "Track your progress over time with detailed analytics, scoring metrics, and actionable insights to ace your dream job interview."
  }
];

export default function FeaturesSection() {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 bg-black overflow-hidden z-10 w-full">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-black text-white mb-6"
          >
            Level up your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818cf8] to-[#e879f9]">Interview Game</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[#94a3b8] text-lg md:text-xl max-w-2xl mx-auto"
          >
            Everything you need to build confidence and polish your skills before you meet the real hiring manager.
          </motion.p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -10 }}
              className="relative group p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div className="relative h-full bg-[#0a0a0a]/80 backdrop-blur-xl p-8 rounded-[23px] border border-white/5 flex flex-col gap-5 overflow-hidden">
                {/* Glow effect on hover */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 blur-[50px] rounded-full group-hover:bg-primary/20 transition-colors duration-500"></div>
                
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white tracking-tight">{feature.title}</h3>
                
                <p className="text-[#a1a1aa] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
