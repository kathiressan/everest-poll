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
            <img 
              src="/everest-logo.svg" 
              alt="Everest Engineering" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
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
                      // Consolidated 15-tag color map - bright colors only
                      const tagColorMap: Record<string, string> = {
                        'SUCCESS': 'bg-amber-500 text-white',
                        'WELLNESS': 'bg-teal-500 text-white',
                        'INNOVATION': 'bg-violet-500 text-white',
                        'LEADERSHIP': 'bg-blue-500 text-white',
                        'ADVENTURE': 'bg-purple-500 text-white',
                        'GROWTH': 'bg-orange-500 text-white',
                        'EXCELLENCE': 'bg-cyan-500 text-white',
                        'VELOCITY': 'bg-emerald-500 text-white',
                        'LEARNING': 'bg-lime-500 text-white',
                        'CREATIVITY': 'bg-fuchsia-500 text-white',
                        'PRODUCTIVITY': 'bg-sky-500 text-white',
                        'BALANCE': 'bg-red-500 text-white',
                        'MINDFULNESS': 'bg-green-500 text-white',
                        'FAMILY': 'bg-rose-500 text-white',
                        'IMPACT': 'bg-indigo-500 text-white'
                      };
                      
                      // Return color if exists, otherwise use fallback
                      return tagColorMap[text] || 'bg-slate-600 text-white';
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

      </motion.div>
    </main>
  );
}

