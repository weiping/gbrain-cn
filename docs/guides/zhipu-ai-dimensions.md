# Zhipu AI 嵌入维度配置说明

## ⚠️ 重要：维度不匹配问题

### Zhipu embedding-3 实际返回 1024 维

```bash
# Zhipu API 实际返回
embedding-3 → 1024 维向量

# 配置为 1536 会导致错误
EMBEDDING_DIMENSIONS="1536"  # ❌ 这会导致维度不匹配错误！
```

### 错误示例

如果配置为 1536 维，您会看到类似错误：

```
Embedding dim mismatch: model embedding-3 returned 1024 but schema expects 1536.
```

## 🔧 解决方案

### 方案 1: 使用正确的 1024 维（推荐）

```bash
export EMBEDDING_DIMENSIONS="1024"
```

### 方案 2: 使用 OpenAI 获得 1536 维

如果必须使用 1536 维：

```bash
# 使用 OpenAI 的 text-embedding-3-large（返回 1536 维）
export OPENAI_API_KEY="your_openai_key"
export EMBEDDING_MODEL="openai:text-embedding-3-large"
export EMBEDDING_DIMENSIONS="1536"

# 查询扩展仍可使用 Zhipu glm-4.7
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
```

### 方案 3: 混合配置（嵌入 + 扩展分离）

```bash
# 嵌入使用 OpenAI（1536 维）
export OPENAI_API_KEY="your_openai_key"
export EMBEDDING_MODEL="openai:text-embedding-3-large"
export EMBEDDING_DIMENSIONS="1536"

# 扩展使用 Zhipu（中文优化）
export ZHIPU_API_KEY="your_zhipu_key"
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
```

## 📊 各模型维度对比

| 提供商 | 模型 | 向量维度 | 状态 |
|--------|------|----------|------|
| Zhipu AI | embedding-2 | 1024 | ✅ 支持 |
| Zhipu AI | embedding-3 | 1024 | ✅ 支持 |
| OpenAI | text-embedding-3-small | 1536 | ✅ 支持 |
| OpenAI | text-embedding-3-large | 1536 | ✅ 支持 |
| Voyage AI | voyage-3 | 1024 | ✅ 支持 |
| Voyage AI | voyage-large-3-instruct | 1024 | ✅ 支持 |

## 🚀 推荐配置

### 纯 Zhipu 配置（1024 维）

```bash
export ZHIPU_API_KEY="your_key"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1024"  # ✅ 正确
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
```

### 混合配置（OpenAI 嵌入 + Zhipu 扩展）

```bash
export OPENAI_API_KEY="your_openai_key"
export ZHIPU_API_KEY="your_zhipu_key"
export EMBEDDING_MODEL="openai:text-embedding-3-large"
export EMBEDDING_DIMENSIONS="1536"  # ✅ OpenAI 支持 1536
export CHAT_MODEL="zhipu:glm-4.7"
export EXPANSION_MODEL="zhipu:glm-4.7"
```

## 🔄 迁移步骤

如果您当前的数据库使用 1536 维（OpenAI），想切换到 Zhipu（1024 维）：

```bash
# 1. 备份数据
gbrain doctor

# 2. 迁移到 1024 维
gbrain migrate --embedding-model zhipu:embedding-3 --embedding-dimensions 1024

# 3. 重新嵌入
gbrain embed --all
```

## 💡 为什么选择不同配置？

### 纯 Zhipu（1024 维）
- ✅ 成本更低（Zhipu 价格优惠）
- ✅ 中文优化
- ✅ 单一提供商，管理简单
- ❌ 需要重新嵌入现有数据

### 混合配置（1536 维）
- ✅ 保持现有 OpenAI 数据
- ✅ OpenAI 嵌入质量高
- ✅ Zhipu 扩展中文理解强
- ❌ 两个提供商，成本较高

## 📖 更多信息

- [Zhipu AI API 文档](https://open.bigmodel.cn/dev/api)
- [OpenAI Embedding 文档](https://platform.openai.com/docs/guides/embeddings)
