// Test if Chinese slugs match exactly between what we extract and what's in the database

// The connector page wikilinks (extracted by our earlier test)
const connectorLinks = [
  'concepts/claude-code',
  'illustrations/claude-code图解索引',
  'illustrations/flash-moe研究图解索引',
  'inbox/每日知识库维护报告索引',
  'daily/备选主题日报索引',
  'daily/每日报告总索引',
  'inbox/知识库导航索引',
  'inbox/ai-agent研究合集',
  'illustrations/技术漫画索引',
  'inbox/知识库快速链接',
  'inbox/知识库分类导航',
  'inbox/智能体设计模式索引'
];

// Simulated allSlugs set (from the list output with slug= prefix)
const allSlugs = new Set([
  'inbox/知识库页面连接器',
  'inbox/智能体设计模式索引',
  'concepts/claude-code',
  'inbox/知识库分类导航',
  'inbox/每日知识库维护报告索引',
  'illustrations/flash-moe研究图解索引',
  'illustrations/claude-code图解索引',
  'daily/备选主题日报索引',
  'inbox/知识库快速链接',
  'daily/每日报告总索引',
  'inbox/ai-agent研究合集',
  'illustrations/技术漫画索引',
  'inbox/知识库导航索引',
  'inbox/知识库页面连接器', // duplicate?
]);

const fromSlug = 'inbox/知识库页面连接器';

console.log('Checking which target slugs exist in allSlugs:\n');
for (const targetSlug of connectorLinks) {
  const exists = allSlugs.has(targetSlug);
  const fromExists = allSlugs.has(fromSlug);
  console.log(`${targetSlug}: ${exists ? 'EXISTS' : 'MISSING'}`);
}

console.log(`\nfromSlug "${fromSlug}" exists: ${allSlugs.has(fromSlug)}`);

// Check for character-by-character comparison
console.log('\n=== Character-by-character comparison ===');
const testSlug = 'daily/每日报告总索引';
const dbSlug = 'daily/每日报告总索引';
console.log('Test slug:', testSlug);
console.log('DB slug:', dbSlug);
console.log('Match:', testSlug === dbSlug);
console.log('Bytes:', Buffer.from(testSlug).toString('hex'));
console.log('Bytes:', Buffer.from(dbSlug).toString('hex'));
