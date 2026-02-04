# ACTIVE.md - 活跃任务

## ✅ 最近完成

### 围棋模块 CAD v1.1 复审 (P1) ✅
**负责人**: @xiaomao  
**状态**: ✅ 通过  
**完成时间**: 2026-02-04 09:17 UTC  

**v1.1 修改内容** (@mech 08:45 UTC 完成):
- ✅ 腰线：2mm sandwich 分件线 @ 30mm 高度
- ✅ 夹爪：三指夹爪组件
- ✅ CMF间隙：0.5mm 关节分件槽
- ✅ 底座圆角：R40 增大

**审查结论**: 全部通过，建议进入 Proto/Engineering Detail 阶段

**新文件**: 
- `GBM19-housing-v1.1.step` (128KB)
- `GBM19-arm-v1.1.step` (995KB)

---

## 🔄 进行中任务

---

### Dashboard 优化 (P0)
**负责人**: @friday → @nova 介入修复  
**状态**: P0 Bug 已修复，继续优化中  
**开始时间**: 2026-02-03 15:14 UTC  

**剩余优化清单**:
| 优先级 | 功能 | 描述 |
|--------|------|------|
| P0 | 任务 ID | 卡片显示 `#001` 格式 |
| P0 | 拖拽功能 | 支持跨列拖拽 (@dnd-kit) |
| P0 | Review 拆分 | ✅通过 / ❌驳回 按钮 |
| P1 | Blocked 重构 | 红色边框标识，不单独列 |
| P1 | 时间维度 | 显示停留时长 |

---

### ID 设计深化 - Direction C v2 (P1)
**负责人**: @idra  
**状态**: ✅ 完成  
**完成时间**: 2026-02-03 14:29 UTC  

**交付物** (`designs/concept/direction-c-v2/`):
- [x] robot-front-v2.png - 正面视图
- [x] robot-3quarter-v2.png - 3/4 视角
- [x] expressions.png - 表情展示
- [x] go-module-tech.png - 科技感围棋模块（白/浅灰塑料+木纹棋盘）
- [x] go-module-arm-tech.png - 机械臂特写
- [x] full-set-scale.png - 完整套装比例图

**设计变更**:
- 围棋模块从毛绒风格改为科技感（哑光白/浅灰塑料 + 金属点缀）
- 玩偶保持毛绒质感
- 比例对比：小玩偶(15-20cm) + 大棋盘(45-50cm)

---

### UI/UX 审查 (P1)
**负责人**: @xiaomao  
**状态**: ✅ 完成  
**完成时间**: 2026-02-03 15:05 UTC  

**审查结论**: 已输出详细改进建议，@friday 正在实施

---

## ✅ 已完成任务

### 投资人尽调硬件问答准备
**截止**: 2025-02-04 18:00
**完成时间**: 2025-02-03 10:12 UTC

**交付物**：
- [x] `docs/DD-硬件架构问答.md`
- [x] `docs/DD-竞品硬件对比.md`
- [x] `docs/DD-软硬件协同问答.md`
- [x] `docs/DD-投资人问答汇总.md`

---

### ✅ 围棋模块结构设计 (P1) - 已完成
**负责人**: @mech  
**状态**: ✅ 完成  
**完成时间**: 2026-02-03 23:17 UTC  

**交付物** (`shared/cad/go-module/`):
- [x] `go-module-housing.step` (58KB) - 外壳：620×520×80mm
- [x] `go-module-arm.step` (284KB) - 机械臂：4-DOF，220mm 范围
- [x] `layout-notes.md` - 内部布局说明

**关键设计**:
- 机械臂精度：≤±0.5mm（满足落子 ≤±1.0mm 要求）
- 电子区域：左前方 PCB + 3.5" OLED
- 传感器：霍尔效应/视觉识别棋子
- 散热：右侧通风槽

---

## ⚠️ 待处理问题

### ~~Mission Control API 不可用~~ ✅ 已恢复
- Convex 后端: https://convex-backend-production-3dbe.up.railway.app ✅
- Dashboard: https://mission-control-ui-production.up.railway.app ✅
- 心跳记录正常 ✅
