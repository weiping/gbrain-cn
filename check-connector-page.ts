import { PGLiteEngine } from './src/core/pglite-engine.ts';
import { readFileSync } from 'fs';

const engine = new PGLiteEngine();
await engine.connect({});

const page = await engine.getPage('inbox/知识库页面连接器');

if (!page) {
  console.log('Page not found in database');
  await engine.disconnect();
  process.exit(1);
}

console.log('=== Database Page Content ===');
console.log('Slug:', page.slug);
console.log('Title:', page.title);
console.log('Content length:', page.content.length);
console.log('Content preview (first 500 chars):');
console.log(page.content.substring(0, 500));
console.log('\n=== Full Content ===');
console.log(page.content);

// Also read the file content
const filePath = '/Users/liuweiping/workspace/content/vault/inbox/知识库页面连接器.md';
const fileContent = readFileSync(filePath, 'utf-8');
console.log('\n=== File Content ===');
console.log('File content length:', fileContent.length);
console.log('File content preview (first 500 chars):');
console.log(fileContent.substring(0, 500));

// Count wikilinks in both
const wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const dbLinks = (page.content.match(wikiLinkRegex) || []).length;
const fileLinks = (fileContent.match(wikiLinkRegex) || []).length;

console.log('\n=== Wikilink Count ===');
console.log('Database content wikilinks:', dbLinks);
console.log('File content wikilinks:', fileLinks);

await engine.disconnect();
