# Xudong — Cyberpunk V1

当前 GitHub Pages 发布赛博朋克 V1 的静态作品集。

- 站点：https://xxd-design.com/
- 静态源码：`public/instant/index.html`
- 透明肖像：`public/instant/assets/portrait-cutout.png`
- 部署：推送 `main` 自动通过 GitHub Actions 上传静态文件到 GitHub Pages，无需安装依赖或运行 React 构建。
- 首页：拍照、显影、逆向还原与横向浏览；About、四个项目、More。
- 作品：仅 Semi Design System、TikTok Customer Service Platform、SoulNest、CollabAgents；桌面 hover、移动端点击显示照片背面的概要，「查看更多」打开官方获奖页面。
- Semi 与 Customer Service 封面使用用户提供的项目截图，叠放用户提供的 iF 2026 Logo；其余项目使用官方项目图与奖项 Logo。关于我保留独立页面。
- 素材出处见 `public/instant/assets/cover-sources.json`。
- 首页滤镜作用于首屏与首页作品照片，作品 Tab 保持原色。
- 原 React 管理与其他源代码仍保留，供后续开发；本次 Pages 产物仅包含静态作品集。

## 官方作品链接

1. https://ifdesign.com/de/winner-ranking/project/semi-design-system/762908
2. https://ifdesign.com/de/winner-ranking/project/tiktok-customer-service-platform/762897
3. https://www.red-dot.org/project/soulnest-digital-emotional-wellness-companion-84928
4. https://thelondondesignawards.com/cn/winner-info.php?id=7870

## 既有开发说明

# Minimalist Designer Portfolio

一个用于个人作品集展示的前端项目，包含：

- 前台展示页：`Home`、`About Work`、作品详情页
- 本地后台：`/admin`，用于维护首页信息、作品列表和详情内容
- 静态发布内容：通过导出 JSON 和本地图库文件进行最终发布
- Vercel 部署：连接 GitHub 仓库后自动构建并发布

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
- 后台编辑：`http://localhost:3000/admin`

## 内容维护流程

1. 将图片放入 `public/gallery/`
1. 在后台 `/admin` 编辑首页信息、作品列表和文章内容
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

- 项目已适配 Vercel 部署，默认根路径为 `'/'`
- 路由已切换为 `BrowserRouter`
- `vercel.json` 已配置 SPA rewrites，支持刷新 `/work`、`/work/:id`、`/admin`
- Vercel 推荐构建配置：
  - Framework Preset: `Vite`
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

## 发布建议

- 日常编辑在本地 `admin` 完成
- 确认内容无误后导出并覆盖正式 JSON
- 最后执行 `git add`、`git commit`、`git push`


