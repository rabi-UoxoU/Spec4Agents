# Spec4Agents

本项目是Kiro风格的规格驱动开发工作流的通用移植，使其他Coding Agent也能基于需求→设计→任务三步骤来进行功能开发或bug修复。

本项目使用通用的`.agents`目录存放spec文件，和`.kiro`目录相互独立。

## 项目结构

因开发需要，文档的章节源代码位于`src/`目录，文件名格式为`AGENTS.XX-YYYYYY.md`。

* `XX`是两位章节编号，影响章节拼接的顺序。
* `YYYYYY`是章节标题，为确保兼容性使用英文。

## 构建方法

在项目根目录执行`make`可以生成`AGENTS.md`。

详细解说可以参见[博客文章](https://rabi.fm/archives/oss-spec4agents/)。
