# SmartHome Designer Pro | 全屋智能方案设计管理系统

SmartHome Designer Pro 是一款专为全屋智能服务商打造的一站式业务操作系统（OS）。它将 AI 空间规划、3D 视觉设计、供应链管理、工程交付与财务核算深度集成，旨在通过数字化手段提升方案设计的准确性与商业转化率。

---

## 🌟 核心特性 (Key Features)

### 1. AI 智能空间架构师 (AI Spatial Architect)
- **户型识别**：基于 Google Gemini 3 Pro 模型，自动分析上传的户型图结构，识别房间类型（客厅、卧室等）。
- **自动布光/布控**：根据用户预算与生活习惯，AI 自动推荐最优的智能设备摆放坐标（X, Y）。
- **风格迁移**：支持法式、简约、原木、工业等多种装修风格的 3D 模拟。

### 2. 视觉化设计引擎 (Visual Design Engine)
- **2D 点位图**：矢量化的平面编辑工具，支持设备拖拽、状态切换与实时物料汇总（BOM）。
- **3D 神经渲染**：基于 Three.js 的实时 3D 渲染，支持动态光影效果，让客户直观感受智能化后的场景。

### 3. 全生命周期管理 (Full Lifecycle Management)
- **客户公海与私域**：完整的 CRM 系统，追踪从潜客到签约的全流程。
- **电子合同与签章**：集成在线合同生成与电子印章系统，支持移动端手写签名。
- **供应链协同**：涵盖供应商管理、采购单、备货单及多级库存盘点。
- **施工数字化**：看板式工程进度管理，支持质检报告、施工日志与竣工验收。

### 4. 财务分析看板 (Financial Intelligence)
- **项目收支核算**：实时计算单个项目的毛利率、硬件成本与人工成本。
- **资金流水记录**：全渠道（银行、支付宝、现金）的收支透明化管理。

---

## 🛠 技术栈 (Tech Stack)

- **前端框架**: React 19 (ES6+ Modules)
- **UI/样式**: Tailwind CSS & Lucide Icons
- **3D 引擎**: Three.js (WebGL)
- **人工智能**: Google Gemini API (@google/genai)
- **图标系统**: Lucide React
- **开发工具**: 原生 ESM 导入图 (Import Maps)

---

## 🚀 快速开始 (Quick Start)

### 环境要求
- 一个支持静态文件服务的 Web 服务器 (如 `serve`, `http-server` 或 VS Code 的 Live Server)。
- **Google Gemini API Key**: 用于驱动 AI 户型分析与 3D 效果生成。

### 1. 配置 API Key
本项目要求在环境变量中提供 Gemini API Key。在执行环境或构建工具中设置：
```bash
# 示例：在终端中设置（取决于你的开发环境）
export API_KEY='你的_GEMINI_API_KEY'
```
*注意：应用程序会自动通过 `process.env.API_KEY` 获取该值。*

### 2. 本地运行
由于项目使用了 `importmap` 和原生 ESM，你只需在根目录启动一个简单的静态服务器即可：

```bash
# 使用 npx 快速启动
npx serve .
```

打开浏览器访问 `http://localhost:3000` (或服务器指定的端口)。

### 3. 登录测试
系统内置了快速登录通道，你可以使用以下角色进入系统：
- **Admin**: 拥有全局管理权限。
- **Designer**: 侧重于方案设计与产品库。
- **Sales**: 侧重于客户关系与订单成交。

---

## 📂 目录结构 (Directory Structure)

- `index.html`: 入口文件，包含 Import Maps 配置。
- `index.tsx`: React 挂载入口。
- `App.tsx`: 核心路由与状态管理中心。
- `types.ts`: 严格的 TypeScript 类型定义。
- `constants.tsx`: 模拟数据与图标配置。
- `geminiService.ts`: AI 逻辑集成层。
- `components/`: 
  - `FloorPlanDesigner.tsx`: AI 设计器核心组件。
  - `ThreeDFloorPlan.tsx`: 3D 渲染逻辑。
  - `VectorFloorPlan.tsx`: 2D 矢量画布。
  - `...Manager.tsx`: 各业务模块管理组件。

---

## 🔒 权限说明 (Permissions)
本系统在 `metadata.json` 中声明了以下权限：
- **Camera**: 用于扫描户型图或上传施工现场照片。

---

## 📄 许可证 (License)
基于 MIT License 协议开源。

---
**SmartHome Designer Pro** - 让每一处空间都拥有智慧。
