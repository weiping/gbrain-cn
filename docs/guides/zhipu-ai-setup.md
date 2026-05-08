# Zhipu AI (智谱 AI) 集成指南

## 概述

GBrain 已完全支持 Zhipu AI 的嵌入和聊天模型：

- **嵌入模型**: `embedding-2`, `embedding-3` (1024维)
- **聊天模型**: `glm-4`, `glm-4-flash`, `glm-4-plus`, `glm-4-air`, `glm-4.7`
- **扩展模型**: `glm-4-flash`, `glm-4.7` (用于查询扩展)

## 环境变量配置

在您的 shell 配置文件（如 `~/.zshrc` 或 `~/.bashrc`）中添加：

```bash
# Zhipu AI API 配置
export ZHIPU_API_KEY="your_api_key_here"
export EMBEDDING_MODEL="zhipu:embedding-3"
export EMBEDDING_DIMENSIONS="1024"
export EMBEDDING_BASE_URL="https://open.bigmodel.cn/api/paas/v4"

# 可选：使用 glm-4.7 作为聊天模型
export CHAT_MODEL="zhipu:glm-4.7"

# 可选：使用 glm-4.7 进行查询扩展
export EXPANSION_MODEL="zhipu:glm-4.7"
```

然后重新加载配置：

```bash
source ~/.zshrc
```

## 获取 API Key

1. 访问 [https://open.bigmodel.cn/usercenter/apikeys](https://open.bigmodel.cn/usercenter/apikeys)
2. 创建或复制您的 API Key
3. 设置 `ZHIPU_API_KEY` 环境变量

## 重要说明

### 嵌入维度 (1024 vs 1536)

**Zhipu embedding-3 返回 1024 维向量**，而不是 OpenAI 的 1536 维。

如果您之前使用 OpenAI 的 `text-embedding-3-large`（1536维），需要重建向量列：

```bash
# 1. 备份数据库（推荐）
gbrain doctor

# 2. 迁移到 Zhipu 嵌入模型
gbrain migrate --embedding-model zhipu:embedding-3 --embedding-dimensions 1024

# 3. 重新嵌入所有页面
gbrain embed --all
```

### 模型特性

| 模型 | 用途 | 上下文长度 | 特点 |
|------|------|-----------|------|
| `glm-4.7` | 旗舰聊天模型 | 128K | 最新的 GLM 系列，强大的中文理解 |
| `glm-4-flash` | 快速聊天 | 128K | 响应速度快，成本较低 |
| `glm-4-plus` | 增强版 | 128K | 性能更强 |
| `glm-4-air` | 轻量级 | 128K | 资源占用少 |
| `embedding-3` | 文本嵌入 | - | 1024维，中文优化 |

## 使用示例

### 基本查询

```bash
# 使用 glm-4.7 进行查询
gbrain query "什么是人工智能？" --model zhipu:glm-4.7
```

### 重新嵌入

```bash
# 使用 Zhipu embedding-3 重新嵌入所有页面
gbrain embed --all

# 只嵌入特定页面
gbrain embed --slugs page1 page2
```

### 自动驾驶循环

您的 `~/.gbrain/config.json` 会自动使用环境变量中的配置：

```json
{
  "embedding_model": "zhipu:embedding-3",
  "embedding_dimensions": 1024,
  "chat_model": "zhipu:glm-4.7",
  "expansion_model": "zhipu:glm-4.7"
}
```

## 故障排除

### API Key 错误

如果看到 `Zhipu AI requires ZHIPU_API_KEY` 错误：

```bash
# 检查环境变量是否设置
echo $ZHIPU_API_KEY

# 如果为空，重新设置并重新加载
export ZHIPU_API_KEY="your_api_key_here"
source ~/.zshrc
```

### 维度不匹配错误

如果看到 `Embedding dim mismatch` 错误：

```bash
# 检查当前配置
gbrain doctor

# 运行迁移命令
gbrain migrate --embedding-model zhipu:embedding-3 --embedding-dimensions 1024
```

### 网络问题

Zhipu API 端点：`https://open.bigmodel.cn/api/paas/v4`

如果遇到连接问题：

```bash
# 测试网络连接
curl -I https://open.bigmodel.cn/api/paas/v4

# 检查防火墙设置
```

## 价格参考（2026年）

| 服务 | 模型 | 价格（美元/百万 token） |
|------|------|----------------------|
| 嵌入 | embedding-3 | $0.02 |
| 聊天 | glm-4-flash | $0.5 |
| 聊天 | glm-4.7 | 请查看官网最新价格 |

## 相关链接

- [Zhipu AI API 文档](https://open.bigmodel.cn/dev/api)
- [获取 API Key](https://open.bigmodel.cn/usercenter/apikeys)
- [GBrain 配置指南](./configuration.md)
