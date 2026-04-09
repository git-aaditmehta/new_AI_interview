import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowRight, 
  BrainCircuit, 
  UploadCloud, 
  FileJson, 
  Zap, 
  Settings,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

import HeroScene from '../components/HeroScene';
import { Button, GlassCard } from '../components/ui';
import { apiService } from '../services/apiService';

export default function Home() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  
  // Setup Form State
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    job_description: '',
    ai_voice: 'en-US-GuyNeural',
    max_questions: 5,
  });
  const [dragActive, setDragActive] = useState(false);

  // API Mutations
  const { mutate: uploadResume, isPending: isUploading } = useMutation({
    mutationFn: apiService.uploadResume,
    onSuccess: (resumeRes) => {
      createInterviewMutation.mutate({
        ...formData,
        candidate_name: resumeRes.candidate_name,
        resume_id: resumeRes.resume_id,
      });
    },
    onError: (error) => {
      console.error('Upload Error:', error);
      alert('Failed to upload resume. Please check if the backend is running.');
    }
  });

  const createInterviewMutation = useMutation({
    mutationFn: apiService.createInterview,
    onSuccess: (sessionData) => {
      const id = sessionData.interview_id;
      localStorage.setItem(`aiInterview:maxQuestions:${id}`, String(formData.max_questions));
      localStorage.setItem(`aiInterview:voice:${id}`, String(formData.ai_voice));
      navigate(`/interview/${id}`);
    },
    onError: (error) => {
      console.error('Create Interview Error:', error);
      alert('Failed to create interview session.');
    }
  });

  const handleStart = (e) => {
    e.preventDefault();
    if (!file) return alert('Please upload your resume');
    uploadResume(file);
  };

  return (
    <div className="relative h-screen w-full bg-[#010208] text-white overflow-hidden flex flex-col md:flex-row">
      
      {/* 3D Visual Side (Dynamic width based on state) */}
      <motion.div 
        animate={{ width: showForm ? '40%' : '100%' }}
        className="absolute inset-0 md:relative md:h-full z-0 transition-all duration-700"
      >
        <Canvas camera={{ position: [0, 2, 12], fov: 50 }}>
          <HeroScene />
        </Canvas>
        
        {/* Glow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full md:w-auto flex-1 flex flex-col justify-center items-center px-6 md:px-12">
        
        <AnimatePresence mode="wait">
          {!showForm ? (
            /* HERO STATE */
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="text-center md:text-left max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                  <BrainCircuit size={28} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">PREPWISE</h2>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl">
                AI INTERVIEW <br />
                <span className="text-blue-500 text-glow">REDEFINED</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-10 font-medium">
                Practice with hyper-realistic AI agents and land your dream job with instant feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button onClick={() => setShowForm(true)} className="h-16 px-10 text-xl group">
                  Get Started <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <div className="flex items-center gap-4 px-6 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                   <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800" />)}
                   </div>
                   <span className="text-xs font-bold text-gray-400">JOIN 10k+ CANDIDATES</span>
                </div>
              </div>
            </motion.div>
          ) : (
            /* SETUP STATE */
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-full max-w-xl"
            >
              <GlassCard className="bg-black/60 border-white/10 p-10 ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-3xl font-black tracking-tight">Setup Interview</h2>
                   <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">Cancel</button>
                </div>

                <form onSubmit={handleStart} className="space-y-6">
                  {/* Upload Area */}
                  <div 
                    className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center ${
                      dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/30'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => { e.preventDefault(); setDragActive(false); setFile(e.dataTransfer.files[0]); }}
                  >
                    {file ? (
                      <div className="flex items-center justify-between bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                        <div className="flex items-center gap-3">
                          <FileJson className="text-blue-400" />
                          <span className="text-sm font-bold truncate max-w-[150px]">{file.name}</span>
                        </div>
                        <button type="button" onClick={() => setFile(null)} className="text-xs text-red-500 font-bold">REMOVE</button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className="mx-auto mb-2 text-gray-600" size={32} />
                        <p className="text-sm font-medium mb-1">Upload Resume (PDF)</p>
                        <input type="file" id="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                        <label htmlFor="file" className="text-xs text-blue-500 font-bold cursor-pointer hover:underline uppercase tracking-widest">Browse Files</label>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-black uppercase tracking-widest text-gray-500">Target Role / Job Description</label>
                       <textarea 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="Paste job details or role here..."
                        value={formData.job_description}
                        onChange={(e) => setFormData({...formData, job_description: e.target.value})}
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500">Interviewer Voice</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none"
                            value={formData.ai_voice}
                            onChange={(e) => setFormData({...formData, ai_voice: e.target.value})}
                          >
                            <option value="en-US-GuyNeural">Alex (Male)</option>
                            <option value="en-US-AriaNeural">Aria (Female)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-gray-500">Duration</label>
                          <select 
                            className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 outline-none"
                            value={formData.max_questions}
                            onChange={(e) => setFormData({...formData, max_questions: Number(e.target.value)})}
                          >
                            <option value={3}>Short (3 Qs)</option>
                            <option value={5}>Standard (5 Qs)</option>
                          </select>
                       </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-14 text-lg" 
                    disabled={isUploading || createInterviewMutation.isPending}
                  >
                    {isUploading || createInterviewMutation.isPending ? 'Preparing Session...' : 'Start Session'}
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Trust Badges Sidebar (hidden on mobile) */}
      {!showForm && (
        <div className="hidden lg:flex flex-col justify-center gap-12 px-12 border-l border-white/5 bg-black/20 backdrop-blur-3xl z-10 w-[300px]">
           <div className="space-y-2">
              <Zap className="text-blue-500" />
              <h4 className="font-bold text-sm">Real-time Analysis</h4>
              <p className="text-xs text-gray-500">Instant feedback powered by OpenAI</p>
           </div>
           <div className="space-y-2">
              <ShieldCheck className="text-green-500" />
              <h4 className="font-bold text-sm">SECURE PLATFORM</h4>
              <p className="text-xs text-gray-500">Your data is encrypted & private</p>
           </div>
           <div className="space-y-2">
              <Settings className="text-purple-500" />
              <h4 className="font-bold text-sm">Adaptive Difficulty</h4>
              <p className="text-xs text-gray-500">AI learns from your responses</p>
           </div>
        </div>
      )}
    </div>
  );
}
