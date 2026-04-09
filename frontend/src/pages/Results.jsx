import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { getInterviewResults } from '../utils/api';
import { 
  Award, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  ChevronLeft, 
  Download, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
  Cpu,
  Trophy,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      try {
        const res = await getInterviewResults(id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [id]);

  const radarData = useMemo(() => {
    try {
      const lastQ = data?.questions?.find(q => q.competency_assessment && Object.keys(q.competency_assessment).length > 0) 
        || data?.questions?.[data?.questions?.length - 1];
      
      if (lastQ && lastQ.competency_assessment) {
        return Object.entries(lastQ.competency_assessment).map(([key, val]) => ({
          subject: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          score: val,
          fullMark: 10,
        }));
      }
    } catch (e) {
      console.error("Radar data processing error:", e);
    }
    return [];
  }, [data]);

  const insights = useMemo(() => {
    if (!radarData.length) return null;
    const sorted = [...radarData].sort((a, b) => b.score - a.score);
    return {
      strongest: sorted[0],
      growth: sorted[sorted.length - 1],
    };
  }, [radarData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#010208]">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-blue-500/20 rounded-full animate-ping absolute inset-0"></div>
        <div className="w-24 h-24 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
      </div>
      <p className="mt-8 text-blue-400 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">Analyzing Performance</p>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#010208] text-white">
      <GlassCard className="p-8 text-center max-w-md">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
        <h2 className="text-2xl font-bold mb-2">Results Not Found</h2>
        <p className="text-gray-400 mb-6">We couldn't retrieve the data for this session. It might have been deleted or the ID is incorrect.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white text-black rounded-lg font-bold">Return Home</button>
      </GlassCard>
    </div>
  );

  const overall = Number(data.overall_score || 0);
  const scorePercent = overall * 10;
  
  const getScoreColor = (score) => {
    if (score >= 8.5) return 'text-emerald-400';
    if (score >= 7.0) return 'text-blue-400';
    if (score >= 5.5) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 8.5) return 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20';
    if (score >= 7.0) return 'from-blue-500/20 to-blue-500/5 border-blue-500/20';
    if (score >= 5.5) return 'from-amber-500/20 to-amber-500/5 border-amber-500/20';
    return 'from-red-500/20 to-red-500/5 border-red-500/20';
  };

  return (
    <div className="min-h-screen bg-[#010208] text-white selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <button 
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-black uppercase tracking-widest">Return to Dashboard</span>
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500">
                  INTERVIEW REPORT
                </span>
              </h1>
              <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent hidden xl:block"></div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Candidate</span>
                <span className="text-white font-bold">{data.candidate_name}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Session ID</span>
                <span className="text-blue-400 font-mono text-xs">#{id.slice(0, 12)}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 uppercase text-[10px] font-black tracking-widest">Date</span>
                <span className="text-gray-300 font-bold">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 shrink-0"
          >
            <button className="h-14 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-bold text-sm">
              <Download size={18} /> Export
            </button>
            <button 
              onClick={() => navigate('/')}
              className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 font-black text-sm text-white uppercase tracking-widest"
            >
              <Zap size={18} /> New Session
            </button>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 mb-16">
          
          {/* Left Panel: Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            <div className={`h-full rounded-[2.5rem] p-10 border backdrop-blur-3xl relative overflow-hidden flex flex-col items-center justify-center text-center bg-gradient-to-b ${getScoreBg(overall)}`}>
              {/* Animated Glow */}
              <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
              
              <h3 className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-12 opacity-60">Performance Quotient</h3>
              
              <div className="relative w-56 h-56 flex items-center justify-center mb-10 group">
                {/* Score Pulse */}
                <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${getScoreColor(overall).replace('text-', 'bg-')}`}></div>
                
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90 relative z-10">
                  <circle
                    cx="112" cy="112" r="100"
                    stroke="currentColor" strokeWidth="14" fill="transparent"
                    className="text-white/5"
                  />
                  <motion.circle
                    cx="112" cy="112" r="100"
                    stroke="currentColor" strokeWidth="14" fill="transparent"
                    strokeDasharray={628.31}
                    initial={{ strokeDashoffset: 628.31 }}
                    animate={{ strokeDashoffset: 628.31 - (628.31 * scorePercent) / 100 }}
                    transition={{ duration: 1.8, ease: "circOut" }}
                    strokeLinecap="round"
                    className={getScoreColor(overall)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-7xl font-black tracking-tighter tabular-nums leading-none"
                  >
                    {overall.toFixed(1)}
                  </motion.span>
                  <span className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em] opacity-80">Final Score</span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className={`text-2xl font-black uppercase tracking-tight ${getScoreColor(overall)}`}>
                  {overall >= 8.5 ? "Exceptional" : overall >= 7.0 ? "Professional" : overall >= 5.5 ? "Developing" : "Needs Review"}
                </div>
                <p className="text-sm text-gray-400 font-medium px-2 leading-relaxed">
                  Consolidated analysis across technical proficiency, behavioral impact, and communication clarity.
                </p>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5 w-full flex items-center justify-center gap-16 relative z-10">
                 <div className="text-center">
                    <div className="text-3xl font-black text-white">{data.questions?.length || 0}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] mt-1">Queries</div>
                 </div>
                 <div className="h-10 w-px bg-white/10"></div>
                 <div className="text-center">
                    <div className="text-3xl font-black text-emerald-400">{data.questions?.filter(q => q.score >= 8).length || 0}</div>
                    <div className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] mt-1">Strengths</div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel: Radar & Stats */}
          <div className="lg:col-span-8 grid grid-rows-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2.5rem] p-10 bg-white/[0.03] border border-white/10 backdrop-blur-3xl grid md:grid-cols-2 gap-12"
            >
              {/* Radar Chart */}
              <div className="h-full min-h-[280px] relative flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Competency Map</h4>
                  <div className="bg-blue-500/10 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-blue-400 border border-blue-500/20 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></span> Skill DNA
                  </div>
                </div>
                {radarData.length > 0 ? (
                  <div className="flex-1 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 9, fontWeight: 800 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar name="Performance" dataKey="score" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.4} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#010208', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold' || '' }}
                          itemStyle={{ color: '#60a5fa' }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-600 text-xs font-black uppercase tracking-[0.2em] italic">Data Processing...</div>
                )}
              </div>

              {/* Insights */}
              <div className="flex flex-col justify-center space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Executive Summary</h4>
                {insights ? (
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-5 group hover:bg-emerald-500/10 transition-all">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <TrendingUp size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-2">Core Strength</div>
                        <div className="text-xl font-black text-white truncate">{insights.strongest.subject}</div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">Top performing area with consistent high-quality delivery.</p>
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-5 group hover:bg-amber-500/10 transition-all">
                      <div className="h-12 w-12 shrink-0 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                        <AlertCircle size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-2">Growth Vector</div>
                        <div className="text-xl font-black text-white truncate">{insights.growth.subject}</div>
                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">Focus on specific metrics and impact-driven narratives.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse"></div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
               {[
                 { label: 'Role Alignment', val: '92%', icon: <Cpu />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                 { label: 'Complexity', val: 'Advanced', icon: <BarChart3 />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                 { label: 'Session Outcome', val: 'Validated', icon: <Trophy />, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                 { label: 'Market Potential', val: 'Elite', icon: <Star />, color: 'text-amber-400', bg: 'bg-amber-400/10' },
               ].map((stat, i) => (
                 <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center text-center group hover:bg-white/[0.08] transition-all cursor-default">
                    <div className={`mb-4 w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{stat.label}</div>
                    <div className="text-2xl font-black text-white">{stat.val}</div>
                 </div>
               ))}
            </motion.div>
          </div>
        </div>

        {/* Detailed Feedback Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-10"
        >
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-xl font-black tracking-[0.3em] uppercase text-gray-400">Response Analytics</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          <div className="space-y-8">
            {data.questions && data.questions.map((q, i) => (
              <motion.div 
                key={q.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="group relative rounded-[3rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/20 transition-all overflow-hidden"
              >
                {/* Score Indicator Strip */}
                <div className={`absolute top-0 bottom-0 left-0 w-2 ${getScoreColor(q.score).replace('text-', 'bg-')}`}></div>
                
                <div className="p-10 md:p-12">
                  <div className="flex flex-col lg:flex-row gap-12">
                    {/* Q Number & Score Pillar */}
                    <div className="lg:w-32 flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-8 shrink-0 py-2">
                      <div className="w-16 h-16 rounded-3xl bg-black border border-white/10 flex items-center justify-center font-black text-2xl shadow-inner text-white/40">
                        {String(q.question_number).padStart(2, '0')}
                      </div>
                      <div className="text-center">
                        <div className={`text-5xl font-black tabular-nums leading-none ${getScoreColor(q.score)}`}>
                          {q.score}
                        </div>
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2 opacity-60">Session Pts</div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-10">
                      {/* Question Block */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <MessageSquare size={14} className="text-blue-500/50" />
                          <h4 className="text-gray-500 font-black uppercase tracking-[0.2em] text-[9px]">Interviewer Query</h4>
                        </div>
                        <p className="text-2xl font-bold leading-tight group-hover:text-white transition-colors">
                          {q.question_text}
                        </p>
                      </div>

                      {/* Answer Block */}
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                          <Zap size={14} className="text-amber-500/50" />
                          <h4 className="text-gray-500 font-black uppercase tracking-[0.2em] text-[9px]">Candidate Response</h4>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-black/40 border border-white/5 italic text-gray-400 text-[15px] leading-relaxed relative">
                          <span className="absolute top-4 left-4 text-3xl text-white/5 font-serif">“</span>
                          {q.candidate_answer}
                          <span className="absolute bottom-2 right-6 text-3xl text-white/5 font-serif">”</span>
                        </div>
                      </div>

                      {/* Evaluation Block */}
                      <div className="p-8 rounded-[2rem] bg-blue-500/5 border border-blue-500/10 flex flex-col md:flex-row gap-8">
                        <div className="shrink-0 flex items-center justify-center">
                           <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                              <CheckCircle2 size={24} />
                           </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">AI Strategic Evaluation</h4>
                          <p className="text-[15px] font-medium leading-[1.6] text-gray-200">
                            {q.feedback}
                          </p>
                        </div>
                      </div>

                      {/* Detailed Analytics Toggles */}
                      {(q.criteria_scores || q.competency_assessment) && (
                        <div className="pt-4 flex flex-col xl:flex-row gap-6">
                          {q.criteria_scores && (
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-4 px-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Scoring Matrix</span>
                               </div>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(q.criteria_scores).map(([k, v]) => (
                                  <div key={k} className="px-5 py-4 rounded-2xl bg-black/50 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest truncate mb-1">{k.replace(/_/g, " ")}</div>
                                    <div className="text-sm font-black text-white">{v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {q.competency_assessment && (
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-4 px-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> 
                                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Competency Metrics</span>
                               </div>
                               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(q.competency_assessment).map(([k, v]) => (
                                  <div key={k} className="px-5 py-4 rounded-2xl bg-black/50 border border-white/5 group-hover:border-white/10 transition-colors">
                                    <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest truncate mb-1">{k.replace(/_/g, " ")}</div>
                                    <div className="text-sm font-black text-white">{v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Evaluation Method Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Zap size={14} /> Intelligence Engine v2.4
          </div>
          <h2 className="text-3xl font-black mb-6 tracking-tight">How we calculate your score</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Our proprietary algorithm combines semantic analysis with industry standards (STAR method) to evaluate your responses across multiple dimensions.
          </p>
          
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-4xl font-black text-white/5">01</div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-blue-400">Semantic Fit</h4>
              <p className="text-gray-500 text-sm">Evaluating technical depth and terminology used.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-black text-white/5">02</div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-purple-400">Impact Analysis</h4>
              <p className="text-gray-500 text-sm">Quantifying results and outcomes in your examples.</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl font-black text-white/5">03</div>
              <h4 className="font-bold uppercase tracking-widest text-xs text-emerald-400">STAR Mapping</h4>
              <p className="text-gray-500 text-sm">Validating Situation, Task, Action, and Results structure.</p>
            </div>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-12 flex items-center justify-center gap-6">
           <button 
             onClick={() => navigate('/')}
             className="h-16 px-12 rounded-2xl bg-white text-black font-black hover:scale-105 transition-all shadow-xl shadow-white/10"
           >
             Start New Interview
           </button>
           <button className="h-16 px-8 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-all">
             Share Feedback
           </button>
        </div>

      </div>
    </div>
  );
}

// Reuseable helper components
function GlassCard({ children, className = "" }) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
