# TOOLS.md - Local Notes

Skills define *how* tools work. This file is for *your* specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:
- Camera names and locations
- SSH hosts and aliases  
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras
- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH
- home-server → 192.168.1.100, user: admin

### TTS
- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Parallel Search (2026-02-03)

网络调研工具，已配置 API key。

```bash
npx @rikalabs/parallel search --query "搜索内容" --max-results 5 --format json
```

详见 web-research skill。

## Nano Banana / Nano Banana Pro (2026-02-03)

**Google DeepMind 的 AI 图像生成和编辑工具**，基于 Gemini 模型。

### 两个版本
| 版本 | 底层模型 | 特点 |
|------|---------|------|
| **Nano Banana** | Gemini 2.5 Flash | 快速生成、适合原型迭代 |
| **Nano Banana Pro** | Gemini 3 Pro | 高质量、支持4K、精准文字渲染 |

### 核心能力
- **角色一致性**：同一角色在多张图片中保持外观一致
- **图片融合**：无缝混合多张照片
- **局部编辑**：对图片特定部分进行修改
- **文字渲染**：生成带有清晰文字的图片（Pro 版本更强）
- **2K/4K 分辨率**：专业级输出

### 使用方式
1. **Gemini App**：选择 "🍌Create images" + "Fast"(Nano Banana) 或 "Thinking"(Pro)
2. **第三方平台**：nanobanana.org 提供 API 服务
3. **Google AI Studio**：开发者接入

### 定价参考 (nanobanana.org)
- Starter: $10.49/月 (4200 credits/年)
- Pro: $19.99/月 (19200 credits/年)
- Premium: $59.5/月 (66000 credits/年)

### ID 设计应用场景
- 产品概念渲染
- CMF（颜色/材质/工艺）探索
- 多角度视图生成
- 场景效果图
