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

// Tag normalization map - maps similar concepts to canonical tags
const TAG_NORMALIZATION: Record<string, string> = {
  // Financial/Achievement
  'WEALTH': 'SUCCESS',
  'PROSPERITY': 'SUCCESS',
  'MONEY': 'SUCCESS',
  'FINANCIAL': 'SUCCESS',
  'ACHIEVEMENT': 'SUCCESS',
  
  // Wellness
  'HEALTH': 'WELLNESS',
  'FITNESS': 'WELLNESS',
  'WELLBEING': 'WELLNESS',
  
  // Technology/Innovation
  'TECHNOLOGY': 'INNOVATION',
  'AI': 'INNOVATION',
  'TECH': 'INNOVATION',
  'DIGITAL': 'INNOVATION',
  
  // Professional
  'CAREER': 'LEADERSHIP',
  'BUSINESS': 'LEADERSHIP',
  'PROFESSIONAL': 'LEADERSHIP',
  'MANAGEMENT': 'LEADERSHIP',
  
  // Exploration
  'TRAVEL': 'ADVENTURE',
  'EXPLORATION': 'ADVENTURE',
  
  // Social Impact
  'SUSTAINABILITY': 'IMPACT',
  'COMMUNITY': 'IMPACT',
  'SOCIAL': 'IMPACT',
  'ENVIRONMENT': 'IMPACT',
};

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
        model: google('gemini-3-flash'),
        system: `You are a corporate branding assistant for Everest Engineering. 
        Your task is to summarize a user's 2026 goal into 1-3 CONCISE, HIGH-IMPACT words.
        
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
  
  // Normalize tags to canonical versions
  mappedWords = mappedWords.map(word => TAG_NORMALIZATION[word] || word);
  
  // Ensure all tags are in the canonical list, fallback to EXCELLENCE if not
  mappedWords = mappedWords.map(word => 
    CANONICAL_TAGS.includes(word) ? word : 'EXCELLENCE'
  );
  
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

