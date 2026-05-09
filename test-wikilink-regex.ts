// Test wikilink regex against connector page content
const connectorContent = `---
type: inbox
title: 知识库页面连接器
tags:
  - connector
  - navigation
---

# 知识库页面连接器

本页面用于连接知识库中的孤立页面，提升实体链接覆盖率。

## 概念页面

- [[concepts/claude-code|Claude Code]]

## 技术图解索引

### Claude Code 系列图解

- [[illustrations/claude-code图解索引|Claude Code 图解索引]]

### Flash Moe 研究图解

- [[illustrations/flash-moe研究图解索引|Flash Moe 研究图解索引]]

## 每日报告索引

### 每日知识库维护报告

- [[inbox/每日知识库维护报告索引|每日维护报告索引]]

### 备选主题日报

- [[daily/备选主题日报索引|备选主题日报索引]]

### 每日报告总索引

- [[daily/每日报告总索引|每日报告总索引]]

## 相关导航页面

- [[inbox/知识库导航索引|知识库导航索引]]
- [[inbox/ai-agent研究合集|AI Agent研究合集]]
- [[illustrations/技术漫画索引|技术漫画索引]]
- [[inbox/知识库快速链接|知识库快速链接]]
- [[inbox/知识库分类导航|知识库分类导航]]
- [[inbox/智能体设计模式索引|智能体设计模式索引]]
`;

const DIR_PATTERN = '(?:people|companies|meetings|concepts|deal|civic|project|projects|source|media|yc|tech|finance|personal|openclaw|entities|inbox|daily|illustrations)';

const WIKILINK_RE = new RegExp(
  `\\[\\[(${DIR_PATTERN}\\/[^|\\]#]+?)(?:#[^|\\]]*?)?(?:\\|([^\\]]+?))?\\]\\]`,
  'g',
);

console.log('Testing wikilink regex against connector page content...\n');
console.log('Content length:', connectorContent.length);

let match;
const links = [];
while ((match = WIKILINK_RE.exec(connectorContent)) !== null) {
  links.push({
    fullMatch: match[0],
    slug: match[1],
    displayName: match[2] || null,
    index: match.index,
  });
}

console.log(`\nFound ${links.length} wikilinks:\n`);
for (const link of links) {
  console.log(`- ${link.fullMatch}`);
  console.log(`  slug: ${link.slug}`);
  console.log(`  display: ${link.displayName || '(none)'}`);
  console.log(`  index: ${link.index}`);
  console.log('');
}

// Also test extractEntityRefs
console.log('\n=== Testing extractEntityRefs ===');

function stripCodeBlocks(content: string): string {
  let out = '';
  let i = 0;
  while (i < content.length) {
    if (content.startsWith('```', i)) {
      const end = content.indexOf('```', i + 3);
      if (end === -1) { out += ' '.repeat(content.length - i); break; }
      out += ' '.repeat(end + 3 - i);
      i = end + 3;
      continue;
    }
    if (content[i] === '`') {
      const end = content.indexOf('`', i + 1);
      if (end === -1 || content.slice(i + 1, end).includes('\n')) {
        out += content[i];
        i++;
        continue;
      }
      out += ' '.repeat(end + 1 - i);
      i = end + 1;
      continue;
    }
    out += content[i];
    i++;
  }
  return out;
}

const stripped = stripCodeBlocks(connectorContent);
const wikiPattern = new RegExp(WIKILINK_RE.source, WIKILINK_RE.flags);
const extractedRefs = [];
while ((match = wikiPattern.exec(stripped)) !== null) {
  let slug = match[1].trim();
  if (!slug) continue;
  if (slug.includes('://')) continue;
  if (slug.endsWith('.md')) slug = slug.slice(0, -3);
  const displayName = (match[2] || slug).trim();
  const dir = slug.split('/')[0];
  extractedRefs.push({ name: displayName, slug, dir });
}

console.log(`extractEntityRefs found ${extractedRefs.length} refs:\n`);
for (const ref of extractedRefs) {
  console.log(`- ${ref.slug} (${ref.dir})`);
}
