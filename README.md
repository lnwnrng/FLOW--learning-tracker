# FLOW - 学习时长追踪应用

FLOW 是一款专注于学习时长记录的离线桌面应用，帮助你追踪和管理专注时间，提升学习效率。

## ✨ 功能特点

- 🎯 **专注计时器** - 自定义时长进行专注，自动保存会话记录
- 📊 **数据统计** - 查看每日、每周学习时长统计
- 🔥 **热力图** - GitHub 风格的年度学习热力图
- 📅 **任务管理** - 管理待办事项、事件和提醒
- 🏆 **成就系统** - 解锁成就，保持学习动力
- 💾 **离线优先** - 完全本地运行，数据安全可靠
- 📤 **数据导出** - 支持 JSON 格式导入导出

## 🛠️ 技术栈

- **前端**: React 19 + TypeScript + Vite
- **后端**: Tauri v2 + Rust
- **数据库**: SQLite (rusqlite)
- **状态管理**: Zustand

## 📋 环境要求

- [Node.js](https://nodejs.org/) >= 18.0
- [Rust](https://www.rust-lang.org/tools/install) >= 1.77
- [Tauri CLI v2](https://v2.tauri.app/start/prerequisites/)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <your-repo-url>
cd FLOW
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式运行

```bash
npm run tauri dev
```

首次运行会自动编译 Rust 后端，可能需要几分钟时间。

### 4. 构建生产版本

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 📁 项目结构

```
FLOW/
├── components/          # React UI 组件
├── services/            # Tauri API 封装层
│   ├── userService.ts
│   ├── sessionService.ts
│   ├── taskService.ts
│   ├── achievementService.ts
│   ├── settingsService.ts
│   └── dataService.ts
├── stores/              # Zustand 状态管理
│   ├── userStore.ts
│   ├── sessionStore.ts
│   ├── taskStore.ts
│   └── settingsStore.ts
├── src-tauri/           # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── commands/    # Tauri Commands (API)
│   │   ├── db/          # 数据库模块
│   │   ├── models/      # 数据模型
│   │   ├── lib.rs       # 应用入口
│   │   └── main.rs      # 主函数
│   ├── migrations/      # 数据库迁移脚本
│   └── Cargo.toml       # Rust 依赖配置
├── docs/                # 文档
├── types.ts             # TypeScript 类型定义
├── App.tsx              # React 应用主组件
├── index.html           # HTML 入口
├── vite.config.ts       # Vite 配置
└── package.json         # Node.js 依赖配置
```

## 🗄️ 数据存储

应用数据存储在系统应用数据目录：

- **Windows**: `C:\Users\<用户名>\AppData\Roaming\com.tauri.dev\flow.db`
- **macOS**: `~/Library/Application Support/com.tauri.dev/flow.db`
- **Linux**: `~/.local/share/com.tauri.dev/flow.db`

## 📝 开发状态

- [x] 阶段1: 基础环境搭建 (Tauri + SQLite)
- [x] 阶段2: Rust 后端核心开发
- [x] 阶段3: 前端集成
- [ ] 阶段4: 测试与打包

详见 [开发任务清单](./docs/TASKS.md) 和 [架构规划](./docs/ARCHITECTURE_PLAN.md)。

## 📄 License

MIT License
