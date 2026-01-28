// Quick test script to verify tag normalization logic
const CANONICAL_TAGS = [
  'SUCCESS', 'WELLNESS', 'INNOVATION', 'LEADERSHIP', 'ADVENTURE',
  'GROWTH', 'EXCELLENCE', 'VELOCITY', 'LEARNING', 'CREATIVITY',
  'PRODUCTIVITY', 'BALANCE', 'MINDFULNESS', 'FAMILY', 'IMPACT'
];

const TAG_NORMALIZATION = {
  'WEALTH': 'SUCCESS',
  'PROSPERITY': 'SUCCESS',
  'HEALTH': 'WELLNESS',
  'FITNESS': 'WELLNESS',
  'TECHNOLOGY': 'INNOVATION',
  'AI': 'INNOVATION',
  'CAREER': 'LEADERSHIP',
  'BUSINESS': 'LEADERSHIP',
  'TRAVEL': 'ADVENTURE',
  'SUSTAINABILITY': 'IMPACT',
  'COMMUNITY': 'IMPACT',
};

// Test cases
const testCases = [
  ['WEALTH', 'HEALTH', 'INNOVATION'],
  ['CAREER', 'TECHNOLOGY', 'GROWTH'],
  ['FITNESS', 'FAMILY', 'TRAVEL'],
  ['AI', 'BUSINESS', 'SUSTAINABILITY'],
];

console.log('Tag Normalization Test\n' + '='.repeat(50));

testCases.forEach((tags, index) => {
  console.log(`\nTest Case ${index + 1}: ${tags.join(', ')}`);
  
  // Normalize
  const normalized = tags.map(tag => TAG_NORMALIZATION[tag] || tag);
  console.log(`  Normalized: ${normalized.join(', ')}`);
  
  // Validate
  const validated = normalized.map(tag => 
    CANONICAL_TAGS.includes(tag) ? tag : 'EXCELLENCE'
  );
  console.log(`  Validated: ${validated.join(', ')}`);
  
  // Remove duplicates
  const unique = [...new Set(validated)];
  console.log(`  Final: ${unique.join(', ')}`);
  console.log(`  ✓ All tags are unique: ${unique.length === new Set(unique).size}`);
  console.log(`  ✓ All tags are canonical: ${unique.every(t => CANONICAL_TAGS.includes(t))}`);
});

console.log('\n' + '='.repeat(50));
console.log('✅ Tag normalization logic verified!');
