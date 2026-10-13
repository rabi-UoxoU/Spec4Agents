---
name: spec4agents
description: 创建或完善 Spec 的需求、设计和任务文档，执行有阶段审批的三阶段开发工作流，以及分析和修复 Bug 的 Bugfix 工作流。
---

# Spec 工作流

在项目的 `.agents/specs/{feature-name}/` 管理规格，名称用 kebab-case。这个项目工作目录与 Skill 安装目录及打包格式无关。

每个 Spec 包含 `.config.agent`、`design.md`、`tasks.md`，以及 Feature 的 `requirements.md` 或 Bugfix 的 `bugfix.md`。配置仅包含 UUID v4 `specId`、`specType`，Feature 还包含 `workflowType`；不要给 Bugfix 增加 `workflowType`。

先确定文档语言：用户明确指定的语言优先，否则沿用已有 Spec 的语言；新建且未指定时使用当前对话主要语言。验收标准保留英文 EARS 关键词 `WHEN`、`THEN`、`WHILE`、`IF`、`WHERE`、`THE`、`SHALL`，其余自然语言使用 Spec 语言。文件名、API、字段名等技术标识符保持原样。不能因为结构关键词是英文就把整条验收标准写成英文。

## 选择并执行阶段

- Requirements-First：需求 → 设计 → 任务。需求包括术语表、用户故事及可验证的 EARS 验收标准。
- Design-First：设计 → 需求 → 任务。适用于技术方案先行，从设计推导需求。
- Bugfix：Bug 分析 → 设计 → 任务。分析当前行为、预期行为、不变行为，并据此限定修复范围。

完成阶段后展示具体产物，停止并等待用户审批；整合全部反馈后才推进。用户已有明确批准继续时无需重复询问。需求阶段后用户回复 “Skip to Implementation Plan” 时，连续完成设计和任务文档，省略设计后的等待；任务文档后仍停止，等待用户指示开始实现。设计审批时收到同一指令可直接进入任务阶段；始终保留设计文档。详情见[阶段转换规则](references/phase-transition-rules.md)。任务阶段分解实现单元、依赖和需求追溯，再按用户授权执行。后续发现需求或设计缺口时提供返回前阶段的选项。

## 按任务加载参考

无需一次读取全部文档：

| 当前工作 | 参考 |
|---|---|
| 初次使用、创建 Spec | [介绍](references/introduction.md)、[快速开始](references/quick-start.md) |
| 路径、配置 | [目录结构与配置](references/directory-structure-and-configuration.md) |
| 编写需求 | [需求阶段：EARS 与 INCOSE](references/requirements-phase.md) |
| 架构与接口、正确性属性 | [设计阶段](references/design-phase.md) |
| 分解和跟踪实现 | [任务阶段](references/tasks-phase.md) |
| 测试决策 | [属性测试指南](references/property-based-testing-guide.md) |
| 选择工作流、Bugfix | [工作流变体](references/workflow-variants.md) |
| 审批与反馈 | [阶段转换规则](references/phase-transition-rules.md) |
| 质量和排错 | [最佳实践](references/best-practices.md)、[常见问题](references/faq.md) |
| 模式速查、语言与完整模板 | [参考](references/reference.md) |

## 初始化骨架

脚本只创建文件骨架，不替代需求分析或批准阶段。需要 Node.js 24，运行不需要 npm 安装。默认模板为中文；非中文 Spec 先按[模板说明](assets/templates/README.md)在项目外准备适配的模板目录，通过 `--template-dir` 传入。

```bash
node /path/to/spec4agents/scripts/init-spec.mjs user-authentication \
  --spec-type feature --workflow-type requirements-first --project-dir /path/to/project
node /path/to/spec4agents/scripts/init-spec.mjs cache-redesign \
  --spec-type feature --workflow-type design-first --project-dir /path/to/project
node /path/to/spec4agents/scripts/init-spec.mjs fix-login-timeout \
  --spec-type bugfix --project-dir /path/to/project
```

未指定 `--project-dir` 时使用当前工作目录，不向上搜索。已有 Spec 必须报错，不覆盖、不自动改名。当前阶段使用完整模板，其余阶段只写标题与等待审批说明。完整模板由共享参考章节提取；配置模板和 `pending/` 提供配置结构和未进入阶段的占位。
