import type { Recipe } from '../types.ts';

/**
 * Zhipu AI (智谱AI) BigModel Open Platform. OpenAI-compatible /embeddings
 * endpoint at open.bigmodel.cn. Hosts embedding-2 (1024d) and embedding-3
 * (Matryoshka 1024/1536/2048d).
 *
 * embedding-3 at 2048 dims exceeds pgvector's HNSW cap of 2000 — those
 * brains fall back to exact vector scans. Default is 1536 for compatibility
 * with existing OpenAI text-embedding-3-large brains.
 *
 * Chat models: glm-4.7 is the latest flagship with strong CJK understanding.
 *
 * API docs: https://open.bigmodel.cn/dev/api
 */
export const zhipu: Recipe = {
  id: 'zhipu',
  name: 'Zhipu AI (智谱AI BigModel)',
  tier: 'openai-compat',
  implementation: 'openai-compatible',
  base_url_default: 'https://open.bigmodel.cn/api/paas/v4',
  auth_env: {
    required: ['ZHIPUAI_API_KEY'],
    setup_url: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  touchpoints: {
    embedding: {
      models: ['embedding-3', 'embedding-2'],
      default_dims: 1024,
      dims_options: [512, 1024, 1536, 2048],
      cost_per_1m_tokens_usd: 0.02,
      price_last_verified: '2026-04-22',
      max_batch_tokens: 8000,
      chars_per_token: 1.5,
      safety_factor: 0.7,
    },
    chat: {
      models: ['glm-4.6', 'glm-4.7'],
      supports_tools: true,
      supports_subagent_loop: true,
      supports_prompt_cache: false,
      max_context_tokens: 128000,
      cost_per_1m_input_usd: 0.5,
      cost_per_1m_output_usd: 0.5,
      price_last_verified: '2026-04-22',
    },
    expansion: {
      models: ['glm-4.6', 'glm-4.7'],
      cost_per_1m_tokens_usd: 0.5,
      price_last_verified: '2026-04-22',
    },
  },
  setup_hint: 'Get an API key at https://open.bigmodel.cn/usercenter/apikeys, then `export ZHIPUAI_API_KEY=...`',
};
