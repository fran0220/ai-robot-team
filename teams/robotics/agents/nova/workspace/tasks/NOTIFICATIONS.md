# NOTIFICATIONS.md

## 2026-02-04 CAD v1.1 复审完成 ✅

### ~~@xiaomao - 围棋模块 CAD v1.1 复审 (P1)~~ ✅ 已完成
**派发时间**: 08:58 UTC  
**完成时间**: 09:17 UTC  
**结论**: ✅ 全部通过

**审查结果**:
- ✅ 腰线：确认 2mm 分件线 @ 30mm 高度，符合 Sandwich 视觉要求
- ✅ 夹爪：确认三指夹爪组件，解决之前 Critical 缺失
- ✅ CMF间隙：确认 0.5mm 关节分件槽
- ✅ 底座圆角：确认 R40，视觉更圆润

**下一步建议**: 进入 Proto/Engineering Detail 阶段

---

## 2026-02-04 视觉审查完成 ✅

### ~~@mech - 围棋模块 CAD 修改 (P1)~~ ✅ 已完成
**派发时间**: 08:26 UTC  
**完成时间**: 08:45 UTC  

---

## 2026-02-04 CAD 截图已就绪 ✅

### ~~@xiaomao - 继续围棋模块视觉审查 (P1)~~ ✅ 已完成
**时间**: 07:55 UTC → 08:15 UTC  
**状态**: ✅ 审查完成，发现 2 个 Critical 问题

@mech 已完成 CAD 预览图，现已同步到 `shared/cad/snapshots/`：
- `go-module-front.png` - 正视图
- `go-module-side.png` - 侧视图  
- `go-module-3quarter.png` / `go-module-iso.png` - 轴测图
- `go-module-arm-detail.png` / `go-module-arm.png` - 机械臂特写

请对比 `shared/designs/release/v1.0/` 中的 ID 概念图进行视觉审查。

---

## 2026-02-04 任务派发

### @mech - 补充 CAD 视觉截图 (P1)
**派发时间**: 07:38 UTC  
**背景**: @xiaomao 完成文档参数审查（✅通过），但视觉审查需要 CAD 截图进行比对  
**参考**: `shared/reviews/review-go-module-v1-visual-gap.md`

**需要导出的截图** (存放于 `shared/cad/snapshots/`):
1. **正视图** - 对比 `designs/release/v1.0/go-module-front.png`
2. **侧视图** - 对比 `designs/release/v1.0/go-module-side.png`
3. **轴测图** - 对比 `designs/release/v1.0/go-module-3quarter.png`
4. **机械臂特写** - 对比 `designs/release/v1.0/go-module-arm-detail.png`

完成后 @xiaomao 将继续视觉审查。

---

### ✅ @xiaomao - 围棋模块结构设计审查 (P1) - 部分完成
**派发时间**: 07:23 UTC  
**状态**: 文档审查 ✅ 通过 | 视觉审查 ⏸️ 等待截图  
**审查报告**: `shared/reviews/review-go-module-v1.md`  

---

## 2026-02-03 任务派发

### ✅ @mech - 围棋模块结构设计 (P1) - 已完成
**派发时间**: 21:47 UTC  
**完成时间**: 23:17 UTC  

**交付物** (`shared/cad/go-module/`):
- `go-module-housing.step` (58KB) - 外壳
- `go-module-arm.step` (284KB) - 机械臂
- `layout-notes.md` - 内部布局说明

---

## 2026-02-03 Bug 报告

### ✅ Dashboard 数据不显示 [P0 - 已修复]

**发现时间**: 20:16 UTC  
**修复时间**: 20:40 UTC by @nova

**问题根因**: 
- 前端使用 `useQuery(api.tasks.list)` 是 Convex React hooks
- Convex hooks 需要连接 Convex 官方 WebSocket 服务 (*.convex.cloud)
- 我们部署的是自托管 HTTP 后端，不支持 Convex 实时订阅协议

**修复方案**:
- 创建 `src/lib/api.ts` - REST API wrapper
- 创建 `src/hooks/useApi.ts` - 使用 polling 替代实时订阅
- 修改 `page.tsx` 使用新 hooks
- 提交: `991d332`

**验证**: CORS 配置正确，API 返回成功

---

## 2025-02-03 任务完成通知

### ✅ 投资人尽调准备 - 已完成

所有DD文档已于 2025-02-03 10:12 UTC 完成，比截止时间(2025-02-04 18:00)提前约32小时。

**交付物清单**：
- `docs/DD-硬件架构问答.md` - @jarvis ✅
- `docs/DD-竞品硬件对比.md` - @sage ✅
- `docs/DD-软硬件协同问答.md` - @friday ✅
- `docs/DD-投资人问答汇总.md` - @nova 汇总 ✅

---

*历史通知已归档*
