# Agent Specs

本项目用于将 Kiro 的 Spec 工作流移植到通用 Coding Agent，使通用代理也能使用结构化的需求、设计和任务文档来推进功能开发或 bug 修复。

## 与 Kiro 隔离

通用 Coding Agent 使用 `.agent` 目录存放 spec 文件；Kiro 使用 `.kiro` 目录存放自己的 spec 文件。两个目录彼此独立，互不冲突，也不要求其中一个工具读取或修改另一个工具的工作区。

## 文档结构

根目录 `AGENTS.md` 是生成文件，供 Coding Agent 读取完整的 Spec 工作流指南。

`src/AGENTS.XX-YYYYYY.md` 是源文件，其中：

- `XX` 是两位数字章节编号，用于决定生成顺序。
- `YYYYYY` 是章节标题的 kebab-case 描述。
- 所有章节源文件按文件名排序后拼接为根目录 `AGENTS.md`。

维护时应编辑 `src/` 下的章节源文件，再运行 `make` 更新生成文档。

## 构建

重新生成 `AGENTS.md`：

```bash
make
```

可用命令：

```bash
make        # 从章节源文件生成 AGENTS.md
make all    # 与 make 相同
make clean  # 删除生成的根目录 AGENTS.md
make help   # 查看构建命令和章节命名规则
```

本项目不提供 `make check` 或独立 stale 检测命令。文档 freshness 通过运行 `make` 保证。

## 发布

发布版本使用 SemVer 风格 tag：`vMAJOR.MINOR.PATCH`。

自动发布通过创建并推送匹配 `v*.*.*` 的 tag 触发：

```bash
git tag v1.0.0
git push origin v1.0.0
```

手动发布可在 GitHub Actions 中运行 release workflow，并输入必填的 `release_tag`，例如 `v1.0.0`。

`AGENTS.md` 是 release workflow 现场运行 `make` 构建的 Release asset，不需要提交到仓库。

Release 描述由 GitHub 自动生成，会包含相对上一版本的变更摘要和 Full Changelog 链接。

## 维护章节

添加章节：

1. 在 `src/` 下创建新的 `AGENTS.XX-YYYYYY.md` 文件。
2. 选择未使用的两位数字 `XX`，使其位于期望的阅读顺序。
3. 运行 `make` 重新生成根目录 `AGENTS.md`。

删除章节：

1. 删除对应的 `src/AGENTS.XX-YYYYYY.md` 文件。
2. 运行 `make` 重新生成根目录 `AGENTS.md`。

重排章节：

1. 调整相关源文件名中的两位数字 `XX`。
2. 保持每个章节编号唯一。
3. 运行 `make` 重新生成根目录 `AGENTS.md`。

README 只说明项目目的和文档维护方式；完整 Spec 工作流正文请阅读生成后的 `AGENTS.md`。
