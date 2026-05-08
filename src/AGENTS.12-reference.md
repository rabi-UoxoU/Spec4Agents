## 12. 参考

本章提供三个快速参考表，供在编写需求、设计和测试策略时快速查阅。

### 12.1 EARS 模式快速参考表

EARS（Easy Approach to Requirements Syntax）的 6 种模式速查：

| 模式名称 | 语法模板 | 简短示例 |
|---------|---------|---------|
| **Ubiquitous**（普遍性） | `THE <system> SHALL <response>` | `THE system SHALL encrypt all data at rest using AES-256` |
| **Event-driven**（事件驱动） | `WHEN <trigger> THEN the <system> SHALL <response>` | `WHEN a user submits valid credentials THEN the system SHALL return a JWT token` |
| **State-driven**（状态驱动） | `WHILE <state> the <system> SHALL <response>` | `WHILE a session is active the system SHALL refresh the token every 15 minutes` |
| **Unwanted event**（非预期事件） | `IF <unwanted condition> THEN the <system> SHALL <response>` | `IF login fails 3 times THEN the system SHALL lock the account for 15 minutes` |
| **Optional feature**（可选功能） | `WHERE <feature is included> the <system> SHALL <response>` | `WHERE email notifications are enabled the system SHALL send alerts for critical errors` |
| **Complex**（复合） | `WHEN <trigger> WHILE <state> the <system> SHALL <response>` | `WHEN a user edits a record WHILE the record is locked THEN the system SHALL deny the modification` |

**选择指南**：

| 场景描述 | 推荐模式 |
|---------|---------|
| 无条件、始终成立的行为 | Ubiquitous |
| 由用户操作或系统事件触发 | Event-driven |
| 在特定状态下持续发生 | State-driven |
| 错误处理、异常响应 | Unwanted event |
| 仅在特定功能启用时生效 | Optional feature |
| 需要多个前提条件 | Complex |

---

### 12.2 INCOSE 质量规则快速参考表

INCOSE 定义的 8 条核心需求质量规则速查：

| 规则名称 | 说明 | 违规示例 |
|---------|------|---------|
| **Necessary**（必要性） | 每条需求必须有明确的业务价值或技术必要性，不应包含不必要的需求 | `THE system SHALL use a blue color scheme for all buttons`（任意设计决策，无业务必要性） |
| **Achievable**（可实现性） | 需求在技术和资源约束下必须是可实现的，不应提出不切实际的要求 | `THE system SHALL respond to all requests within 0 milliseconds`（物理上不可能实现） |
| **Unambiguous**（明确性） | 需求必须只有一种解释方式，避免模糊词语（如"快速"、"高效"） | `THE system SHALL process requests quickly`（"quickly" 无明确标准） |
| **Complete**（完整性） | 需求必须包含所有必要信息，不应遗漏关键细节或留有 TBD | `WHEN a user uploads a file THEN the system SHALL validate the file`（未说明验证什么） |
| **Singular**（单一性） | 每条需求只表达一个单一的条件或行为，不应用 "and/or" 连接多个需求 | `WHEN login succeeds THEN the system SHALL create a session, log the event, and send an email`（包含三个行为） |
| **Verifiable**（可验证性） | 需求必须可以通过测试、检查或演示来验证，避免"最大化"、"最小化"等无法测试的词语 | `THE system SHALL maximize system uptime`（无明确成功标准） |
| **Traceable**（可追溯性） | 需求必须能追溯到来源（业务目标、用户需求、法规），并能链接到设计和测试 | `The system must encrypt data`（无编号、无来源引用） |
| **Feasible**（可行性） | 需求在项目的时间、成本和技术约束下必须是可行的 | `THE system SHALL support 10 billion concurrent users on day one`（超出合理资源范围） |

---

### 12.3 正确性模式快速参考表

属性测试（Property-Based Testing）的 7 种正确性模式速查：

| 模式名称 | 描述 | 适用场景 |
|---------|------|---------|
| **Invariants**（不变量） | 无论输入如何变化，某些属性始终保持不变 | 数据结构的大小约束、业务规则的持续满足（如账户余额不为负） |
| **Round Trip**（往返） | 将操作与其逆操作组合后，结果应回到原始状态（`parse(print(x)) == x`） | 解析器/序列化器（JSON、XML、CSV）、编码/解码、压缩/解压 |
| **Idempotence**（幂等性） | 执行操作两次与执行一次的结果相同（`f(f(x)) == f(x)`） | HTTP PUT/DELETE 请求、数据库 upsert、格式化操作、幂等 API |
| **Metamorphic**（变形） | 以已知方式改变输入后，输出应以可预测的方式变化（无需知道确切输出） | 排序算法（添加元素后结果仍有序）、搜索（更宽松的查询返回更多结果） |
| **Model-Based**（基于模型） | 将优化实现与简单的参考实现进行比较，两者结果应一致 | 性能优化代码（与朴素实现对比）、缓存层（与直接查询对比） |
| **Confluence**（汇合） | 操作的执行顺序不影响最终结果（操作可交换） | 并发操作、事件处理顺序、数据库事务、分布式系统的最终一致性 |
| **Error Conditions**（错误条件） | 无效输入应正确触发错误，而不是静默失败或产生错误结果 | 输入验证、边界值处理、空值/null 处理、类型检查 |

**快速决策指南**：

| 问题 | 如果是 → 考虑的模式 |
|------|-------------------|
| 是否有解析器或序列化器？ | **Round Trip**（必须使用） |
| 操作是否应该幂等？ | **Idempotence** |
| 是否有简单的参考实现可以对比？ | **Model-Based** |
| 是否有始终成立的业务规则？ | **Invariants** |
| 输入变化是否导致可预测的输出变化？ | **Metamorphic** |
| 操作顺序是否不应影响结果？ | **Confluence** |
| 是否需要验证错误处理逻辑？ | **Error Conditions** |
