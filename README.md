# 拾语 Expression System

一个本地优先的英语表达知识库。GitHub 保存原文、Skill 和处理结果；本地脚本负责分析；`xxd-design.com` 只负责静态展示。

## 使用流程

1. 把文章或对话保存到 `content/inbox/`，支持 `.json`、`.txt`、`.md`。
2. 编辑 `skills/current.md` 调整提取规则。
3. 本地运行：

```sh
python3 scripts/process.py
```

4. 脚本会更新：
- `data/cards.json`
- `data/sources.json`
- `public/knowledge.json`

5. 提交并推送到 GitHub 后，GitHub Pages 会展示最新知识库。

## 目录

- `content/inbox/`：待处理原文。
- `content/processed/`：已处理原文副本。
- `skills/current.md`：当前 Skill / 提取规则。
- `data/`：长期保存的卡片和来源数据。
- `public/knowledge.json`：网页读取的静态数据。
- `scripts/process.py`：本地处理脚本。
- `index.html`、`styles.css`、`app.js`：静态展示网站。

## 当前限制

- 第一版提取逻辑是可解释的本地规则模拟，后续会替换为本地模型按 Skill 分析。
- 网页只展示，不提交内容，不直接写 GitHub。
- 运行中的数据库、日志和备份不提交到仓库。

## 归档

旧作品集已保存到分支：

```text
archive/portfolio-2026-09-09
```
