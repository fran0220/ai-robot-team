# API 接口定义

## 1. 通信协议
- 传输层：Wi‑Fi / USB‑C / BLE。
- 调用协议：REST（设备管理与查询）、gRPC（围棋 AI 评估）、MQTT（动作控制）。
- 数据格式：JSON + SGF。

## 2. REST 接口（示例）
### 2.1 设备状态
- GET /api/v1/device/status
- 返回：电量、网络状态、温度、模式。

### 2.2 棋盘状态
- GET /api/v1/board/state
- 返回：当前局面（SGF）、棋子分布矩阵。

### 2.3 模块管理
- POST /api/v1/module/pair
- 用于主机与围棋模块绑定。

## 3. gRPC 接口（示例）
### 3.1 围棋 AI 评估
- Service: GoAI.Evaluate
- 输入：SGF、棋力等级、分析深度。
- 输出：胜率、候选点列表。

## 4. MQTT 消息（示例）
### 4.1 机械臂动作
- Topic: /gbm/arm/command
- Payload：
  - action: "place"
  - x, y, z: 坐标
  - speed: 速度参数

### 4.2 状态回传
- Topic: /gbm/arm/state
- Payload：执行结果、错误码。

## 5. 错误码定义
- 1001：通信失败
- 1002：模块未配对
- 2001：视觉识别失败
- 3001：机械臂执行异常
