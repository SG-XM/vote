# 选手打分展示系统

这是一个基于Vue 3 + TypeScript + Vite开发的选手打分展示系统，用于在比赛或演出中展示选手信息和得分。

## 功能特点

- **展示页面**：展示当前选手的基本信息（序号、姓名、照片）以及得分或倒计时
- **管理页面**：控制当前显示的选手、修改选手得分、控制显示模式（得分/倒计时）

## 使用说明

1. 启动项目：
   ```bash
   npm install
   npm run dev
   ```

2. 访问地址：
   - 展示页面：`/display`
   - 管理页面：`/admin`

## 技术栈

- Vue 3 Composition API
- TypeScript
- Vite 构建工具
- Vue Router 路由管理
- Pinia 状态管理

## 数据说明

系统使用浏览器本地存储（localStorage）保存选手信息和得分数据，无需后端支持。

# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
