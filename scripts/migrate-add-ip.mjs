import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  console.log('🔄 Adding ip_address column...\n');

  try {
    // Check if column exists by trying to fetch
    console.log('1️⃣ Checking current schema...');
    const { data, error } = await supabase
      .from('submissions')
      .select('ip_address')
      .limit(1);

    if (error && error.message.includes('column')) {
      console.log('   Column does not exist yet.');
      console.log('\n⚠️  Please run this SQL in Supabase SQL Editor:');
      console.log('   ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS ip_address text;');
      console.log('   CREATE INDEX IF NOT EXISTS idx_submissions_ip ON public.submissions(ip_address);\n');
      process.exit(1);
    }

    console.log('✅ ip_address column already exists!');
    console.log('\n🎯 You can now proceed with updating the code!');

  } catch (error) {
    console.error('❌ Migration check failed:', error);
    process.exit(1);
  }
}

migrate();
