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
  console.log('🔄 Backfilling submission_id for existing rows...\n');

  try {
    // Get all existing submissions
    console.log('1️⃣ Fetching existing submissions...');
    const { data: submissions, error: fetchError } = await supabase
      .from('submissions')
      .select('id, submission_id')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching submissions:', fetchError);
      console.error('\n⚠️  The submission_id column may not exist yet.');
      console.error('   Please run this SQL in Supabase SQL Editor first:');
      console.error('   ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS submission_id uuid;\n');
      process.exit(1);
    }

    console.log(`   Found ${submissions.length} submissions`);

    // Update rows that don't have submission_id
    const needsUpdate = submissions.filter(s => !s.submission_id);
    console.log(`2️⃣ Updating ${needsUpdate.length} rows without submission_id...`);

    let updated = 0;
    for (const submission of needsUpdate) {
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ submission_id: submission.id })
        .eq('id', submission.id);

      if (updateError) {
        console.error(`   ⚠️  Error updating ${submission.id}:`, updateError.message);
      } else {
        updated++;
        if (updated % 10 === 0) {
          process.stdout.write(`\r   Updated ${updated}/${needsUpdate.length}...`);
        }
      }
    }

    console.log(`\n\n✅ Migration complete!`);
    console.log(`   - ${updated} rows updated with submission_id`);
    console.log('\n🎯 You can now run the seed script to test multi-tag submissions!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
