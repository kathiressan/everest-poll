'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain } from 'lucide-react';
import WordCloud from '@/components/WordCloud';

export default function DisplayPage() {
  const [submissions, setSubmissions] = useState<{ word: string; count: number }[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [showTopTags, setShowTopTags] = useState(false);
  const [uniqueParticipantCount, setUniqueParticipantCount] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  
  // Message queue for throttling feed updates
  const messageQueue = useRef<any[]>([]);
  const isProcessingQueue = useRef(false);
  
  // Buffer only for word cloud (to prevent flicker)
  const submissionsBuffer = useRef<{ [key: string]: number }>({});
  const hasNewData = useRef(false);

  // Process message queue with delay for readability
  const processMessageQueue = useCallback(async () => {
    if (isProcessingQueue.current) return;
    
    isProcessingQueue.current = true;
    
    while (messageQueue.current.length > 0) {
      const message = messageQueue.current.shift();
      if (message) {
        setFeed((prev) => [...prev, message]);
        
        // Wait 600ms before showing next message for readability
        if (messageQueue.current.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
    }
    
    isProcessingQueue.current = false;
  }, []);

  useEffect(() => {
    // Initial fetch with immediate display
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        const reversed = data.reverse(); // Oldest first
        
        // Calculate word cloud counts
        const counts = reversed.reduce((acc: any, curr: any) => {
          acc[curr.word] = (acc[curr.word] || 0) + 1;
          return acc;
        }, {});
        
        setSubmissions(Object.entries(counts).map(([word, count]) => ({ word, count: count as number })));
        submissionsBuffer.current = counts;
        
        // Calculate unique participant count (case insensitive names)
        const uniqueNames = new Set(
          reversed
            .map((s: any) => s.name?.toLowerCase())
            .filter((name: string | undefined) => name && name !== 'anonymous')
        );
        setUniqueParticipantCount(uniqueNames.size);
        
        // Show all existing messages immediately (no throttling on page load)
        setFeed(reversed);
      }
    };

    fetchInitialData();

    // Flush word cloud buffer every 2 seconds
    const flushInterval = setInterval(() => {
      if (!hasNewData.current) {
        return;
      }

      setSubmissions(Object.entries(submissionsBuffer.current).map(([word, count]) => ({ word, count })));
      hasNewData.current = false;
    }, 2000);

    // Subscribe to new submissions
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'submissions' 
        }, 
        (payload: any) => {
          const { word, ip_address } = payload.new;
          if (!word) return;

          // Add to message queue instead of updating feed immediately
          messageQueue.current.push(payload.new);
          processMessageQueue();

          // Buffer word cloud updates
          submissionsBuffer.current[word] = (submissionsBuffer.current[word] || 0) + 1;
          hasNewData.current = true;
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(flushInterval);
    };
  }, []); // Initial setup only

  // Update unique participant count whenever feed or queue changes
  useEffect(() => {
    const allKnownSubmissions = [...feed, ...messageQueue.current];
    const uniqueNames = new Set(
      allKnownSubmissions
        .map(s => s.name?.toLowerCase())
        .filter((name: string | undefined) => name && name !== 'anonymous')
    );
    if (uniqueNames.size > 0) {
      setUniqueParticipantCount(uniqueNames.size);
    }
  }, [feed]); // Recalculate when feed updates

  // Smooth auto-scroll feed to show new messages gradually
  useEffect(() => {
    if (feedRef.current && feed.length > 0) {
      // Use smooth scroll behavior
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [feed]);


  return (
    <main className="min-h-screen bg-brand-background overflow-hidden relative flex flex-col">
      {/* Background Silhouette - Flat Design Mountain Range */}
      <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
        <svg viewBox="0 0 1400 600" className="w-full h-[60vh] md:h-[75vh] lg:h-[85vh]" preserveAspectRatio="none">
          {/* Back Layer - Lightest */}
          <path
            d="M 0,600 L 0,450 L 100,400 L 200,300 L 250,280 L 300,300 L 400,400 L 500,350 L 600,250 L 650,230 L 700,250 L 800,350 L 900,300 L 1000,200 L 1050,180 L 1100,200 L 1200,300 L 1300,400 L 1400,450 L 1400,600 Z"
            fill="#13454c"
            opacity="0.03"
          />
          
          {/* Middle Layer */}
          <path
            d="M 0,600 L 0,480 L 80,430 L 180,350 L 250,310 L 320,350 L 400,430 L 480,380 L 580,280 L 650,240 L 720,280 L 800,380 L 880,330 L 980,230 L 1050,190 L 1120,230 L 1220,330 L 1300,400 L 1400,480 L 1400,600 Z"
            fill="#13454c"
            opacity="0.05"
          />
          
          {/* Front Layer - Darkest, with prominent center peak */}
          <path
            d="M 0,600 L 0,520 L 100,470 L 200,400 L 300,350 L 400,320 L 500,280 L 600,220 L 650,180 L 700,140 L 750,180 L 800,220 L 900,280 L 1000,320 L 1100,350 L 1200,400 L 1300,470 L 1400,520 L 1400,600 Z"
            fill="#13454c"
            opacity="0.08"
          />
        </svg>
      </div>

      <div className="z-10 w-full h-full flex flex-col">
        {/* Header - Top Left Corner */}
        <header className="absolute top-4 left-4 md:top-6 md:left-6 lg:top-8 lg:left-8 z-20 space-y-1">
          <img 
            src="/everest-logo.svg" 
            alt="Everest Engineering" 
            className="h-10 md:h-12 lg:h-16 w-auto"
          />
          <p className="text-brand-text/60 font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase text-[8px] md:text-[10px]">
            Live Stream of Collective Ambition
          </p>
        </header>

        {/* QR Code & URL - Desktop Only */}
        <div className="hidden lg:flex absolute top-4 left-1/2 -translate-x-1/2 z-20 items-center gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border-2 border-brand-primary/20">
          <img 
            src="/url-qr.png" 
            alt="QR Code to Join" 
            className="w-24 h-24 rounded-lg"
          />
          <div className="flex flex-col gap-1">
            <p className="text-brand-primary/60 font-bold text-xs uppercase tracking-wider">Scan to Join</p>
            <p className="text-brand-primary font-black text-xl">everest-poll.vercel.app</p>
          </div>
        </div>

        {/* Top Tags Button */}
        <button
          onClick={() => setShowTopTags(!showTopTags)}
          className="absolute top-4 right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 z-30 px-4 md:px-6 py-2 md:py-3 bg-brand-secondary text-brand-primary font-black text-xs md:text-sm uppercase rounded-full border-2 border-brand-primary hover:scale-105 transition-transform shadow-lg"
        >
          {showTopTags ? 'Hide' : 'Top 5 Tags'}
        </button>

        {/* Top Tags Display */}
        <AnimatePresence>
          {showTopTags && (() => {
            const topTags = [...submissions]
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-20 md:top-24 lg:top-28 right-4 md:right-6 lg:right-8 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl border-2 border-brand-primary"
              >
                <h3 className="text-brand-primary font-black text-sm md:text-base uppercase mb-3 md:mb-4">Top 5 Tags</h3>
                <div className="space-y-2 md:space-y-3">
                  {topTags.map((tag, index) => (
                    <div key={tag.word} className="flex items-center gap-3 md:gap-4">
                      <span className="text-2xl md:text-3xl font-black text-brand-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-black text-brand-text text-sm md:text-base uppercase">
                          {tag.word}
                        </div>
                        <div className="text-xs md:text-sm text-brand-text/60">
                          {tag.count} {tag.count === 1 ? 'submission' : 'submissions'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Main Content Area - Word Cloud takes all space above feed */}
        <div className="w-full pt-12 md:pt-16 lg:pt-20 h-[calc(100vh-12rem)] md:h-[calc(100vh-13rem)] lg:h-[calc(100vh-14rem)]">
          <div className="h-full relative w-full">
            <WordCloud words={submissions} />
          </div>
        </div>

        {/* Live Feed Container - Absolute positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          <div className="h-48 md:h-56 lg:h-64 relative group">
            <div className="absolute inset-0 bg-brand-primary/5 backdrop-blur-sm rounded-3xl border-2 border-brand-primary/10" />
            <div 
              ref={feedRef}
              className="absolute inset-0 p-3 md:p-4 lg:p-6 overflow-y-auto scrollbar-hide flex flex-col gap-2 md:gap-2.5 lg:gap-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollBehavior: 'smooth' }}
            >
              {(() => {
                // Group submissions by submission_id
                type GroupedItem = { id: string; name: string; original_text: string; created_at: string; tags: string[] };
                const grouped = feed.reduce((acc, sub) => {
                  const key = sub.submission_id || sub.id; // Fallback to id for old data
                  if (!acc[key]) {
                    acc[key] = {
                      id: sub.id,
                      name: sub.name,
                      original_text: sub.original_text,
                      created_at: sub.created_at,
                      tags: []
                    };
                  }
                  acc[key].tags.push(sub.word);
                  return acc;
                }, {} as Record<string, GroupedItem>);

                return (Object.values(grouped) as GroupedItem[]).map((item: GroupedItem) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 bg-white/40 p-2 md:p-2.5 lg:p-3 rounded-lg md:rounded-xl border border-white/50 shadow-sm shrink-0"
                  >
                    <div className="flex items-start gap-2 md:gap-2.5 lg:gap-3">
                      <span className="font-black text-brand-primary whitespace-nowrap bg-brand-secondary/20 px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm uppercase">
                        {item.name || 'Anonymous'}
                      </span>
                      <span className="text-brand-text/80 font-medium text-xs md:text-sm lg:text-base">
                        {item.original_text}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 md:gap-2 pl-0">
                      {item.tags.map((tag: string, idx: number) => {
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
                            key={idx}
                            className={`px-2 md:px-3 py-0.5 md:py-1 ${getTagColor(tag)} font-bold text-[9px] md:text-[10px] rounded uppercase border-l-2 md:border-l-3 border-white/40`}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            
            {/* Feed Overlay Labels */}
            <div className="absolute top-2 right-3 md:top-3 md:right-4 lg:top-4 lg:right-6 pointer-events-none">
              <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-2.5 lg:px-3 py-0.5 md:py-1 bg-brand-primary text-white text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-wider md:tracking-widest rounded-full">
                <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live Feed
              </div>
            </div>
          </div>

          <footer className="mt-2 md:mt-3 lg:mt-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-12 font-bold text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em]">
            <div>{uniqueParticipantCount} {uniqueParticipantCount === 1 ? 'Participant' : 'Participants'}</div>
          </footer>
        </div>
      </div>
    </main>
  );
}

