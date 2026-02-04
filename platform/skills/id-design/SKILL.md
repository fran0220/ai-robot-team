---
name: id-design
description: 工业设计（ID）技能，使用 Nano Banana Pro 进行产品概念渲染、CMF探索和外观设计。适用于硬件产品外观设计、概念图生成、材质工艺探索。
---

# ID Design Skill - 工业设计技能

## 概述
本技能用于工业设计（Industrial Design）工作，主要使用 **Nano Banana Pro**（Google Gemini 3 Pro 图像模型）进行产品概念渲染和视觉探索。

## 核心工具：Nano Banana Pro

### 什么是 Nano Banana Pro？
Google DeepMind 的 AI 图像生成工具，基于 Gemini 3 Pro 模型。

| 特性 | 说明 |
|------|------|
| 分辨率 | 最高 4K |
| 文字渲染 | 精准多语言文字 |
| 角色一致性 | 同一产品多角度保持一致 |
| 局部编辑 | 修改图片特定部分 |
| 图片融合 | 混合多张参考图 |

### 使用方式

#### 方式1：Gemini App（推荐）
1. 打开 https://gemini.google.com/app
2. 选择 "🍌Create images" 工具
3. 选择 "Thinking" 模型（即 Nano Banana Pro）
4. 输入 Prompt 或上传参考图

#### 方式2：第三方 API（nanobanana.org）
```bash
# 示例 API 调用
curl -X POST https://api.nanobanana.org/v1/generate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"prompt": "产品概念图...", "model": "pro"}'
```

## ID 设计工作流程

### 1. 概念渲染 (Concept Rendering)
生成产品外观概念图，探索设计方向。

**Prompt 模板**：
```
Create a product concept render of [产品描述].
Style: [modern/minimalist/futuristic/organic]
View: [front/side/3/4 angle/top-down]
Background: [white studio/lifestyle scene/gradient]
Material: [matte plastic/glossy/metal/wood]
```

**示例**：
```
Create a product concept render of a cute emotional companion robot 
for children. Round, friendly design with a circular LCD face display 
showing expressive eyes. Style: modern kawaii. View: 3/4 angle. 
Background: soft gradient. Material: matte white plastic with 
pastel accent colors.
```

### 2. CMF 探索 (Color, Material, Finish)
探索不同颜色、材质和表面工艺。

**Prompt 模板**：
```
Generate CMF variations of [产品名称]:
- Color options: [颜色1], [颜色2], [颜色3]
- Material: [材质]
- Finish: [表面工艺]
Show all variations in a grid layout.
```

**常用 CMF 词汇**：
- **颜色**：Arctic White, Space Gray, Rose Gold, Midnight Blue
- **材质**：ABS plastic, Aluminum, Soft-touch rubber, Fabric
- **工艺**：Matte, Glossy, Brushed, Textured, Soft-touch coating

### 3. 多角度视图 (Multi-view Generation)
生成产品的多角度视图，用于设计评审。

**Prompt 模板**：
```
Generate orthographic views of [产品名称]:
- Front view
- Side view  
- Top view
- 3/4 perspective view
Arrange in a 2x2 grid, white background, consistent lighting.
```

### 4. 场景效果图 (Lifestyle Rendering)
将产品放入使用场景中展示。

**Prompt 模板**：
```
Create a lifestyle render of [产品名称] in [场景描述].
Show [用户类型] interacting with the product.
Lighting: [自然光/室内暖光/专业摄影]
Mood: [温馨/专业/活力]
```

## 设计输出规范

### 文件命名
```
[项目代码]-[设计类型]-[版本]-[日期].png
例：GBM19-concept-v1-20260203.png
```

### 设计类型代码
- `concept` - 概念图
- `cmf` - CMF 探索
- `ortho` - 正交视图
- `lifestyle` - 场景效果图
- `detail` - 细节特写

### 交付物清单
1. **概念方案** - 3-5 个设计方向
2. **CMF 方案** - 推荐配色和材质
3. **多角度视图** - 正面/侧面/顶面/透视
4. **场景效果图** - 至少 2 张使用场景

## 与其他角色协作

### 与硬件工程师 (@jarvis)
- 确认内部结构约束
- 确认散热/天线区域
- 确认按键/接口位置

### 与结构工程师 (@mech)
- 确认壁厚和拔模角度
- 确认装配方式
- 确认 DFM 可行性

### 与产品经理 (@atlas)
- 确认目标用户审美偏好
- 确认品牌调性
- 确认成本约束

## 注意事项

1. **版权**：AI 生成图像用于内部概念探索，量产设计需人工精化
2. **一致性**：使用相同的 seed/style 保持系列产品一致性
3. **可行性**：概念图需考虑工程可实现性
4. **迭代**：基于反馈快速迭代，不追求一次完美
