import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Loader, RadioTower, Activity } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import AIPanel from '../components/AIPanel';
import { motion } from 'framer-motion';

export default function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { status, messages, sendMessage } = useWebSocket(id);
  const [currentQuestion, setCurrentQuestion] = useState("Initializing interview session...");
  const [aiThinking, setAiThinking] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [voiceCode, setVoiceCode] = useState(null);
  const audioRef = useRef(new Audio());
  const transcriptEndRef = useRef(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Track transcript history
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Read "max questions" chosen on the Landing page for this interview.
    try {
      const v = localStorage.getItem(`aiInterview:maxQuestions:${id}`);
      setMaxQuestions(v ? Number(v) : null);

      const vc = localStorage.getItem(`aiInterview:voice:${id}`);
      setVoiceCode(vc || null);
    } catch (e) {
      setMaxQuestions(null);
      setVoiceCode(null);
    }
    setQuestionsAsked(0);
    setLastFeedback(null);
    setHistory([]);
  }, [id]);

  useEffect(() => {
    try {
      if (!window.speechSynthesis) return;

      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
        setAvailableVoices(Array.isArray(list) ? list : []);
      };

      loadVoices();
      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      };
    } catch (e) {
      // non-fatal
    }
  }, []);

  const selectVoiceForCode = (voices, code) => {
    const c = (code || "").toLowerCase();
    const pickByName = (substrings) => {
      const byName = voices.filter((v) => {
        const n = (v.name || "").toLowerCase();
        return substrings.some((s) => n.includes(s));
      });
      return byName[0] || null;
    };

    if (c.includes("guy")) return pickByName(["microsoft david", "david", "microsoft mark", "mark"]) || null;
    if (c.includes("aria")) return pickByName(["microsoft zira", "zira", "microsoft susan", "susan", "heera"]) || null;
    if (c.includes("natasha")) return pickByName(["microsoft heera", "heera", "google australian english", "australian"]) || null;
    if (c.includes("sonia")) return pickByName(["microsoft susan", "susan", "google uk english female", "uk english female"]) || null;

    return voices[0] || null;
  };

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  // Audio Playback Listener
  useEffect(() => {
    const handlePlay = () => setIsPlaying(true);
    const handleEnded = () => setIsPlaying(false);
    
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      audioRef.current.removeEventListener('play', handlePlay);
      audioRef.current.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const latest = messages[messages.length - 1];
    
    switch (latest.type) {
      case 'GREETING':
      case 'NEXT_QUESTION':
        setAiThinking(false);
        setCurrentQuestion(latest.text);
        setQuestionsAsked((prev) => prev + 1);
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.text === latest.text) return prev;
          return [...prev, { role: 'ai', text: latest.text }];
        });
        if (latest.audioBase64) {
          playAudioFromBase64(latest.audioBase64);
        } else {
          speakText(latest.text, voiceCode);
        }
        break;
        
      case 'TRANSCRIPT_FINAL':
        setLastFeedback(null);
        setHistory(prev => [...prev, { role: 'user', text: latest.text }]);
        break;
        
      case 'THINKING':
        setAiThinking(true);
        setIsPlaying(false);
        break;

      case 'FEEDBACK':
        setAiThinking(false);
        setLastFeedback({
          score: latest.score,
          feedback: latest.feedback,
        });
        break;
        
      case 'INTERVIEW_COMPLETE':
        setAiThinking(false);
        setInterviewComplete(true);
        setLastFeedback(null);
        setHistory((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.text === latest.text) return prev;
          return [...prev, { role: 'ai', text: latest.text }];
        });
        if (latest.audioBase64) {
          playAudioFromBase64(latest.audioBase64);
        } else {
          speakText(latest.text, voiceCode);
        }
        setTimeout(() => {
            navigate(`/results/${id}`);
        }, 6000); 
        break;
        
      case 'ERROR':
        setAiThinking(false);
        alert(`Error: ${latest.message}`);
        break;
        
      default:
        break;
    }
  }, [messages, navigate, id, voiceCode]);

  useEffect(() => {
    if (status === 'connected') {
      setTimeout(() => {
        sendMessage({ type: "START_INTERVIEW" });
      }, 300);
    }
  }, [status, sendMessage]);

  useEffect(() => {
    if (!transcriptEndRef.current) return;
    transcriptEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  const playAudioFromBase64 = (b64) => {
    if (!b64) return;
    const audioSrc = `data:audio/mp3;base64,${b64}`;
    audioRef.current.src = audioSrc;
    audioRef.current.play().catch(e => console.log("Audio playback failed automatically:", e));
  };

  function speakText(text, voiceCodeToUse) {
    try {
      if (!text || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      const voices = availableVoices?.length
        ? availableVoices
        : (window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : []);

      const selectedVoice = selectVoiceForCode(voices, voiceCodeToUse);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log("Browser TTS failed:", e);
    }
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      const finalChunks = await stopRecording();
      if (finalChunks && finalChunks.length) {
        finalChunks.forEach((c) => sendMessage(c));
      }
      sendMessage({ type: "AUDIO_END" });
    } else {
      audioRef.current.pause(); 
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      startRecording();
    }
  };

  const isDisconnected = status !== "connected";

  return (
    <div className="bg-black min-h-screen flex flex-col md:flex-row overflow-hidden text-white relative">
      
      {/* Visual background gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4f46e5]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen"></div>
      
      {/* Left side: AI Avatar Canvas */}
      <div className="w-full md:w-[45%] lg:w-[50%] relative h-[40vh] md:h-screen border-b md:border-b-0 md:border-r border-white/10 flex flex-col items-center justify-center bg-black/50 z-10">
        
        {/* Status Indicator */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
           <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border backdrop-blur-md transition-colors ${
              isDisconnected ? "text-error border-error/20 bg-error/10" : 
              isRecording ? "text-warning border-warning/20 bg-warning/10" : 
              "text-success border-success/20 bg-success/10"
            }`}>
              <div className={`w-2 h-2 rounded-full ${isDisconnected ? "bg-error" : isRecording ? "bg-warning animate-pulse" : "bg-success"}`} />
              {isDisconnected ? "Connecting..." : isRecording ? "Receiving Input" : "Live Session"}
           </span>
        </div>

        {/* 3D Canvas */}
        <div className="absolute inset-0 z-0 opacity-90">
          <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} color={isDisconnected ? "#ef4444" : "#818cf8"} />
            <AIPanel isThinking={aiThinking} isSpeaking={isPlaying} isDisconnected={isDisconnected} />
            <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2 + 0.2} minPolarAngle={Math.PI / 2 - 0.2} />
          </Canvas>
        </div>

        {/* Dynamic state label overlay */}
        <div className="absolute bottom-10 z-20 flex flex-col items-center pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${
              aiThinking ? "bg-[#f59e0b]/20 border-[#f59e0b]/50 text-[#f59e0b]" :
              isPlaying ? "bg-[#818cf8]/20 border-[#818cf8]/50 text-[#818cf8]" :
              "bg-white/5 border-white/10 text-white"
            }`}
          >
            {aiThinking ? <Activity size={20} className="animate-pulse" /> : 
             isPlaying ? <RadioTower size={20} className="animate-pulse" /> : 
             <Mic size={20} className="opacity-50" />}
            <span className="font-bold tracking-wide">
              {aiThinking ? "Analyzing Response..." :
               isPlaying ? "Synthesizing Thought..." :
               "Listening"}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Right side: Interactivity and Transcript */}
      <div className="w-full md:w-[55%] lg:w-[50%] h-[60vh] md:h-screen flex flex-col z-10 relative">
        
        {/* Current Question */}
        <div className="px-8 py-10 pb-6 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent flex-shrink-0">
           <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">Interviewer</h3>
           <motion.h2 
             key={currentQuestion}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md"
           >
             "{currentQuestion}"
           </motion.h2>

           {/* Progress Tracker */}
           {typeof maxQuestions === "number" && maxQuestions > 0 && (
             <div className="mt-6 flex items-center gap-4">
               <div className="text-xs font-bold text-[#64748b]">Q. {Math.min(questionsAsked, maxQuestions)} OF {maxQuestions}</div>
               <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                 <div
                   className="h-full bg-gradient-to-r from-[#818cf8] to-[#e879f9] transition-all duration-500 ease-out"
                   style={{ width: `${Math.round((Math.min(questionsAsked, maxQuestions) / maxQuestions) * 100)}%` }}
                 />
               </div>
             </div>
           )}
        </div>

        {/* Feedback Section (if any) */}
        {lastFeedback && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-8 py-4 bg-[#818cf8]/10 border-b border-[#818cf8]/20 flex-shrink-0"
          >
             <div className="flex items-start gap-4">
               <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#818cf8]/20 border border-[#818cf8]/30 flex items-center justify-center text-xl font-black text-[#818cf8]">
                 {lastFeedback.score}
               </div>
               <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#818cf8] font-bold mb-1">Instant Feedback</div>
                  <p className="text-sm text-white/80 leading-relaxed font-medium">{lastFeedback.feedback}</p>
               </div>
             </div>
          </motion.div>
        )}

        {/* Transcript Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-black/20">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center px-10 border border-white/5 bg-white/[0.02] rounded-3xl">
               <p className="text-[#64748b] text-sm">Conversation transcript will appear here. Press the microphone button to start answering.</p>
            </div>
          ) : (
             <div className="flex flex-col gap-6">
                {history.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[10px] text-[#64748b] uppercase tracking-widest px-1 font-bold">
                      {msg.role === "user" ? "You" : "Interviewer"}
                    </span>
                    <div
                      className={`px-5 py-4 rounded-3xl max-w-[90%] text-[15px] leading-relaxed shadow-lg ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-[#818cf8]/30 to-[#4f46e5]/20 border border-[#818cf8]/40 text-white rounded-tr-sm"
                          : "bg-white/10 border border-white/10 backdrop-blur-md rounded-tl-sm text-white"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                <div ref={transcriptEndRef} className="h-2" />
             </div>
          )}
        </div>

        {/* Controls Section */}
        <div className="px-8 py-6 bg-black border-t border-white/10 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleRecording}
              disabled={isDisconnected || aiThinking || interviewComplete}
              className={`group flex items-center gap-4 px-10 py-5 rounded-full font-black text-lg transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] ${
                isRecording
                  ? "bg-gradient-to-r from-red-500 to-rose-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] text-white"
                  : "bg-gradient-to-r from-[#818cf8] to-[#c084fc] hover:shadow-[0_0_40px_rgba(129,140,248,0.4)] text-white"
              } disabled:opacity-50 disabled:scale-100 border border-white/20`}
            >
              {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
              <span className="relative">
                {isRecording ? "Stop & Submit Response" : "Tap to Speak"}
              </span>
            </motion.button>
        </div>
        
      </div>
    </div>
  );
}
