## 11. 常见问题

本章汇总了在使用 Spec 工作流过程中最常遇到的问题，并提供具体的解决方法。

### 11.1 目录冲突问题：`.agent` vs `.kiro`

#### 问题描述

当项目中同时存在通用编码代理和 Kiro 时，开发者可能会担心两者的目录结构发生冲突，或者不确定应该使用哪个目录。

#### 根本原因

`.agent` 和 `.kiro` 是两个完全独立的目录，分别服务于不同的工具：

| 目录 | 使用者 | 配置文件 | 用途 |
|------|--------|---------|------|
| `.agent/` | 通用编码代理（Claude、Cursor 等） | `.config.agent` | 通用代理的 spec 工作空间 |
| `.kiro/` | Kiro | `.config.kiro` | Kiro 的 spec 工作空间 |

#### 解决方法

**规则 1：各用各的目录，互不干涉**

```
项目根目录/
├── .agent/          # 通用代理专用，Kiro 不读取此目录
│   └── specs/
│       └── my-feature/
│           ├── .config.agent
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── .kiro/           # Kiro 专用，通用代理不读取此目录
│   └── specs/
│       └── another-feature/
│           ├── .config.kiro
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
└── src/             # 两者共享的实际代码
```

**规则 2：通用代理只操作 `.agent` 目录**

- 通用编码代理**不应**读取、修改或创建 `.kiro` 目录下的任何文件
- 如果用户要求通用代理操作 `.kiro` 目录，代理应提示用户这不是正确的做法

**规则 3：Kiro 只操作 `.kiro` 目录**

- Kiro **不会**读取或修改 `.agent` 目录
- 两个工具可以在同一项目中**并行工作**，各自管理不同的功能

#### 常见误解

**误解**：两个目录会互相覆盖对方的文件。

**事实**：两个目录路径完全不同（`.agent/` vs `.kiro/`），不存在文件覆盖的可能。

**误解**：同一个功能只能由一个工具管理。

**事实**：不同的功能可以分别由不同的工具管理。例如，通用代理负责 `user-authentication` 功能，Kiro 负责 `payment-processing` 功能，两者完全独立。

---

### 11.2 常见配置错误

#### 错误 1：`.config.agent` JSON 语法错误

**症状**：代理无法读取配置文件，或报告 JSON 解析错误。

**常见原因**：

```json
// ❌ 错误示例 1：使用了注释（JSON 不支持注释）
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first", // 这是注释
  "specType": "feature"
}

// ❌ 错误示例 2：末尾多余的逗号
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first",
  "specType": "feature",
}

// ❌ 错误示例 3：使用单引号而非双引号
{
  'specId': '550e8400-e29b-41d4-a716-446655440000',
  'workflowType': 'requirements-first',
  'specType': 'feature'
}
```

**正确示例**：

```json
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first",
  "specType": "feature"
}
```

**验证方法**：

```bash
# 使用 Python 验证 JSON 格式
python3 -c "import json; json.load(open('.config.agent')); print('JSON 格式正确')"

# 使用 jq 验证（如果已安装）
jq . .config.agent
```

---

#### 错误 2：缺少必需字段

**症状**：代理无法确定工作流类型，或跳过某些阶段。

**常见原因**：

```json
// ❌ 错误示例 1：feature spec 缺少 workflowType
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "specType": "feature"
}

// ❌ 错误示例 2：缺少 specId
{
  "workflowType": "requirements-first",
  "specType": "feature"
}

// ❌ 错误示例 3：缺少 specType
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first"
}
```

**解决方法**：确保所有必需字段都存在：

```json
// ✅ feature spec 的完整配置
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first",
  "specType": "feature"
}

// ✅ bugfix spec 的完整配置（不需要 workflowType）
{
  "specId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "specType": "bugfix"
}
```

**必需字段检查清单**：

| 字段 | feature spec | bugfix spec |
|------|-------------|-------------|
| `specId` | ✅ 必需 | ✅ 必需 |
| `workflowType` | ✅ 必需 | ❌ 不需要 |
| `specType` | ✅ 必需 | ✅ 必需 |

---

#### 错误 3：UUID 格式错误

**症状**：`specId` 不符合 UUID v4 格式，可能导致 spec 无法被正确识别或引用。

**常见原因**：

```json
// ❌ 错误示例 1：使用了自定义 ID 而非 UUID
{
  "specId": "my-feature-001",
  "workflowType": "requirements-first",
  "specType": "feature"
}

// ❌ 错误示例 2：UUID 格式不完整
{
  "specId": "550e8400-e29b-41d4",
  "workflowType": "requirements-first",
  "specType": "feature"
}
```

**UUID v4 正确格式**：`xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`（32 个十六进制字符，用连字符分为 5 组）

**生成正确 UUID 的方法**：

```bash
# Linux/WSL2
uuidgen

# Python
python3 -c "import uuid; print(uuid.uuid4())"

# Node.js
node -e "console.log(require('crypto').randomUUID())"
```

---

#### 错误 4：`workflowType` 或 `specType` 字段值错误

**症状**：代理使用了错误的工作流，或无法识别 spec 类型。

**常见原因**：

```json
// ❌ 错误示例：workflowType 值拼写错误
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "design-driven",   // ❌ 应为 "design-first"
  "specType": "feature"
}

// ❌ 错误示例：specType 值错误
{
  "specId": "550e8400-e29b-41d4-a716-446655440000",
  "workflowType": "requirements-first",
  "specType": "bug-fix"              // ❌ 应为 "bugfix"
}
```

**合法字段值速查**：

| 字段 | 合法值 |
|------|--------|
| `workflowType` | `"requirements-first"` 或 `"design-first"` |
| `specType` | `"feature"` 或 `"bugfix"` |

---

### 11.3 常见工作流问题

#### 问题 1：跳过阶段审批直接实现

**症状**：代理在用户未审批需求或设计文档的情况下，直接开始编写代码或生成任务列表。

**根本原因**：代理没有遵守阶段转换规则，或用户误以为可以跳过审批步骤。

**正确行为**：

```
需求阶段完成
    ↓
代理停止并输出：
"需求文档已完成，请审阅后告知是否继续进入设计阶段。
如需修改，请提供反馈。"
    ↓
等待用户明确批准
    ↓
设计阶段开始
```

**解决方法**：

1. **对于代理**：在完成每个阶段文档后，必须明确停止并等待用户回复，不得自动进入下一阶段
2. **对于用户**：如果希望跳过审批直接进入任务阶段，可以明确回复 `"Skip to Implementation Plan"`
3. **唯一例外**：用户明确说 `"Skip to Implementation Plan"` 时，代理可以从设计阶段直接进入任务阶段

---

#### 问题 2：需求和设计不一致

**症状**：设计文档中描述的组件或行为与需求文档中的验收标准不匹配，导致实现任务无法追溯到具体需求。

**常见原因**：
- 设计阶段引入了需求中未提及的功能
- 需求更新后设计文档未同步更新
- 设计文档中的技术约束与需求中的业务约束相矛盾

**解决方法**：

1. **设计文档必须引用需求**：每个设计决策都应能追溯到至少一条需求

   ```markdown
   ## 组件设计

   ### AuthenticationService
   
   负责处理用户认证逻辑。
   
   _对应需求: 1.1（用户登录）, 1.2（会话管理）_
   ```

2. **发现不一致时返回需求阶段**：如果在设计阶段发现需求有缺口或矛盾，代理应提示用户并提供返回需求阶段的选项：

   ```
   "在设计过程中发现需求 1.3 中未明确说明密码重置的超时时间。
   建议选项：
   A. 返回需求阶段补充该细节
   B. 在设计文档中做出假设并继续（需要用户确认假设）"
   ```

3. **任务必须引用需求**：`tasks.md` 中每个任务都应通过 `_需求: X.Y_` 格式引用对应的需求

---

#### 问题 3：任务依赖关系错误

**症状**：实现任务时发现某个任务依赖的前置任务尚未完成，或任务顺序导致代码无法编译/运行。

**常见原因**：
- 任务分解时未考虑代码依赖关系（例如先实现调用方，再实现被调用方）
- 数据库 schema 任务排在数据访问层任务之后
- 接口定义任务排在实现任务之后

**解决方法**：

1. **遵循依赖顺序**：任务应按照"基础设施 → 数据层 → 业务逻辑层 → API 层 → UI 层"的顺序排列

   ```markdown
   - [ ] 1. 数据库 schema 和迁移          ← 最先执行
   - [ ] 2. 数据访问层（Repository）       ← 依赖任务 1
   - [ ] 3. 业务逻辑层（Service）          ← 依赖任务 2
   - [ ] 4. API 控制器（Controller）       ← 依赖任务 3
   - [ ] 5. 前端组件                       ← 依赖任务 4
   ```

2. **在任务中明确标注依赖**：使用 `tasks.md` 中的依赖图 JSON 格式记录任务间的依赖关系

   ```json
   {
     "waves": [
       { "id": 0, "tasks": ["1"] },
       { "id": 1, "tasks": ["2"] },
       { "id": 2, "tasks": ["3"] },
       { "id": 3, "tasks": ["4", "5"] }
     ]
   }
   ```

3. **发现依赖错误时的处理**：如果在实现过程中发现任务顺序有误，应暂停当前任务，更新 `tasks.md` 中的任务顺序，然后继续

---

#### 问题 4：Bugfix 工作流中混淆"当前行为"和"预期行为"

**症状**：`bugfix.md` 中对 bug 的描述不清晰，导致修复方向错误，或修复后引入新的问题。

**解决方法**：严格按照 bug condition 方法论的三要素来描述 bug：

```markdown
## Bug 分析

### 当前行为（Current Behavior）
描述 bug 实际发生时系统的表现：
- 具体的输入条件
- 实际观察到的输出或行为
- 错误消息（如有）

### 预期行为（Expected Behavior）
描述系统应该如何正确运行：
- 相同输入条件下的正确输出
- 符合业务逻辑的行为

### 不变行为（Invariant Behavior）
描述修复过程中不应改变的行为：
- 其他功能不应受到影响
- 现有测试不应失败
- 性能不应显著下降
```

**示例**：

```markdown
### 当前行为
WHEN 用户在密码重置表单中输入有效邮箱地址
THEN 系统返回 500 Internal Server Error
AND 用户收不到重置邮件

### 预期行为
WHEN 用户在密码重置表单中输入有效邮箱地址
THEN 系统发送包含重置链接的邮件到该地址
AND 系统显示"重置邮件已发送"的确认消息

### 不变行为
- 用户登录功能不受影响
- 已登录用户的会话不受影响
- 密码重置链接的有效期（24小时）不变
```

---

