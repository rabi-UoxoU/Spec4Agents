<a id="top"></a>

## 介绍

<a id="section-1-1"></a>

### 什么是 Spec 工作流

**Spec 工作流**是一种结构化的软件开发方法论，通过三个明确的阶段来组织和管理软件功能的开发：

1. **需求/Bug 分析阶段**：明确要构建什么或要修复什么
2. **设计阶段**：规划如何实现需求或修复
3. **任务阶段**：将设计分解为可执行的离散任务

这种方法论的核心优势在于：

- **清晰性**：每个阶段都有明确的产出物和验收标准
- **可追溯性**：从需求到设计再到任务，形成完整的追溯链
- **协作性**：结构化的文档便于团队成员和 AI 代理理解和协作
- **质量保证**：通过阶段性审查确保每个环节的质量

<a id="section-1-2"></a>

### 目标受众

本文档专为**通用编码代理**（Generic Coding Agents）设计，包括但不限于：

- Claude、GPT-4 等大语言模型驱动的编码助手
- Cursor、GitHub Copilot 等 AI 辅助开发工具
- 其他基于 AI 的代码生成和开发工具

如果你是一个通用编码代理，本文档将指导你：

- 如何组织和管理 spec 文件
- 如何引导用户完成需求、设计和任务阶段
- 如何编写高质量的需求、设计和任务文档
- 如何应用属性测试（Property-Based Testing）等最佳实践

<a id="section-1-3"></a>

### `.agents` 目录：通用代理的工作空间

通用编码代理使用 **`.agents`** 目录来存储所有 spec 相关文件。

#### 目录结构

```
.agents/
└── specs/
    └── {feature-name}/
        ├── .config.agent
        ├── requirements.md
        ├── design.md
        └── tasks.md
```

**关键点**：

- **`.agents` 目录**：通用代理的专用工作空间
- **`specs/` 子目录**：存储所有 spec 项目
- **`{feature-name}/` 目录**：每个功能或 bug 修复的独立目录
  - 使用 **kebab-case** 命名约定（例如：`user-authentication`、`fix-login-bug`）
  - 名称应简洁且描述性强
- **必需文件**：
  - `.config.agent`：spec 配置文件（JSON 格式）
  - `requirements.md`：需求文档
  - `design.md`：设计文档
  - `tasks.md`：任务文档

<a id="section-1-5"></a>

### 文档结构

本文档的组织结构如下：

- **[快速开始](quick-start.md)：快速开始** - 创建第一个 spec 的实践指南
- **[目录结构和配置](directory-structure-and-configuration.md)：目录结构和配置** - 详细的目录规范和配置文件格式
- **[需求阶段](requirements-phase.md)：需求阶段** - EARS 模式、INCOSE 规则和需求文档模板
- **[设计阶段](design-phase.md)：设计阶段** - 设计文档结构、架构图和测试策略
- **[任务阶段](tasks-phase.md)：任务阶段** - 任务格式、跟踪和实现指南
- **[属性测试指南](property-based-testing-guide.md)：属性测试指南** - 正确性模式、PBT 决策和特殊要求
- **[工作流变体](workflow-variants.md)：工作流变体** - Requirements-First、Design-First 和 Bugfix 工作流
- **[阶段转换规则](phase-transition-rules.md)：阶段转换规则** - 停止、审批和反馈整合规则
- **[最佳实践](best-practices.md)：最佳实践** - 需求、设计和任务的编写技巧
- **[常见问题](faq.md)：常见问题** - 常见错误和解决方法
- **[参考](reference.md)：参考** - 快速参考表和完整示例

<a id="section-1-6"></a>

### 如何使用本文档

**对于通用编码代理**：

1. 首先阅读**[快速开始](quick-start.md)（快速开始）**，了解基本工作流
2. 根据用户需求选择合适的工作流变体（[工作流变体](workflow-variants.md)）
3. 在每个阶段参考相应章节（[需求阶段](requirements-phase.md)、[设计阶段](design-phase.md)、[任务阶段](tasks-phase.md)）编写文档
4. 应用属性测试指南（[属性测试指南](property-based-testing-guide.md)）确保代码质量
5. 遵循阶段转换规则（[阶段转换规则](phase-transition-rules.md)）与用户协作

**对于开发者**：

1. 阅读**[快速开始](quick-start.md)（快速开始）**，了解如何与代理协作
2. 在每个阶段审查代理生成的文档
3. 提供反馈和批准，推动工作流前进
4. 参考**[常见问题](faq.md)（常见问题）**解决遇到的问题

---

**准备好了吗？** 让我们从[快速开始](quick-start.md)开始，创建你的第一个 spec！

