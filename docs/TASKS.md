# FLOW 后端开发任务清单

## 阶段1: 基础环境搭建 ✅
- [x] 安装 Rust 工具链 (rustup)
- [x] 安装 Tauri CLI v2
- [x] 初始化 Tauri 项目结构
- [x] 配置 Cargo.toml 添加依赖 (rusqlite, serde, uuid)
- [x] 创建数据库迁移 SQL 脚本
- [x] 测试数据库初始化

## 阶段2: Rust 后端核心开发 ✅
- [x] 实现用户管理模块
  - [x] 创建用户 Command
  - [x] 获取用户 Command
  - [x] 更新用户 Command
- [x] 实现专注会话模块
  - [x] 创建会话 Command
  - [x] 查询会话历史 Command
  - [x] 获取每日统计 Command
  - [x] 获取热力图数据 Command
  - [x] 获取用户统计 Command
- [x] 实现任务管理模块
  - [x] 创建任务 Command
  - [x] 更新任务 Command
  - [x] 删除任务 Command
  - [x] 查询任务列表 Command
  - [x] 切换任务完成状态 Command
- [x] 实现成就模块
  - [x] 获取成就列表 Command
  - [x] 解锁成就 Command
  - [x] 自动检查成就 Command
- [x] 实现设置模块
  - [x] 获取/设置/删除用户设置 Commands
- [x] 实现数据导出模块
  - [x] 导出全部数据为 JSON Command
  - [x] 导入 JSON 数据 Command

## 阶段3: 前端集成 ✅
- [x] 安装 Zustand 状态管理库
- [x] 更新 types.ts 匹配后端模型
- [x] 创建 Zustand 状态管理 stores
  - [x] userStore.ts
  - [x] sessionStore.ts
  - [x] taskStore.ts
  - [x] settingsStore.ts
- [x] 封装 Tauri API 服务层
  - [x] userService.ts
  - [x] sessionService.ts
  - [x] taskService.ts
  - [x] achievementService.ts
  - [x] settingsService.ts
  - [x] dataService.ts
- [x] 重构 App.tsx 使用持久化数据
- [x] 添加 OnboardingScreen 新用户引导
- [x] 更新 StatsPage 组件
- [x] 更新 AchievementsPage 组件

## 阶段4: 测试与打包
- [ ] Rust 单元测试
- [ ] 前端功能测试
- [ ] Windows 打包测试 (.msi/.exe)
- [ ] Android 打包测试 (.apk)
- [ ] 性能优化
