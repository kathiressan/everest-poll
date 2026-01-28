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

const NAMES = [
  // India
  "Arjun Mehra", "Deepika Iyer", "Kabir Singh", "Ananya Kulkarni", "Vihaan Das",
  // Australia
  "Lachlan Smith", "Maddy Williams", "Cooper Jones", "Sienna Brown", "Harrison Taylor",
  // Malaysia
  "Zul Abdul", "Mei Ling", "Siti Aminah", "Ravi Subramaniam", "Ariff Hassan",
  // Mixed/International
  "Sarah Jenkins", "Alex Chen", "Sofia Costa", "Omar Khalil", "Elena Rossi"
];

// Consolidated 15 canonical tags only
const TARGET_WORDS = [
  "SUCCESS", "WELLNESS", "INNOVATION", "LEADERSHIP", "ADVENTURE",
  "GROWTH", "EXCELLENCE", "VELOCITY", "LEARNING", "CREATIVITY",
  "PRODUCTIVITY", "BALANCE", "MINDFULNESS", "FAMILY", "IMPACT"
];

const GOALS = [
  "Lead technical excellence in the APAC region.",
  "Launch cloud-native solutions for the Melbourne market.",
  "Build the next-gen AI hub in Bangalore.",
  "Drive sustainable product growth in Kuala Lumpur.",
  "Strengthen the connection between Sydney and the global tech scene.",
  "Modernize the banking sector in Mumbai with AI.",
  "Build a world-class DevOps team in Penang.",
  "Deploy real-time data solutions for Australian startups.",
  "Mentor the next generation of engineers in Hyderabad.",
  "Innovate on payment gateways for the Southeast Asian digital economy.",
  "Achieve 99.99% uptime for our global engineering platforms.",
  "Make Everest the #1 talent hub for React and Go developers.",
  "Integrate responsible AI into every Melbourne-born product.",
  "Host the biggest tech hackathon in Pune.",
  "Scale our microservices architecture to handle 100M requests per day.",
  "Champion diversity and inclusion across all our engineering teams.",
  "Build a culture of continuous learning and experimentation.",
  "Deliver exceptional customer experiences through elegant code.",
  "Pioneer new approaches to remote-first collaboration.",
  "Establish Everest as the go-to partner for digital transformation.",
  "Create a zero-downtime deployment pipeline for all services.",
  "Empower every engineer to own their career growth.",
  "Foster innovation through hackathons and innovation sprints.",
  "Build resilient systems that can handle any scale.",
  "Lead the industry in sustainable and ethical tech practices.",
  "Cultivate a culture of radical transparency and open communication.",
  "Accelerate time-to-market for all our product initiatives.",
  "Become the most trusted technology partner in the region.",
  "Drive excellence in code quality and engineering standards.",
  "Create meaningful impact through technology that matters.",
  "Build the future of work with cutting-edge collaboration tools.",
  "Establish world-class engineering practices across all teams.",
  "Deliver products that delight users and exceed expectations.",
  "Champion agile methodologies and lean startup principles.",
  "Create a workplace where everyone can do their best work.",
  "Push the boundaries of what's possible with modern technology.",
  "Build systems that are secure, scalable, and maintainable.",
  "Foster a growth mindset across the entire organization.",
  "Lead with empathy and build products that serve humanity.",
  "Create a legacy of technical excellence and innovation."
];

async function seed() {
  console.log('🏔️ Starting the Everest APAC Simulation...');
  console.log('💡 Simulating realistic concurrent submissions...\n');
  
  let submitted = 0;
  const startTime = Date.now();
  const totalSubmissions = 50;

  for (let i = 0; i < totalSubmissions; i++) {
    const name = NAMES[i % NAMES.length];
    const goal = GOALS[i % GOALS.length];
    
    // Pick 1-3 tags for this submission
    const wordCount = Math.floor(Math.random() * 3) + 1; // 1-3 tags
    const words = [];
    const usedIndices = new Set();
    
    // Ensure unique tags for this submission
    while (words.length < wordCount) {
      const idx = Math.floor(Math.random() * TARGET_WORDS.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        words.push(TARGET_WORDS[idx]);
      }
    }

    // Insert all tags for this submission at once (same timestamp and submission_id)
    const submissionId = crypto.randomUUID();
    
    // Generate a random IP address for this submission
    const ipAddress = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
    
    const submissions = words.map(word => ({
      submission_id: submissionId,
      word,
      name: `${name} ${Math.floor(i/NAMES.length) + 1}`,
      original_text: goal,
      ip_address: ipAddress
    }));

    const { error } = await supabase.from('submissions').insert(submissions);

    if (error) {
      console.error(`❌ Submission ${i + 1} failed:`, error.message);
    } else {
      submitted++;
      process.stdout.write(`\r✅ Progress: ${submitted}/${totalSubmissions} submissions sent...`);
    }

    // Random delay between submissions (50ms - 500ms) - faster for demo
    const delay = Math.floor(Math.random() * 450) + 50;
    await new Promise(r => setTimeout(r, delay));
  }

  console.log('\n\n🏔️ Simulation Complete! The mountain is at its peak.');
  console.log(`⏱️  Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
}

seed();
