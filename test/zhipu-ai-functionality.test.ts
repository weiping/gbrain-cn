#!/usr/bin/env bun
/**
 * Zhipu AI 功能测试脚本
 * 测试嵌入和扩展查询功能
 */

import { configureGateway, embed, embedOne, expand } from '../src/core/ai/gateway.ts';
import type { AIGatewayConfig } from '../src/core/ai/types.ts';

// 模拟配置（实际使用时从环境变量读取）
const config: AIGatewayConfig = {
  embedding_model: 'zhipu:embedding-3',
  embedding_dimensions: 2048,  // ✅ 实测返回 2048 维（2026-05-09）
  expansion_model: 'zhipu:glm-4.7',
  chat_model: 'zhipu:glm-4.7',
  env: {
    ZHIPU_API_KEY: process.env.ZHIPU_API_KEY || 'd8e72d7cc79c4f1f9ee1edc8bd33a341.zCXSMTBJoj2TDbSo',
  },
  base_urls: {
    zhipu: 'https://open.bigmodel.cn/api/paas/v4',
  },
};

async function testEmbedding() {
  console.log('\n🧪 测试 1: 向量嵌入功能');
  console.log('=' .repeat(60));

  const testTexts = [
    '人工智能是计算机科学的一个分支',
    '机器学习是人工智能的核心技术',
    '深度学习使用神经网络模拟人脑',
  ];

  try {
    console.log('📝 测试文本:', testTexts);
    console.log('⏳ 正在调用 Zhipu embedding-3 API...');

    const startTime = Date.now();
    const embeddings = await embed(testTexts);
    const duration = Date.now() - startTime;

    console.log(`✅ 嵌入成功！耗时: ${duration}ms`);
    console.log(`📊 结果数量: ${embeddings.length}`);
    console.log(`📐 向量维度: ${embeddings[0]?.length || 0}`);

    // 显示第一个向量的一部分
    if (embeddings[0]) {
      const preview = Array.from(embeddings[0].slice(0, 5)).map(v => v.toFixed(4));
      console.log(`🔍 向量示例: [${preview.join(', ')}, ...]`);
    }

    return { success: true, count: embeddings.length, duration, dims: embeddings[0]?.length };
  } catch (error) {
    console.error('❌ 嵌入失败:', error instanceof Error ? error.message : String(error));
    return { success: false, error: String(error) };
  }
}

async function testSingleEmbedding() {
  console.log('\n🧪 测试 2: 单条文本嵌入');
  console.log('=' .repeat(60));

  const testText = '智谱AI是一家中国的人工智能公司';

  try {
    console.log('📝 测试文本:', testText);
    console.log('⏳ 正在调用 Zhipu embedding-3 API...');

    const startTime = Date.now();
    const embedding = await embedOne(testText);
    const duration = Date.now() - startTime;

    console.log(`✅ 单条嵌入成功！耗时: ${duration}ms`);
    console.log(`📐 向量维度: ${embedding.length}`);

    // 计算向量的一些统计信息
    const arr = Array.from(embedding);
    const sum = arr.reduce((a, b) => a + b, 0);
    const avg = sum / arr.length;
    const min = Math.min(...arr);
    const max = Math.max(...arr);

    console.log(`📊 向量统计:`);
    console.log(`   - 总和: ${sum.toFixed(4)}`);
    console.log(`   - 平均值: ${avg.toFixed(4)}`);
    console.log(`   - 最小值: ${min.toFixed(4)}`);
    console.log(`   - 最大值: ${max.toFixed(4)}`);

    return { success: true, duration, dims: embedding.length, stats: { sum, avg, min, max } };
  } catch (error) {
    console.error('❌ 单条嵌入失败:', error instanceof Error ? error.message : String(error));
    return { success: false, error: String(error) };
  }
}

async function testExpansion() {
  console.log('\n🧪 测试 3: 查询扩展功能');
  console.log('=' .repeat(60));

  const testQuery = '人工智能应用';

  try {
    console.log('📝 原始查询:', testQuery);
    console.log('⏳ 正在调用 Zhipu glm-4.7 进行查询扩展...');

    const startTime = Date.now();
    const expanded = await expand(testQuery);
    const duration = Date.now() - startTime;

    console.log(`✅ 扩展成功！耗时: ${duration}ms`);
    console.log(`📊 扩展查询数量: ${expanded.length}`);
    console.log(`\n🔍 扩展结果:`);

    expanded.forEach((query, index) => {
      console.log(`   ${index + 1}. ${query}`);
    });

    return { success: true, count: expanded.length, duration, queries: expanded };
  } catch (error) {
    console.error('❌ 查询扩展失败:', error instanceof Error ? error.message : String(error));
    return { success: false, error: String(error) };
  }
}

async function testChineseEmbedding() {
  console.log('\n🧪 测试 4: 中文文本嵌入（CJK优化）');
  console.log('=' .repeat(60));

  const chineseTexts = [
    '深度学习在计算机视觉领域有广泛应用',
    '自然语言处理技术不断进步',
    '强化学习在游戏AI中表现出色',
  ];

  try {
    console.log('📝 中文测试文本:', chineseTexts);
    console.log('⏳ 正在调用 Zhipu embedding-3 API...');

    const startTime = Date.now();
    const embeddings = await embed(chineseTexts);
    const duration = Date.now() - startTime;

    console.log(`✅ 中文嵌入成功！耗时: ${duration}ms`);
    console.log(`📊 结果数量: ${embeddings.length}`);
    console.log(`📐 向量维度: ${embeddings[0]?.length || 0}`);

    // 计算相似度（余弦相似度）
    if (embeddings.length >= 2) {
      const dotProduct = embeddings[0].reduce((sum, a, i) => sum + a * embeddings[1][i], 0);
      const norm0 = Math.sqrt(embeddings[0].reduce((sum, a) => sum + a * a, 0));
      const norm1 = Math.sqrt(embeddings[1].reduce((sum, a) => sum + a * a, 0));
      const similarity = dotProduct / (norm0 * norm1);

      console.log(`\n🔍 相似度分析 (文本 1 vs 文本 2):`);
      console.log(`   - 余弦相似度: ${similarity.toFixed(4)}`);
      console.log(`   - 相似度百分比: ${(similarity * 100).toFixed(2)}%`);
    }

    return { success: true, count: embeddings.length, duration, dims: embeddings[0]?.length };
  } catch (error) {
    console.error('❌ 中文嵌入失败:', error instanceof Error ? error.message : String(error));
    return { success: false, error: String(error) };
  }
}

async function main() {
  console.log('🚀 Zhipu AI 功能测试');
  console.log('=' .repeat(60));
  console.log('配置信息:');
  console.log(`  - 嵌入模型: ${config.embedding_model}`);
  console.log(`  - 嵌入维度: ${config.embedding_dimensions} (✅ 实测 2048 维)`);
  console.log(`  - 扩展模型: ${config.expansion_model}`);
  console.log(`  - 聊天模型: ${config.chat_model}`);
  console.log(`  - API Key: ${config.env.ZHIPU_API_KEY?.substring(0, 20)}...`);

  console.log('\n✅ 2026-05-09 更新: Zhipu embedding-3 实际返回 2048 维');

  // 配置 gateway
  configureGateway(config);

  // 运行所有测试
  const results = {
    embedding: await testEmbedding(),
    singleEmbedding: await testSingleEmbedding(),
    expansion: await testExpansion(),
    chineseEmbedding: await testChineseEmbedding(),
  };

  // 总结
  console.log('\n📊 测试总结');
  console.log('=' .repeat(60));

  const tests = [
    { name: '向量嵌入', result: results.embedding },
    { name: '单条嵌入', result: results.singleEmbedding },
    { name: '查询扩展', result: results.expansion },
    { name: '中文嵌入', result: results.chineseEmbedding },
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(({ name, result }) => {
    if (result.success) {
      console.log(`✅ ${name}: 通过`);
      passed++;
    } else {
      console.log(`❌ ${name}: 失败`);
      console.log(`   错误: ${result.error}`);
      failed++;
    }
  });

  console.log(`\n总计: ${passed} 通过, ${failed} 失败`);

  if (failed > 0) {
    process.exit(1);
  }
}

// 运行测试
main().catch(error => {
  console.error('\n💥 测试脚本错误:', error);
  process.exit(1);
});
