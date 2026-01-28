import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load env vars
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey === 'your_secret_key_here') {
  console.error('❌ Error: Supabase credentials missing in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tag normalization map - same as in actions.ts
const TAG_NORMALIZATION = {
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
  'AI-FIRST': 'INNOVATION',
  'DISRUPTION': 'INNOVATION',
  
  // Professional
  'CAREER': 'LEADERSHIP',
  'BUSINESS': 'LEADERSHIP',
  'PROFESSIONAL': 'LEADERSHIP',
  'MANAGEMENT': 'LEADERSHIP',
  'OWNERSHIP': 'LEADERSHIP',
  'VISION': 'LEADERSHIP',
  'ACCOUNTABILITY': 'LEADERSHIP',
  
  // Exploration
  'TRAVEL': 'ADVENTURE',
  'EXPLORATION': 'ADVENTURE',
  'BOLDNESS': 'ADVENTURE',
  'COURAGE': 'ADVENTURE',
  
  // Social Impact
  'SUSTAINABILITY': 'IMPACT',
  'COMMUNITY': 'IMPACT',
  'SOCIAL': 'IMPACT',
  'ENVIRONMENT': 'IMPACT',
  'INCLUSIVITY': 'IMPACT',
  'DIVERSITY': 'IMPACT',
  'EMPOWERMENT': 'IMPACT',
  
  // Growth
  'SCALABILITY': 'GROWTH',
  'ACCELERATION': 'GROWTH',
  
  // Excellence
  'QUALITY': 'EXCELLENCE',
  'MASTERY': 'EXCELLENCE',
  'CRAFTSMANSHIP': 'EXCELLENCE',
  'PRECISION': 'EXCELLENCE',
  'INTEGRITY': 'EXCELLENCE',
  'TRUST': 'EXCELLENCE',
  
  // Velocity
  'AGILITY': 'VELOCITY',
  'EFFICIENCY': 'VELOCITY',
  'DELIVERY': 'VELOCITY',
  
  // Learning
  'CURIOSITY': 'LEARNING',
  
  // Creativity
  'PASSION': 'CREATIVITY',
  
  // Productivity
  'COLLABORATION': 'PRODUCTIVITY',
  'TEAMWORK': 'PRODUCTIVITY',
  'SYNERGY': 'PRODUCTIVITY',
  
  // Balance
  'STABILITY': 'BALANCE',
  'RESILIENCE': 'BALANCE',
  'RELIABILITY': 'BALANCE',
  'ADAPTABILITY': 'BALANCE',
  
  // Mindfulness
  'AUTHENTICITY': 'MINDFULNESS',
  'TRANSPARENCY': 'MINDFULNESS',
  'CULTURE': 'MINDFULNESS',
};

const CANONICAL_TAGS = [
  'SUCCESS', 'WELLNESS', 'INNOVATION', 'LEADERSHIP', 'ADVENTURE',
  'GROWTH', 'EXCELLENCE', 'VELOCITY', 'LEARNING', 'CREATIVITY',
  'PRODUCTIVITY', 'BALANCE', 'MINDFULNESS', 'FAMILY', 'IMPACT'
];

async function migrateOldTags() {
  console.log('🔄 Migrating old tags to consolidated tag system...\n');
  
  // Fetch all submissions
  const { data: submissions, error: fetchError } = await supabase
    .from('submissions')
    .select('*');
  
  if (fetchError) {
    console.error('❌ Error fetching submissions:', fetchError);
    process.exit(1);
  }
  
  console.log(`📊 Found ${submissions.length} total submissions`);
  
  // Group by old tag
  const tagCounts = {};
  submissions.forEach(sub => {
    tagCounts[sub.word] = (tagCounts[sub.word] || 0) + 1;
  });
  
  console.log('\n📋 Current tag distribution:');
  Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      const isCanonical = CANONICAL_TAGS.includes(tag);
      const willMap = TAG_NORMALIZATION[tag];
      const status = isCanonical ? '✅' : (willMap ? `🔄 → ${willMap}` : '❓ → EXCELLENCE');
      console.log(`  ${status} ${tag}: ${count}`);
    });
  
  // Update each submission
  let updated = 0;
  let unchanged = 0;
  
  for (const submission of submissions) {
    const oldTag = submission.word;
    let newTag = oldTag;
    
    // Normalize if needed
    if (TAG_NORMALIZATION[oldTag]) {
      newTag = TAG_NORMALIZATION[oldTag];
    } else if (!CANONICAL_TAGS.includes(oldTag)) {
      newTag = 'EXCELLENCE'; // Fallback for unmapped tags
    }
    
    if (newTag !== oldTag) {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ word: newTag })
        .eq('id', submission.id);
      
      if (updateError) {
        console.error(`❌ Error updating ${submission.id}:`, updateError);
      } else {
        updated++;
      }
    } else {
      unchanged++;
    }
  }
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   Updated: ${updated} submissions`);
  console.log(`   Unchanged: ${unchanged} submissions`);
  
  // Show new distribution
  const { data: newSubmissions } = await supabase
    .from('submissions')
    .select('word');
  
  const newTagCounts = {};
  newSubmissions.forEach(sub => {
    newTagCounts[sub.word] = (newTagCounts[sub.word] || 0) + 1;
  });
  
  console.log('\n📊 New tag distribution:');
  Object.entries(newTagCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tag, count]) => {
      console.log(`  ✅ ${tag}: ${count}`);
    });
}

migrateOldTags();
