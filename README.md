# Spec4Agents

本项目是通用的规格驱动开发工作流，使Coding Agent能基于需求→设计→任务三步骤来进行功能开发或bug修复。每个阶段形成可审阅文档，按用户批准推进。

关于项目背景和工作流的详细解说，可以参见[博客文章](https://rabi.fm/archives/oss-spec4agents/)。当前安装和构建方式以本文为准。

## 快速开始

同一版本提供 `AGENTS.md` 和 `spec4agents` Skill 两种分发形式，内容由同一份章节源码生成，可按所用代理的支持情况选择。

### 使用AGENTS.md

使用wget从Release下载最新构建版本的AGENTS.md，将其放置在开发项目根目录，然后启动Coding Agent，描述需求时提及“创建spec”即可。

```bash
wget https://github.com/rabi-UoxoU/Spec4Agents/releases/latest/download/AGENTS.md
```

### 使用Agent Skill

将以下Skill压缩包网址提供给所使用的Agent，让其自行安装。安装后，描述需求时提及“创建spec”即可。

```text
https://github.com/rabi-UoxoU/Spec4Agents/releases/latest/download/SKILL.spec4agents.tgz
```


## 项目结构

```text
src/
  chapters.json                 # 文档标题、章节清单与顺序
  introduction.md               # 描述性的 kebab-case 文件名
  requirements-phase.md
  ...
skill/
  SKILL.md                      # Skill 入口
  assets/templates/             # 配置与阶段占位模板
  scripts/init-spec.mjs          # Spec 初始化脚本
scripts/                        # 构建、校验和发布工具
tests/                          # 自动化测试
Makefile                        # 构建入口
dist/                           # 生成的文档和 Skill 产物
```

## 构建方法

在项目根目录执行`make`可以生成`dist/markdown/AGENTS.md`，并同时生成 Skill 目录和压缩包。
