'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { mapGoalToCategoryAndInsert } from '@/lib/actions';
import { Send, CheckCircle2, Mountain } from 'lucide-react';

export default function Home() {
  const [word, setWord] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [submittedTags, setSubmittedTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = word.trim();
    if (!trimmedInput) return;

    setStatus('submitting');
    
    try {
      // Combined Server Action: AI Mapping + Database Insert (with name!)
      const result = await mapGoalToCategoryAndInsert(trimmedInput, name.trim() || 'Anonymous');
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit');
      }
      
      setSubmittedTags(result.tags || []);
      setStatus('success');
      setWord('');
      setName('');
    } catch (err: any) {
      // Log errors silently or handle via reporting service
      setStatus('error');
      setErrorMessage(err.message || 'Failed to submit. Please check your connection.');
    }
  };

  return (
    <main className="min-h-screen bg-brand-background flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Aesthetic Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-brand-secondary" />
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-brand-primary opacity-5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-brand-secondary opacity-10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <header className="text-center mb-10 space-y-2">
          <div className="flex justify-center mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              <Mountain className="w-12 h-12 text-brand-primary" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-black text-brand-primary tracking-tighter uppercase font-brand-heading">
            Peak 2026
          </h1>
          <p className="text-brand-text/70 font-medium">Build the mountain. Share your ambition.</p>
        </header>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/50 backdrop-blur-xl border-4 border-brand-primary p-12 text-center rounded-3xl shadow-2xl space-y-6"
            >
              <CheckCircle2 className="w-20 h-20 text-brand-secondary mx-auto" />
              <h2 className="text-3xl font-black text-brand-primary uppercase">Summit Reached!</h2>
              <div className="space-y-3">
                <p className="text-brand-text/60 text-sm font-bold uppercase tracking-wider">Your Tags:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {submittedTags.map((tag, index) => {
                    // Hardcoded color map for tags
                    const getTagColor = (text: string) => {
                      const tagColorMap: Record<string, string> = {
                        'INNOVATION': 'bg-violet-500 text-white',
                        'VELOCITY': 'bg-emerald-500 text-white',
                        'GROWTH': 'bg-orange-500 text-white',
                        'EXCELLENCE': 'bg-cyan-500 text-white',
                        'LEADERSHIP': 'bg-pink-500 text-white',
                        'WEALTH': 'bg-blue-500 text-white',
                        'PROSPERITY': 'bg-rose-500 text-white',
                        'SUCCESS': 'bg-amber-500 text-white',
                        'HEALTH': 'bg-teal-500 text-white',
                        'FITNESS': 'bg-indigo-500 text-white',
                        'LEARNING': 'bg-lime-500 text-white',
                        'CREATIVITY': 'bg-fuchsia-500 text-white',
                        'PRODUCTIVITY': 'bg-sky-500 text-white',
                        'BALANCE': 'bg-red-500 text-white',
                        'MINDFULNESS': 'bg-green-500 text-white',
                        'ADVENTURE': 'bg-purple-500 text-white',
                        'TRAVEL': 'bg-yellow-500 text-white',
                        'FAMILY': 'bg-red-400 text-white',
                        'CAREER': 'bg-blue-600 text-white',
                        'BUSINESS': 'bg-gray-700 text-white',
                        'IMPACT': 'bg-orange-600 text-white',
                        'SUSTAINABILITY': 'bg-green-600 text-white',
                        'TECHNOLOGY': 'bg-indigo-600 text-white',
                        'AI': 'bg-purple-600 text-white',
                        'COMMUNITY': 'bg-pink-600 text-white'
                      };
                      
                      // Return hardcoded color if exists
                      if (tagColorMap[text]) {
                        return tagColorMap[text];
                      }
                      
                      // Fallback for unmapped tags
                      const fallbackColors = [
                        'bg-violet-600 text-white',
                        'bg-fuchsia-600 text-white',
                        'bg-purple-600 text-white'
                      ];
                      let hash = 0;
                      for (let i = 0; i < text.length; i++) {
                        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
                      }
                      return fallbackColors[hash % fallbackColors.length];
                    };
                    
                    return (
                      <span 
                        key={index}
                        className={`px-4 py-1.5 ${getTagColor(tag)} font-bold text-sm rounded-md uppercase border-l-4 border-white/40`}
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
              <p className="text-brand-text/80 font-medium">Your goal is joining the peaks. Look at the big screen!</p>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full py-4 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-all uppercase tracking-widest"
              >
                Submit Another
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-primary/60 ml-1">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full px-6 py-4 bg-white border-b-4 border-brand-primary/10 focus:border-brand-primary outline-none transition-all rounded-xl text-lg font-bold text-brand-primary placeholder:text-brand-primary/20 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-primary/60 ml-1">Your Goal for 2026</label>
                    <textarea
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="What is your mountain to climb?"
                      className="w-full px-6 py-6 bg-white border-b-4 border-brand-primary/10 focus:border-brand-secondary outline-none transition-all rounded-2xl text-xl font-black text-brand-primary placeholder:text-brand-primary/20 shadow-inner min-h-[140px] resize-none"
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting' || !word.trim()}
                  className="w-full bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-brand-primary font-bold py-4 px-8 rounded-2xl shadow-lg shadow-brand-secondary/20 transition-all flex items-center justify-center gap-2 group text-xl uppercase tracking-widest"
                >
                  {status === 'submitting' ? (
                    'Sending...'
                  ) : (
                    <>
                      Submit to the Peak
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-brand-accent text-center font-bold text-sm"
                >
                  {errorMessage}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-12 text-center text-xs text-brand-text/40 font-medium tracking-widest uppercase">
          Everest Engineering &copy; 2026
        </footer>
      </motion.div>
    </main>
  );
}

