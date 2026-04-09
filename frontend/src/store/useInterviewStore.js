import { create } from 'zustand';

export const useInterviewStore = create((set) => ({
  session: null,
  currentQuestion: "Initializing interview session...",
  history: [],
  status: 'idle', // 'idle' | 'connecting' | 'connected' | 'error'
  aiThinking: false,
  isSpeaking: false,

  setSession: (session) => set({ session }),
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  setAiThinking: (thinking) => set({ aiThinking: thinking }),
  setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
  setStatus: (status) => set({ status }),
  
  addHistory: (message) => set((state) => ({ 
    history: [...state.history, message] 
  })),
  
  resetSession: () => set({
    session: null,
    currentQuestion: "Initializing interview session...",
    history: [],
    status: 'idle',
    aiThinking: false,
    isSpeaking: false
  }),
}));
