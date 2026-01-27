'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { supabaseAdmin } from './supabase';

export async function mapGoalToCategoryAndInsert(text: string, name?: string): Promise<{ success: boolean; error?: string; tags?: string[] }> {
  let mappedWords: string[] = [];

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_key_here') {
    // Basic fallback: take 1st 2 non-stop words
    const stopWords = ['a', 'an', 'the', 'is', 'and', 'to', 'for', 'with', 'my', 'our'];
    mappedWords = text
      .split(/\s+/)
      .map(w => w.replace(/[^\w]/g, '').toUpperCase())
      .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()))
      .slice(0, 2);
    
    if (mappedWords.length === 0) mappedWords = ['EXCELLENCE'];
  } else {
    try {
      const { text: aiOutput } = await generateText({
        model: openai('gpt-4o-mini'),
        system: `You are a corporate branding assistant for Everest Engineering. 
        Your task is to summarize a user's 2026 goal into 1-3 CONCISE, HIGH-IMPACT words.
        Criteria:
        - Words must be punchy and professional.
        - Return ONLY the words, separated by commas.
        - Example: "I want to build faster AI" -> "VELOCITY, INNOVATION"
        - Max 3 words. Use single words, not phrases.`,
        prompt: `User goal: "${text}"`,
      });

      mappedWords = aiOutput
        .split(',')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length > 0)
        .slice(0, 3);
      
      if (mappedWords.length === 0) mappedWords = ['EXCELLENCE'];
    } catch (error) {
      console.error('AI Mapping Error:', error);
      mappedWords = ['EXCELLENCE'];
    }
  }

  // Insert into Supabase from the server side using Admin Client (Secret Key)
  const { error } = await supabaseAdmin
    .from('submissions')
    .insert(mappedWords.map(w => ({ 
      word: w,
      name: name || 'Anonymous',
      original_text: text
    })));




  if (error) {
    console.error('Supabase Insert Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, tags: mappedWords };
}

