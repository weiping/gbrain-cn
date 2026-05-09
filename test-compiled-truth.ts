import { PGLiteEngine } from './src/core/pglite-engine.ts';

const engine = new PGLiteEngine();
await engine.connect({});

const page = await engine.getPage('inbox/知识库页面连接器');

if (!page) {
  console.log('Page not found');
  await engine.disconnect();
  process.exit(1);
}

console.log('=== Page Metadata ===');
console.log('Slug:', page.slug);
console.log('Type:', page.type);
console.log('\n=== compiled_truth ===');
console.log('Length:', page.compiled_truth?.length || 0);
console.log('Content preview (first 500 chars):');
console.log((page.compiled_truth || '').substring(0, 500));

// Count wikilinks
const wikiLinkRegex = /\[\[/g;
const wikiCount = (page.compiled_truth || '').match(wikiLinkRegex)?.length || 0;
console.log('\nWikilink count in compiled_truth:', wikiCount);

console.log('\n=== Full compiled_truth ===');
console.log(page.compiled_truth || '(empty)');

await engine.disconnect();
