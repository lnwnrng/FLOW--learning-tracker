# FLOW 离线单机应用后端架构规划

本文档规划了 FLOW 学习时长记录应用的后端架构，目标是构建可安装在 Windows 桌面和 Android 桌面的离线单机应用。

## 背景分析

### 当前状态
- **前端**: React 19 + Vite + TypeScript
- **UI组件**: HomePage, FocusTimer, StatsPage, UserProfile, AchievementsPage, PremiumPage, SettingsPage
- **数据类型**: Task, User, UserStats, CalendarDay
- **数据状态**: 所有数据目前为 mock 数据，存储在 React state 中

### 需求
1. **离线优先**: 完全本地运行，无需网络连接
2. **跨平台**: Windows 桌面 + Android
3. **本地用户管理**: 用户创建和管理完全在本地完成
4. **数据持久化**: 学习记录、用户设置等需要持久化存储

---

## 架构推荐：Tauri + SQLite

### 为什么选择 Tauri？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Tauri** ✅ | 包体积小(~10MB)、性能好、原生安全性、Rust后端 | 需要学习Rust基础 |
| Electron | 成熟度高、生态丰富 | 包体积大(~150MB+)、内存占用高 |
| Capacitor | 移动端原生能力强 | 桌面端支持弱 |
| PWA | 无需安装 | 离线能力有限、无系统托盘 |

### Tauri 的核心优势

1. **极小的包体积**: Tauri 应用通常只有 10-20MB，而 Electron 往往超过 150MB
2. **高性能**: 使用系统 WebView 而非捆绑 Chromium
3. **跨平台支持**: Windows、macOS、Linux、Android、iOS
4. **安全性**: Rust 后端提供内存安全保证
5. **与 React/Vite 完美集成**: 官方支持 Vite 项目迁移

### 为什么选择 SQLite？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **SQLite** ✅ | 嵌入式、零配置、跨平台、成熟稳定 | 不支持并发写 |
| IndexedDB | 浏览器原生支持 | 容量限制、不适合复杂查询 |
| LevelDB | 快速 KV 存储 | 不支持复杂查询 |
| LocalStorage | 简单 | 5MB限制、同步阻塞 |

---

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (React + TypeScript)               │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ UI Components│  │ State Management│  │ Tauri API Layer │  │
│  │             │  │    (Zustand)    │  │                 │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                   后端层 (Rust + Tauri)                      │
│  ┌─────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Commands  │  │ Business Logic  │  │ SQLx / rusqlite │  │
│  └─────────────┘  └─────────────────┘  └─────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                        数据层                                │
│                    ┌─────────────┐                          │
│                    │   SQLite    │                          │
│                    │  Database   │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 数据库设计

### 表结构

```sql
-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    avatar_path TEXT,
    join_date TEXT NOT NULL,
    is_premium INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 专注会话表
CREATE TABLE focus_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT NOT NULL,
    category TEXT,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 任务表
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('To Do', 'Event', 'Reminder')),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 成就表
CREATE TABLE achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL,
    unlocked_at TEXT NOT NULL,
    metadata TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户设置表
CREATE TABLE user_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, key)
);

-- 每日统计缓存表
CREATE TABLE daily_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    total_focus_seconds INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
);

-- 索引
CREATE INDEX idx_sessions_user_date ON focus_sessions(user_id, started_at);
CREATE INDEX idx_tasks_user_date ON tasks(user_id, date);
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date);
```

---

## 目录结构规划

```
FLOW/
├── src/                          # 前端源码
│   ├── components/               # React 组件 (现有)
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useUser.ts
│   │   ├── useFocusSessions.ts
│   │   ├── useTasks.ts
│   │   └── useStats.ts
│   ├── stores/                   # Zustand 状态管理
│   │   ├── userStore.ts
│   │   ├── sessionStore.ts
│   │   ├── taskStore.ts
│   │   └── settingsStore.ts
│   ├── services/                 # Tauri API 封装
│   │   ├── database.ts
│   │   ├── userService.ts
│   │   ├── sessionService.ts
│   │   ├── taskService.ts
│   │   └── statsService.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── src-tauri/                    # Tauri 后端 (Rust)
│   ├── src/
│   │   ├── main.rs
│   │   ├── lib.rs
│   │   ├── commands/             # Tauri Commands
│   │   │   ├── mod.rs
│   │   │   ├── user.rs
│   │   │   ├── session.rs
│   │   │   ├── task.rs
│   │   │   └── stats.rs
│   │   ├── db/                   # 数据库层
│   │   │   ├── mod.rs
│   │   │   ├── schema.rs
│   │   │   └── migrations.rs
│   │   └── models/               # 数据模型
│   │       ├── mod.rs
│   │       ├── user.rs
│   │       ├── session.rs
│   │       └── task.rs
│   ├── migrations/
│   │   └── 001_initial.sql
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 确认的技术决策

### 1. Tauri 版本
✅ **Tauri v2** - 原生支持 Windows + Android

### 2. 数据库访问库
✅ **rusqlite** - 轻量级，同步 API

### 3. 状态管理
✅ **Zustand** - 轻量级，与 React Hooks 配合好

### 4. 功能范围
- [x] 数据导出/导入 (JSON)
- [ ] ~~云同步~~ (不需要)
- [ ] ~~多用户支持~~ (单用户)
- [ ] ~~系统托盘常驻~~ (不需要)
- [ ] ~~开机自启动~~ (不需要)

---

## 实施阶段

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| 1 | 基础搭建：Tauri + SQLite 环境 | 1-2天 |
| 2 | 后端核心：Rust Commands 开发 | 2-3天 |
| 3 | 前端集成：Zustand + API 封装 | 2-3天 |
| 4 | 测试与打包：Windows + Android | 1-2天 |

**总计**: 6-10 天
