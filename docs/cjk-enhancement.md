# CJK 搜索增强 - 可选 Nodejieba 集成

## 概述

GBrain 默认使用**原生中文双字切分器**进行 CJK 搜索，无需任何外部依赖。对于大多数中文知识库来说，这已经提供了优秀的搜索体验。

如果您需要**更专业的中文分词**（如专业术语、新词识别），可以启用可选的 nodejieba 集成。

## 对比

| 特性 | 原生双字切分 | Nodejieba 增强 |
|------|---------------|----------------|
| 依赖 | 无 | nodejieba (可选) |
| 构建速度 | 快 | 慢（需编译原生模块） |
| PGLite 兼容 | ✅ 完全兼容 | ✅ 兼容 |
| 分词质量 | ⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 专业级 |
| 适用场景 | 日常使用 | 专业术语、新词 |

## 启用 Nodejieba

### 1. 安装依赖

```bash
pnpm add nodejieba
```

### 2. 设置环境变量

```bash
export GBRAIN_USE_NODEJIEBA=true
```

### 3. 重新同步以重新索引

```bash
gbrain sync
```

### 4. 验证状态

```bash
gbrain doctor --cjk
```

## 使用示例

### 基础搜索（无需 nodejieba）

```bash
# 原生双字切分已经很好
gbrain query "人工智能"
gbrain query "深度学习"
```

### 增强（使用 nodejieba）

```bash
# 启用 nodejieba 后，搜索更精确
GBRAIN_USE_NODEJIEBA=true gbrain query "机器学习算法"
```

## 技术细节

### 原生实现（默认）

```typescript
// chineseBigram() 函数
"人工智能" → "人 工 智 能 人工 工智 智能"
```

- 单字匹配：高召回率
- 双字匹配：高精确度
- 无需依赖

### Nodejieba 增强

```typescript
// enhancedChineseBigram() 函数
"机器学习算法" → "机器 学习 算法 机器学 学习算 法"
```

- 词汇边界感知
- 专业术语识别
- 新词自适应

## 疑难解答

### Q: 我应该启用 nodejieba 吗？

**A:** 大多数情况下不需要。原生实现已经足够好。只有在以下情况才考虑启用：

- 你的知识库包含大量专业术语
- 需要精确的词汇边界识别
- 对搜索质量有极高要求

### Q: nodejieba 会导致构建失败吗？

**A:** 可能会。nodejieba 是原生模块，需要编译。在某些环境下（如 Windows、某些 CI 环境），编译可能失败。

如果遇到构建问题，只需：
1. 不设置 `GBRAIN_USE_NODEJIEBA=true`
2. 或卸载：`pnpm remove nodejieba`

GBrain 会自动回退到原生实现。

### Q: PGLite 能用 nodejieba 吗？

**A:** 可以。nodejieba 在 Node.js 层运行，PGLite 只存储结果。但要注意文件体积增加。

### Q: 已有的页面会自动重新索引吗？

**A:** 不会。需要重新同步以应用新的分词：

```bash
gbrain sync --force
```

## 配置参考

### 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `GBRAIN_USE_NODEJIEBA` | `false` | 是否启用 nodejieba |

### 诊断命令

```bash
# 检查 CJK 增强状态
gbrain doctor --cjk-status

# 输出示例：
# ✓ CJK search: native (chineseBigram)
#   - nodejieba available: false
#   - enhancement disabled
```

## 性能考虑

### 原生实现

- **索引速度**: ⚡⚡⚡ 非常快
- **查询速度**: ⚡⚡⚡ 非常快
- **内存占用**: 💚 低

### Nodejieba 增强

- **索引速度**: ⚡⚡ 中等（增加分词时间）
- **查询速度**: ⚡⚡⚡ 快（查询时无影响）
- **内存占用**: 💛 中等（nodejieba 模块）

## 开发者 API

如果您是开发者，可以在代码中直接使用 CJK 增强层：

```typescript
import { segmentChinese, enhancedChineseBigram, getCjkStatus } from './src/core/cjk-optional.ts';

// 获取状态
const status = getCjkStatus();
console.log(status);

// 分词
const tokens = segmentChinese("中文测试");
console.log(tokens); // ['中文', '测试']

// 增强双字切分
const bigrams = enhancedChineseBigram("人工智能");
console.log(bigrams); // "人工智能 人工 智能"
```
