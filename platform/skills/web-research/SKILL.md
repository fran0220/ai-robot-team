---
name: web-research
description: Guide agents to perform web research using @rikalabs/parallel for deep, comprehensive searches. Use when researching technical topics, competitive analysis, market trends, or any web information gathering.
---

# Web Research (使用 @rikalabs/parallel)

本技能指导你使用 **@rikalabs/parallel** 进行高质量的网络调研。

## 核心原则

**使用 parallel search 而非内置 web_search**，因为它提供：
- 并行多源搜索，更全面的结果
- 更好的搜索质量和相关性
- 支持深度研究查询
- 自动提取关键内容摘要

## 如何使用 Parallel Search

### 基本用法 (exec 调用)

```bash
npx @rikalabs/parallel search --query "你的搜索查询" --max-results 5 --format json
```

### 参数说明

| 参数 | 说明 | 示例 |
|------|------|------|
| `--query` | 搜索关键词 (必填) | `--query "STM32 vs ESP32"` |
| `--max-results` | 返回结果数量 | `--max-results 10` |
| `--format` | 输出格式 (json/text) | `--format json` |
| `--mode` | 搜索模式 | `--mode agentic` |
| `--excerpt-chars` | 摘要字符数 | `--excerpt-chars 500` |

### 实际调用示例

```bash
# 技术对比调研
npx @rikalabs/parallel search --query "RK3588 vs Jetson Orin Nano 机器人应用 2024" --max-results 5 --format json

# 竞品分析
npx @rikalabs/parallel search --query "情感机器人 市场 竞品 2024" --max-results 8 --format json

# 供应商调研
npx @rikalabs/parallel search --query "STM32H7 供应商 价格 批量" --max-results 5 --format json
```

### 网页内容提取

```bash
npx @rikalabs/parallel extract --url "https://example.com/article" --objective "提取技术规格" --format json
```

## 搜索策略

### 1. 分解复杂调研为多个查询
- 不要用一个大查询覆盖所有内容
- 每个方面单独搜索，再综合结果

### 2. 使用精确关键词
```
❌ "机器人芯片"
✅ "RK3588 NPU 性能评测 2024"
✅ "Jetson Orin Nano vs RK3588 机器人应用"
```

### 3. 多语言搜索
- 技术主题用英文搜索获取更多资源
- 国内供应商/价格用中文搜索

### 4. 包含时间限定词
- 技术选型加 "2024" 或 "最新"
- 避免过时信息

## 调研工作流

### 技术选型调研
```bash
# Step 1: 总体对比
npx @rikalabs/parallel search --query "[技术A] vs [技术B] comparison 2024" --max-results 5 --format json

# Step 2: 各自优缺点
npx @rikalabs/parallel search --query "[技术A] pros cons limitations" --max-results 5 --format json

# Step 3: 实际应用案例
npx @rikalabs/parallel search --query "[技术A] robotics application case study" --max-results 5 --format json
```

### 竞品分析
```bash
# Step 1: 市场领导者
npx @rikalabs/parallel search --query "[产品类别] market leaders 2024" --max-results 5 --format json

# Step 2: 产品拆解
npx @rikalabs/parallel search --query "[竞品名称] teardown review" --max-results 5 --format json
```

## 结果处理

1. **验证信息源** - 优先官方文档、技术博客、学术论文
2. **交叉验证** - 重要数据至少两个来源确认
3. **标注来源** - 调研报告中明确标注每条信息的出处
4. **时效性** - 注明信息的日期，特别是技术规格

## 输出格式

JSON 格式返回：
```json
{
  "search_id": "search_xxx",
  "results": [
    {
      "url": "https://...",
      "title": "文章标题",
      "publish_date": "2024-01-15",
      "excerpts": ["摘要内容..."]
    }
  ],
  "usage": [{"name": "sku_search", "count": 1}]
}
```

## 调研输出模板

```markdown
# [调研主题]

## 调研目标
- 目标1
- 目标2

## 关键发现

### 方面1
- 发现内容
- 来源: [URL]

### 方面2
- 发现内容
- 来源: [URL]

## 对比分析
| 维度 | 选项A | 选项B | 选项C |
|------|-------|-------|-------|
| ... | ... | ... | ... |

## 建议
1. 推荐方案
2. 理由
3. 风险

## 参考资料
- [来源1](URL)
- [来源2](URL)
```

## 环境配置

已配置环境变量：
- `PARALLEL_API_KEY` - API 密钥 (已配置)
- `PATH` 包含 bun 路径

## 注意事项

- 搜索敏感话题时注意措辞
- 大量搜索时适当间隔，避免触发限制
- 保存重要搜索结果到本地，便于后续引用
- JSON 格式便于程序化处理结果
