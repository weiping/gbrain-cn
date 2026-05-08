import type { Recipe } from '../types.ts';

/**
 * Zhipu AI (智谱 AI) — Chinese AI provider with OpenAI-compatible API.
 *
 * Zhipu provides embedding models optimized for Chinese text and GLM chat models.
 * Their embedding-3 model returns 1024-dimensional vectors, well-suited for
 * multilingual semantic search.
 *
 * API docs: https://open.bigmodel.cn/dev/api
 */
export const zhipu: Recipe = {
  id: 'zhipu',
  name: 'Zhipu AI',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'https://open.bigmodel.cn/api/paas/v4',
  auth_env: {
    required: ['ZHIPU_API_KEY'],
    setup_url: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  touchpoints: {
    embedding: {
      models: ['embedding-2', 'embedding-3'],
      default_dims: 1024,
      dims_options: [1024],
      cost_per_1m_tokens_usd: 0.02, // embedding-3 pricing
      price_last_verified: '2026-04-22',
      // Zhipu embedding API handles ~8K tokens per request. Chinese text is
      // denser (~1.5-2 chars per token), so we use a conservative char estimate.
      max_batch_tokens: 8000,
      chars_per_token: 1.5,
      safety_factor: 0.7,
    },
    chat: {
      models: ['glm-4', 'glm-4-flash', 'glm-4-plus', 'glm-4-air'],
      supports_tools: true,
      supports_subagent_loop: true,
      supports_prompt_cache: false,
      max_context_tokens: 128000,
      cost_per_1m_input_usd: 0.5, // glm-4-flash baseline
      cost_per_1m_output_usd: 0.5,
      price_last_verified: '2026-04-22',
    },
    expansion: {
      models: ['glm-4-flash'],
      cost_per_1m_tokens_usd: 0.5,
      price_last_verified: '2026-04-22',
    },
  },
  setup_hint: 'Get an API key at https://open.bigmodel.cn/usercenter/apikeys, then `export ZHIPU_API_KEY=...`',
};
