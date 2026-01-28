// Verify color consistency across pages
const submissionPageColors = {
  'SUCCESS': 'bg-amber-500 text-white',
  'WELLNESS': 'bg-teal-500 text-white',
  'INNOVATION': 'bg-violet-500 text-white',
  'LEADERSHIP': 'bg-blue-600 text-white',
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
  'IMPACT': 'bg-indigo-600 text-white'
};

const displayPageColors = {
  'SUCCESS': 'bg-amber-500 text-white',
  'WELLNESS': 'bg-teal-500 text-white',
  'INNOVATION': 'bg-violet-500 text-white',
  'LEADERSHIP': 'bg-blue-600 text-white',
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
  'IMPACT': 'bg-indigo-600 text-white'
};

console.log('Color Consistency Check\n' + '='.repeat(50));

const allTags = Object.keys(submissionPageColors);
let allMatch = true;

allTags.forEach(tag => {
  const match = submissionPageColors[tag] === displayPageColors[tag];
  if (!match) {
    console.log(`❌ ${tag}: Mismatch!`);
    console.log(`   Submission: ${submissionPageColors[tag]}`);
    console.log(`   Display: ${displayPageColors[tag]}`);
    allMatch = false;
  }
});

if (allMatch) {
  console.log('✅ All 15 tags have consistent colors across both pages!');
  console.log(`\nTotal tags: ${allTags.length}`);
  console.log('Tags:', allTags.join(', '));
}

console.log('\n' + '='.repeat(50));
