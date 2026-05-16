import { describe, it, expect } from 'bun:test';
import { zhipu } from '../src/core/ai/recipes/zhipu.ts';
import { getRecipe, RECIPES } from '../src/core/ai/recipes/index.ts';

describe('Zhipu AI Recipe', () => {
  it('should be registered in RECIPES', () => {
    expect(RECIPES.has('zhipu')).toBe(true);
  });

  it('should be retrievable via getRecipe', () => {
    const recipe = getRecipe('zhipu');
    expect(recipe).toBeDefined();
    expect(recipe?.id).toBe('zhipu');
  });

  it('should have correct metadata', () => {
    expect(zhipu.id).toBe('zhipu');
    expect(zhipu.name).toBe('Zhipu AI (智谱AI BigModel)');
    expect(zhipu.tier).toBe('openai-compat');
    expect(zhipu.implementation).toBe('openai-compatible');
    expect(zhipu.base_url_default).toBe('https://open.bigmodel.cn/api/paas/v4');
  });

  it('should require ZHIPUAI_API_KEY', () => {
    expect(zhipu.auth_env!.required).toEqual(['ZHIPUAI_API_KEY']);
    expect(zhipu.auth_env!.setup_url).toBe('https://open.bigmodel.cn/usercenter/apikeys');
  });

  it('should have embedding touchpoint', () => {
    const embedding = zhipu.touchpoints!.embedding!;
    expect(embedding).toBeDefined();
    expect(embedding.models).toContain('embedding-2');
    expect(embedding.models).toContain('embedding-3');
    expect(embedding.default_dims).toBe(1024);
    expect(embedding.max_batch_tokens).toBe(8000);
    expect(embedding.chars_per_token).toBe(1.5);
    expect(embedding.safety_factor).toBe(0.7);
  });

  it('should have chat touchpoint with GLM models', () => {
    const chat = zhipu.touchpoints!.chat!;
    expect(chat).toBeDefined();
    expect(chat.models).toContain('glm-4');
    expect(chat.models).toContain('glm-4-flash');
    expect(chat.models).toContain('glm-4-plus');
    expect(chat.models).toContain('glm-4-air');
    expect(chat.supports_tools).toBe(true);
    expect(chat.supports_subagent_loop).toBe(true);
    expect(chat.max_context_tokens).toBe(128000);
  });

  it('should have expansion touchpoint', () => {
    const expansion = zhipu.touchpoints!.expansion!;
    expect(expansion).toBeDefined();
    expect(expansion.models).toContain('glm-4-flash');
  });

  it('should provide setup hint', () => {
    expect(zhipu.setup_hint).toContain('export ZHIPUAI_API_KEY');
    expect(zhipu.setup_hint).toContain('open.bigmodel.cn');
  });

  it('should have pricing data', () => {
    const embedding = zhipu.touchpoints!.embedding!;
    const chat = zhipu.touchpoints!.chat!;
    const expansion = zhipu.touchpoints!.expansion!;
    expect(embedding.cost_per_1m_tokens_usd).toBe(0.02);
    expect(embedding.price_last_verified).toBeDefined();
    expect(chat.cost_per_1m_input_usd).toBe(0.5);
    expect(chat.cost_per_1m_output_usd).toBe(0.5);
    expect(expansion.cost_per_1m_tokens_usd).toBe(0.5);
  });
});
