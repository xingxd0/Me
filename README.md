# Minimalist Designer Portfolio

一个用于个人作品集展示的前端项目，包含：

- 前台展示页：`Home`、`About Work`、作品详情页
- 本地后台：`/admin`，用于维护首页信息、作品列表和详情内容
- 静态发布内容：通过导出 JSON 和本地图库文件进行最终发布
- GitHub Pages 部署：推送到 `main` 后自动构建并发布

## 技术栈

- `React 19`
- `TypeScript`
- `Vite`
- `React Router`
- `Tailwind CSS`

## 本地运行

**前置要求：** `Node.js 20+`

1. 安装依赖

```bash
npm install
```

1. 启动开发环境

```bash
npm run dev
```

1. 打开页面

- 前台首页：`http://localhost:3000/`
- 后台编辑：`http://localhost:3000/#/admin`

## 内容维护流程

1. 将图片放入 `public/gallery/`
1. 在后台 `#/admin` 编辑首页信息、作品列表和文章内容
1. 图片路径填写站点路径，例如：`/gallery/Avatar.png`
1. 后台保存后会先写入本地草稿
1. 导出发布文件后，用导出的 JSON 覆盖 `public/content/portfolio-content.json`
1. 将 `public/content/portfolio-content.json` 和新增图库图片一起提交到 Git

## 目录说明

```text
src/
  app/                    应用入口与布局
  features/frontend/      前台页面与组件
  features/admin/         本地后台页面与组件
  features/portfolio/     作品集内容模型与数据提供层
  shared/                 路由、工具函数、通用配置

public/
  content/                正式发布的静态内容 JSON
  gallery/                本地图库
```

## 构建与预览

```bash
npm run build
npm run preview
```

## 部署说明

- 项目已配置 GitHub Pages 工作流：`.github/workflows/deploy.yml`
- 生产环境使用仓库子路径 `'/Designer-Portfolio/'`
- 路由使用 `HashRouter`，避免 GitHub Pages 刷新子路由时出现 `404`

## 发布建议

- 日常编辑在本地 `admin` 完成
- 确认内容无误后导出并覆盖正式 JSON
- 最后执行 `git add`、`git commit`、`git push`
