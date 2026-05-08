#!/usr/bin/env bun
/**
 * Zhipu AI 维度测试脚本
 * 展示 1024 vs 1536 维度配置的差异
 */

import { configureGateway, embed, embedOne } from '../src/core/ai/gateway.ts';
import type { AIGatewayConfig } from '../src/core/ai/types.ts';

const testText = '人工智能是计算机科学的重要分支';

async function testWithDimensions(dims: number) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 测试配置: ${dims} 维`);
  console.log(`${'='.repeat(70)}`);

  const config: AIGatewayConfig = {
    embedding_model: 'zhipu:embedding-3',
    embedding_dimensions: dims,
    env: {
      ZHIPU_API_KEY: process.env.ZHIPU_API_KEY || 'd8e72d7cc79c4f1f9ee1edc8bd33a341.zCXSMTBJoj2TDbSo',
    },
    base_urls: {
      zhipu: 'https://open.bigmodel.cn/api/paas/v4',
    },
  };

  try {
    configureGateway(config);
    console.log(`✅ 配置已设置: ${dims} 维`);
    console.log(`📝 测试文本: "${testText}"`);
    console.log(`⏳ 正在调用 Zhipu API...`);

    const startTime = Date.now();
    const embedding = await embedOne(testText);
    const duration = Date.now() - startTime;

    const actualDims = embedding.length;

    console.log(`\n📊 测试结果:`);
    console.log(`   API 返回维度: ${actualDims}`);
    console.log(`   配置期望维度: ${dims}`);
    console.log(`   耗时: ${duration}ms`);

    if (actualDims === dims) {
      console.log(`   ✅ 维度匹配`);
    } else {
      console.log(`   ❌ 维度不匹配！`);
      console.log(`   ⚠️  这会导致数据插入失败`);
    }

    return {
      success: actualDims === dims,
      actualDims,
      configuredDims: dims,
      duration,
    };

  } catch (error) {
    console.error(`\n❌ 测试失败: ${error instanceof Error ? error.message : String(error)}`);

    // 检查是否是维度不匹配错误
    const errorMsg = String(error);
    if (errorMsg.includes('dim mismatch') || errorMsg.includes('维度')) {
      console.log(`\n💡 提示: 这是预期的维度不匹配错误`);
      console.log(`   Zhipu embedding-3 返回 1024 维`);
      console.log(`   配置为 ${dims} 维会导致此错误`);
    }

    return {
      success: false,
      configuredDims: dims,
      error: String(error),
    };
  }
}

async function main() {
  console.log('🚀 Zhipu AI 维度对比测试');
  console.log('=' .repeat(70));
  console.log('\nℹ️  本测试将对比两种配置:');
  console.log('   1. 1024 维（Zhipu 实际返回）');
  console.log('   2. 1536 维（您配置的值）');
  console.log('\n⚠️  警告: Zhipu embedding-3 实际返回 1024 维向量');

  const results = {
    dims1024: await testWithDimensions(1024),
    dims1536: await testWithDimensions(1536),
  };

  console.log(`\n${'='.repeat(70)}`);
  console.log('📊 测试总结');
  console.log(`${'='.repeat(70)}`);

  console.log(`\n1024 维配置:`);
  if (results.dims1024.success) {
    console.log(`  ✅ 成功 - 推荐配置`);
  } else {
    console.log(`  ❌ 失败 - ${results.dims1024.error}`);
  }

  console.log(`\n1536 维配置:`);
  if (results.dims1536.success) {
    console.log(`  ✅ 成功`);
  } else {
    console.log(`  ❌ 失败 - 维度不匹配错误`);
    console.log(`  💡 原因: Zhipu API 返回 1024 维，不是 1536 维`);
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('💡 建议:');
  console.log('   1. 使用 EMBEDDING_DIMENSIONS="1024" 配置');
  console.log('   2. 或使用 OpenAI 获得真正的 1536 维嵌入');
  console.log('   3. 参考: docs/guides/zhipu-ai-dimensions.md');
  console.log(`${'='.repeat(70)}`);

  // 返回适当的退出码
  if (!results.dims1024.success && !results.dims1536.success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 脚本错误:', error);
  process.exit(1);
});
