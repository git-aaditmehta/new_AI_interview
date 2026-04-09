import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileJson, Play, Settings, ArrowLeft, BrainCircuit, ArrowRight } from 'lucide-react';
import { uploadResume, createInterview } from '../utils/api';

export default function Landing() {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [voice, setVoice] = useState('en-US-GuyNeural');
  const [maxQuestions, setMaxQuestions] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleStart = async () => {
    if (!file) {
      setError("Please upload your resume first");
      return;
    }
    if (!jd.trim()) {
      setError("Please provide a job description");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const resumeRes = await uploadResume(file);
      
      const sessionData = await createInterview({
        candidate_name: resumeRes.candidate_name,
        job_description: jd,
        resume_id: resumeRes.resume_id,
        max_questions: maxQuestions,
        ai_voice: voice
      });
      
      const interviewId = sessionData.interview_id;
      try {
        localStorage.setItem(`aiInterview:maxQuestions:${interviewId}`, String(maxQuestions));
        localStorage.setItem(`aiInterview:voice:${interviewId}`, String(voice));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
      navigate(`/interview/${interviewId}`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!showSetup) {
    return (
      <div className="container min-h-screen relative overflow-hidden flex flex-col justify-center py-10 perspective bg-black text-white">
        <div className="w-full h-full flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-4xl mx-auto text-center animate-fade-in flex flex-col items-center">
            <div className="mb-8 relative">
              <div className="absolute shadow-[0_0_100px_rgba(79,70,229,0.8)] bg-primary blur-[60px] opacity-40 rounded-full w-40 h-40 left-1/2 -translate-x-1/2 -translate-y-4"></div>
              <BrainCircuit size={100} className="text-white relative z-10 animate-float drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-white drop-shadow-2xl leading-tight mix-blend-screen">
              AI Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-secondary animate-gradient-x">Pro</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#cbd5e1] mb-12 max-w-2xl leading-relaxed mx-auto font-medium drop-shadow-md">
              Experience realistic mock interviews with conversational AI and improve with instant feedback.
            </p>

            <button
              onClick={() => setShowSetup(true)}
              className="group relative px-12 py-5 bg-white text-black font-extrabold text-xl md:text-2xl rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.8)] hover:shadow-[0_0_80px_rgba(255,255,255,1)] flex items-center justify-center"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#e2e8f0] to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-3">
                Get Started <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen relative overflow-hidden flex flex-col justify-center py-10 perspective bg-black text-white">
      <div className="w-full h-full flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-5xl mx-auto animate-slide-up backdrop-blur-md">
          
          <button 
             className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors cursor-pointer bg-white/10 px-4 py-2 rounded-full backdrop-blur-lg border border-white/10"
             onClick={() => setShowSetup(false)}
          >
             <ArrowLeft size={20} /> Back to Home
          </button>
          
          <div className="glass-panel p-8 md:p-12 grid md:grid-cols-2 gap-12 shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-white/20 bg-[#0f172a]/80 rounded-3xl">
             
             {/* Left Column: Upload */}
             <div className="flex flex-col gap-6">
               <h2 className="text-3xl font-bold flex items-center gap-3 text-white drop-shadow-md">
                 <UploadCloud className="text-[#818cf8]" size={32} /> Setup Profile
               </h2>
               <p className="text-[#94a3b8]">Upload your resume to allow the AI to ask highly personalized questions based on your background.</p>
               
               <div 
                 className={`flex-1 min-h-[220px] border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all bg-black/40 backdrop-blur-md ${
                   dragActive ? "border-[#818cf8] bg-[#818cf8]/20 scale-105" : "border-white/20 hover:border-[#818cf8]/50"
                 }`}
                 onDragEnter={handleDrag}
                 onDragLeave={handleDrag}
                 onDragOver={handleDrag}
                 onDrop={handleDrop}
               >
                 {file ? (
                   <div className="flex flex-col items-center gap-4 text-success animate-fade-in">
                     <div className="p-4 bg-emerald-500/20 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                         <FileJson size={48} className="text-emerald-400 drop-shadow-lg" />
                     </div>
                     <span className="font-semibold text-lg text-white">{file.name}</span>
                     <span className="text-sm text-[#cbd5e1]">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                     <button 
                       className="text-white bg-white/10 px-4 py-2 rounded-lg text-sm mt-2 hover:bg-white/20 transition-colors border border-white/10"
                       onClick={() => setFile(null)}
                     >
                       Replace File
                     </button>
                   </div>
                 ) : (
                   <div className="animate-fade-in flex flex-col items-center">
                     <div className="p-4 bg-white/10 rounded-full mb-4 shadow-lg border border-white/5">
                         <UploadCloud size={48} className="text-[#cbd5e1]" />
                     </div>
                     <h3 className="font-semibold mb-2 text-lg text-white">Upload your Resume</h3>
                     <p className="text-sm text-[#94a3b8] mb-6">Drag and drop your PDF file here, or click to browse</p>
                     <input 
                       type="file" 
                       accept="application/pdf"
                       className="hidden" 
                       id="file-upload"
                       onChange={(e) => e.target.files && setFile(e.target.files[0])}
                     />
                     <label htmlFor="file-upload" className="cursor-pointer bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                       Choose PDF File
                     </label>
                   </div>
                 )}
               </div>
             </div>
     
             {/* Right Column: JD & Start */}
             <div className="flex flex-col gap-6">
               <div className="flex flex-col flex-1 gap-6">
                 <div className="input-group flex-1 flex flex-col m-0">
                   <label className="input-label flex items-center gap-2 mb-3 text-lg font-medium text-white drop-shadow-md">
                     <FileJson size={20} className="text-[#a78bfa]" /> Target Job Description
                   </label>
                   <textarea 
                     className="input-field flex-1 min-h-[160px] text-base leading-relaxed bg-black/60 border border-white/20 rounded-xl p-4 backdrop-blur-sm text-white placeholder-white/30 focus:border-[#818cf8] focus:outline-none" 
                     placeholder="Paste the target job description here..."
                     value={jd}
                     onChange={(e) => setJd(e.target.value)}
                   ></textarea>
                 </div>
                 
                 <div className="input-group m-0">
                   <label className="input-label flex items-center gap-2 mb-3 text-lg font-medium text-white drop-shadow-md">
                     <Settings size={20} className="text-[#e879f9]" /> AI Interviewer Voice
                   </label>
                   <select 
                     className="input-field h-14 text-base bg-black/60 border border-white/20 rounded-xl px-4 cursor-pointer text-white backdrop-blur-sm focus:border-[#818cf8] focus:outline-none" 
                     value={voice}
                     onChange={(e) => setVoice(e.target.value)}
                   >
                     <option value="en-US-GuyNeural">Alex (Male - American)</option>
                     <option value="en-US-AriaNeural">Aria (Female - American)</option>
                    <option value="en-AU-NatashaNeural">Natasha (Female - Australian)</option>
                     <option value="en-GB-SoniaNeural">Sonia (Female - British)</option>
                   </select>
                 </div>

                <div className="input-group m-0">
                  <label className="input-label flex items-center gap-2 mb-3 text-lg font-medium text-white drop-shadow-md">
                    <span className="inline-block w-2 h-2 rounded-full bg-[#818cf8]" /> Number of Questions
                  </label>
                  <select
                    className="input-field h-14 text-base bg-black/60 border border-white/20 rounded-xl px-4 cursor-pointer text-white backdrop-blur-sm focus:border-[#818cf8] focus:outline-none"
                    value={maxQuestions}
                    onChange={(e) => setMaxQuestions(Number(e.target.value))}
                  >
                    <option value={3}>3 questions</option>
                    <option value={5}>5 questions</option>
                    <option value={7}>7 questions</option>
                    <option value={10}>10 questions</option>
                  </select>
                </div>
               </div>
     
               {error && <div className="text-[#fca5a5] text-sm font-semibold text-center p-3 bg-red-500/20 border border-red-500/50 rounded-lg animate-fade-in backdrop-blur-sm">{error}</div>}
     
               <button 
                 className="w-full h-16 shadow-[0_0_40px_rgba(129,140,248,0.5)] mt-2 text-lg tracking-wide rounded-xl font-bold bg-gradient-to-r from-[#818cf8] via-[#c084fc] to-[#e879f9] text-white hover:shadow-[0_0_60px_rgba(129,140,248,0.7)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                 onClick={handleStart}
                 disabled={isUploading}
               >
                 {isUploading ? (
                   <span className="flex items-center justify-center gap-3 opacity-90"><Settings className="animate-spin" size={24} /> Preparing Session...</span>
                 ) : (
                   <span className="flex items-center justify-center gap-3"><Play size={24} fill="currentColor" /> Initialize Interview</span>
                 )}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
