'use server';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { supabaseAdmin } from './supabase';
import { headers } from 'next/headers';

// Consolidated tag list - 15 unique tags
const CANONICAL_TAGS = [
  'SUCCESS', 'WELLNESS', 'INNOVATION', 'LEADERSHIP', 'ADVENTURE',
  'GROWTH', 'EXCELLENCE', 'VELOCITY', 'LEARNING', 'CREATIVITY',
  'PRODUCTIVITY', 'BALANCE', 'MINDFULNESS', 'FAMILY', 'IMPACT'
];

export async function mapGoalToCategoryAndInsert(text: string, name?: string): Promise<{ success: boolean; error?: string; tags?: string[] }> {
  let mappedWords: string[] = [];

  // Check for Google AI Key (Primary) or OpenAI Key (Fallback)
  const hasGoogleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY && process.env.GOOGLE_GENERATIVE_AI_API_KEY !== 'your_google_key_here';
  const hasOpenAIKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here';

  if (!hasGoogleKey && !hasOpenAIKey) {
    console.log('⚠️ No AI API keys found, falling back to basic extraction');
    // Basic fallback: take 1st 2 non-stop words
    const stopWords = ['a', 'an', 'the', 'is', 'and', 'to', 'for', 'with', 'my', 'our', 'to', 'be', 'better', 'fulfil', 'my', 'goals'];
    mappedWords = text
      .split(/\s+/)
      .map(w => w.replace(/[^\w]/g, '').toUpperCase())
      .filter(w => w.length > 2 && !stopWords.includes(w.toLowerCase()))
      .slice(0, 2);
    
    if (mappedWords.length === 0) mappedWords = ['EXCELLENCE'];
  } else {
    try {
      console.log(`🤖 Generating tags for: "${text}" using Gemini 3 Flash...`);
      const { text: aiOutput } = await generateText({
        model: google('gemini-2.0-flash'),
        system: `You are a corporate branding assistant for Everest Engineering. 
        Your task is to summarize a user's 2026 goal into 1-3 CONCISE, HIGH-IMPACT words.
        
        CRITICAL: Most user goals are written in informal language, with emojis, or using slang (e.g., "Make MONEHHHHH", "Travel more ✈️", "Learn stuff"). 
        Use your intelligence to understand the DEEP CONTEXT and map these to the MOST relevant categories from the approved list below.
        
        CRITICAL: You MUST ONLY use words from this approved list. DO NOT use any other words:
        SUCCESS, WELLNESS, INNOVATION, LEADERSHIP, ADVENTURE, GROWTH, EXCELLENCE, 
        VELOCITY, LEARNING, CREATIVITY, PRODUCTIVITY, BALANCE, MINDFULNESS, FAMILY, IMPACT
        
        IMPORTANT: Most goals have MULTIPLE dimensions. Try to return 2-3 tags when the goal mentions multiple themes.
        Only return 1 tag if the goal is very focused on a single theme.
        
        Tag Meanings:
        - SUCCESS: Financial goals, wealth, achievement, prosperity
        - WELLNESS: Health, fitness, physical/mental wellbeing
        - INNOVATION: Technology, AI, digital transformation, new ideas
        - LEADERSHIP: Career advancement, business, management, influence
        - ADVENTURE: Travel, exploration, new experiences, courage
        - GROWTH: Personal/professional development, scaling, expansion
        - EXCELLENCE: Quality, mastery, craftsmanship, high standards
        - VELOCITY: Speed, efficiency, fast execution, agility
        - LEARNING: Education, knowledge, skill development, curiosity
        - CREATIVITY: Art, design, creative expression, innovation
        - PRODUCTIVITY: Output, efficiency, getting things done, collaboration
        - BALANCE: Work-life harmony, stability, resilience
        - MINDFULNESS: Mental health, awareness, authenticity, presence
        - FAMILY: Relationships, loved ones, family time
        - IMPACT: Social good, sustainability, community, environment
        
        Examples (1 tag - single focused goal):
        "Make a positive impact on climate change" -> IMPACT
        "Achieve financial freedom" -> SUCCESS
        "Master my craft and deliver excellence" -> EXCELLENCE
        "Balance work and personal life better" -> BALANCE
        
        Examples (2 tags - dual themes):
        "I want to build faster AI products" -> VELOCITY, INNOVATION
        "Get healthier and spend time with family" -> WELLNESS, FAMILY
        "Launch my startup and scale to 1M users" -> LEADERSHIP, GROWTH
        "Learn machine learning and get fit" -> LEARNING, WELLNESS
        "Build innovative solutions with my team" -> INNOVATION, PRODUCTIVITY
        
        Examples (3 tags - multi-faceted goals):
        "Grow my business, stay healthy, and spend time with loved ones" -> GROWTH, WELLNESS, FAMILY
        "Learn new skills, advance my career, and achieve work-life balance" -> LEARNING, LEADERSHIP, BALANCE
        "Build innovative products quickly while maintaining excellence" -> INNOVATION, VELOCITY, EXCELLENCE
        
        OUTPUT FORMAT:
        - Return ONLY the tags, separated by commas
        - NO explanations, NO extra text
        - Example output: "INNOVATION, VELOCITY"
        - Example output: "WELLNESS, FAMILY, BALANCE"
        
        Rules:
        1. Return 1-3 tags from the approved list
        2. Prefer 2-3 tags for goals with multiple themes
        3. Separate multiple tags with commas and spaces
        4. Choose the MOST relevant tags
        5. DO NOT invent new tags or use synonyms
        6. Return ONLY the tags, nothing else`,
        prompt: `User goal: "${text}"`,
      });

      console.log(`✅ AI Output: "${aiOutput.trim()}"`);

      mappedWords = aiOutput
        .split(',')
        .map(w => w.trim().toUpperCase())
        .filter(w => w.length > 0)
        .slice(0, 3);
      
      if (mappedWords.length === 0) {
        console.warn('⚠️ AI returned no tags, falling back to EXCELLENCE');
        mappedWords = ['EXCELLENCE'];
      }
    } catch (error) {
      console.error('❌ AI Mapping Error:', error);
      mappedWords = ['EXCELLENCE'];
    }
  }
  
  // Filter out any words not in the canonical list
  mappedWords = mappedWords.filter(word => CANONICAL_TAGS.includes(word));
  
  // Final fallback if no valid tags found
  if (mappedWords.length === 0) mappedWords = ['EXCELLENCE'];
  
  // Remove duplicates
  mappedWords = [...new Set(mappedWords)];

  // Generate a unique submission ID for grouping tags
  const submissionId = crypto.randomUUID();

  // Capture IP address from request headers
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                    headersList.get('x-real-ip') || 
                    'unknown';

  // Insert into Supabase from the server side using Admin Client (Secret Key)
  const { error } = await supabaseAdmin
    .from('submissions')
    .insert(mappedWords.map(w => ({ 
      submission_id: submissionId,
      word: w,
      name: name || 'Anonymous',
      original_text: text,
      ip_address: ipAddress
    })));




  if (error) {
    console.error('Supabase Insert Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, tags: mappedWords };
}

