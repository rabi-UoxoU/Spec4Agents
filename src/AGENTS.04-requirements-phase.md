## 4. 需求阶段

### 4.1 EARS 模式（Easy Approach to Requirements Syntax）

EARS（Easy Approach to Requirements Syntax）是一种结构化的需求编写方法，通过使用标准化的语法模板来提高需求的清晰性和一致性。EARS 定义了 6 种基本模式，每种模式适用于不同类型的系统行为。

#### 4.1.1 Ubiquitous（普遍性需求）

**定义**：描述系统在所有情况下都必须满足的行为，没有任何前提条件或触发事件。

**语法模板**：
```
THE <system name> SHALL <system response>
```

**适用场景**：
- 系统的基本功能和持续性行为
- 不依赖于特定条件或事件的需求
- 系统的基本约束和限制

**示例**：

1. **用户界面需求**：
   ```
   THE system SHALL display all timestamps in UTC format
   ```

2. **性能需求**：
   ```
   THE API SHALL respond to health check requests within 100 milliseconds
   ```

3. **安全需求**：
   ```
   THE system SHALL encrypt all data at rest using AES-256 encryption
   ```

4. **数据完整性需求**：
   ```
   THE database SHALL maintain referential integrity for all foreign key relationships
   ```

#### 4.1.2 Event-driven（事件驱动需求）

**定义**：描述当特定事件或触发条件发生时，系统必须执行的响应行为。

**语法模板**：
```
WHEN <trigger event> THEN the <system name> SHALL <system response>
```

**适用场景**：
- 用户操作触发的行为
- 系统事件触发的响应
- 外部信号或消息触发的处理

**示例**：

1. **用户登录**：
   ```
   WHEN a user submits valid credentials THEN the system SHALL generate a JWT token and return it to the user
   ```

2. **文件上传**：
   ```
   WHEN a user uploads a file larger than 10MB THEN the system SHALL reject the upload and display an error message
   ```

3. **支付处理**：
   ```
   WHEN a payment transaction is completed THEN the system SHALL send a confirmation email to the user
   ```

4. **数据同步**：
   ```
   WHEN a database record is updated THEN the system SHALL publish a change event to the message queue
   ```

#### 4.1.3 State-driven（状态驱动需求）

**定义**：描述系统在特定状态下必须持续满足的行为，强调状态的持续性。

**语法模板**：
```
WHILE <system state> the <system name> SHALL <system response>
```

**适用场景**：
- 系统在特定模式或状态下的行为
- 持续性的监控和控制
- 状态相关的约束和限制

**示例**：

1. **用户会话管理**：
   ```
   WHILE a user session is active the system SHALL refresh the authentication token every 15 minutes
   ```

2. **维护模式**：
   ```
   WHILE the system is in maintenance mode the system SHALL return HTTP 503 status for all API requests
   ```

3. **数据处理**：
   ```
   WHILE a batch job is running the system SHALL prevent concurrent execution of the same job
   ```

4. **资源限制**：
   ```
   WHILE the database connection pool is at capacity the system SHALL queue new connection requests
   ```

#### 4.1.4 Unwanted event（不期望事件需求）

**定义**：描述当不期望的条件或错误发生时，系统必须采取的保护性或恢复性措施。

**语法模板**：
```
IF <unwanted condition or event> THEN the <system name> SHALL <system response>
```

**适用场景**：
- 错误处理和异常情况
- 安全威胁的响应
- 系统故障的恢复
- 输入验证失败的处理

**示例**：

1. **认证失败**：
   ```
   IF a user enters incorrect credentials three times consecutively THEN the system SHALL lock the account for 15 minutes
   ```

2. **数据验证错误**：
   ```
   IF an API request contains invalid JSON THEN the system SHALL return HTTP 400 status with a detailed error message
   ```

3. **系统资源耗尽**：
   ```
   IF available memory falls below 10% THEN the system SHALL trigger garbage collection and log a warning
   ```

4. **网络连接失败**：
   ```
   IF a database connection fails THEN the system SHALL retry up to 3 times with exponential backoff before returning an error
   ```

#### 4.1.5 Optional feature（可选特性需求）

**定义**：描述仅在特定功能或配置启用时才需要满足的行为。

**语法模板**：
```
WHERE <feature is included or configuration is set> the <system name> SHALL <system response>
```

**适用场景**：
- 可配置的功能模块
- 可选的集成和插件
- 基于许可证或订阅级别的功能
- 环境特定的行为

**示例**：

1. **功能开关**：
   ```
   WHERE the advanced analytics feature is enabled the system SHALL collect detailed user interaction metrics
   ```

2. **集成配置**：
   ```
   WHERE the email notification service is configured the system SHALL send email alerts for critical errors
   ```

3. **订阅级别**：
   ```
   WHERE the user has a premium subscription the system SHALL allow up to 100 API requests per minute
   ```

4. **环境配置**：
   ```
   WHERE the system is running in production mode the system SHALL disable debug logging
   ```

#### 4.1.6 Complex（复杂需求）

**定义**：结合多个条件（事件和状态）来描述更复杂的系统行为，通常组合 Event-driven 和 State-driven 模式。

**语法模板**：
```
WHEN <trigger event> WHILE <system state> the <system name> SHALL <system response>
```

或其他组合形式：
```
WHEN <trigger event> IF <condition> THEN the <system name> SHALL <system response>
```

```
WHILE <system state> IF <unwanted condition> THEN the <system name> SHALL <system response>
```

**适用场景**：
- 需要多个前提条件的复杂业务逻辑
- 状态和事件共同决定的行为
- 复杂的工作流和流程控制

**示例**：

1. **事件 + 状态组合**：
   ```
   WHEN a user attempts to modify a record WHILE the record is locked by another user THEN the system SHALL deny the modification and display a lock notification
   ```

2. **事件 + 条件组合**：
   ```
   WHEN a user submits an order IF the order total exceeds $10,000 THEN the system SHALL require manager approval before processing
   ```

3. **状态 + 不期望事件组合**：
   ```
   WHILE a file upload is in progress IF the network connection is lost THEN the system SHALL pause the upload and resume when connection is restored
   ```

4. **多条件复杂需求**：
   ```
   WHEN a user requests data export WHILE the system load is above 80% IF the export size exceeds 1GB THEN the system SHALL queue the request for off-peak processing
   ```

### 4.2 EARS 模式选择指南

选择合适的 EARS 模式对于编写清晰、准确的需求至关重要。以下是选择指南：

| 问题 | 推荐模式 |
|------|---------|
| 这个行为是否总是成立，没有任何前提条件？ | Ubiquitous |
| 这个行为是由特定事件触发的吗？ | Event-driven |
| 这个行为在特定状态下持续发生吗？ | State-driven |
| 这是对错误或异常情况的响应吗？ | Unwanted event |
| 这个行为仅在特定功能启用时才需要吗？ | Optional feature |
| 这个行为需要多个条件（事件+状态，或事件+条件）吗？ | Complex |

### 4.3 EARS 模式最佳实践

1. **优先使用简单模式**：如果可以用简单模式（Ubiquitous、Event-driven、State-driven）表达，避免使用 Complex 模式

2. **保持原子性**：每个需求应该描述一个单一的系统行为，如果需求过于复杂，考虑拆分为多个需求

3. **明确触发条件**：在 Event-driven 和 Complex 模式中，确保触发事件清晰、可观察、可测试

4. **区分状态和事件**：
   - **状态**是持续的条件（例如："用户已登录"、"系统处于维护模式"）
   - **事件**是瞬时的发生（例如："用户点击按钮"、"收到 API 请求"）

5. **使用一致的术语**：在所有需求中使用术语表中定义的标准术语

6. **避免实现细节**：EARS 需求应该描述"做什么"（what），而不是"怎么做"（how）

**不好的示例**（包含实现细节）：
```
WHEN a user logs in THEN the system SHALL call the AuthService.authenticate() method and store the token in Redis
```

**好的示例**（聚焦于行为）：
```
WHEN a user logs in with valid credentials THEN the system SHALL create an authenticated session and return an access token
```

### 4.4 INCOSE 质量规则

INCOSE（International Council on Systems Engineering，国际系统工程协会）定义了一套需求质量规则,用于确保需求具备成功系统开发所需的特征。这些规则帮助识别和消除需求中的常见问题,提高需求文档的整体质量。

#### 4.4.1 核心质量特征

INCOSE 定义了 15 个需求质量特征,其中以下 8 个是最关键的:

1. **Unambiguous**（明确的）
2. **Verifiable**（可验证的）
3. **Traceable**（可追溯的）
4. **Singular**（单一的）
5. **Necessary**（必要的）
6. **Complete**（完整的）
7. **Consistent**（一致的）
8. **Feasible**（可行的）

#### 4.4.2 规则 1：Unambiguous（明确性）

**定义**：需求必须只有一种解释方式,不能有歧义或多种理解。

**说明**：
- 避免使用模糊的词语（如"快速"、"高效"、"用户友好"）
- 使用精确的量化指标
- 避免使用可能有多种解释的术语
- 使用术语表中定义的标准术语

**违规示例**：
```
❌ THE system SHALL process requests quickly
```
**问题**："quickly"（快速）是模糊的,没有明确的标准。

**正确示例**：
```
✅ THE system SHALL process API requests within 200 milliseconds for 95% of requests
```
**改进**：使用具体的时间指标和百分比,消除歧义。

---

**违规示例**：
```
❌ THE system SHALL provide a good user experience
```
**问题**："good user experience"（良好的用户体验）是主观的,无法量化。

**正确示例**：
```
✅ THE system SHALL display search results within 2 seconds of user query submission
✅ THE system SHALL maintain a System Usability Scale (SUS) score above 80
```
**改进**：使用可测量的指标替代主观描述。

#### 4.4.3 规则 2：Verifiable（可验证性）

**定义**：需求必须可以通过测试、检查、分析或演示来验证是否满足。

**说明**：
- 每个需求都应该有明确的验证方法
- 避免使用无法测试的词语（如"最大化"、"最小化"、"优化"）
- 确保验证标准是客观的、可重复的
- 考虑验证的成本和可行性

**违规示例**：
```
❌ THE system SHALL maximize system uptime
```
**问题**："maximize"（最大化）没有明确的成功标准,无法验证何时达到要求。

**正确示例**：
```
✅ THE system SHALL maintain 99.9% uptime measured over each calendar month
```
**改进**：提供具体的可测量目标和测量方法。

---

**违规示例**：
```
❌ THE system SHALL be easy to maintain
```
**问题**："easy to maintain"（易于维护）是主观的,无法客观验证。

**正确示例**：
```
✅ THE system SHALL allow configuration changes without requiring code recompilation
✅ THE system SHALL provide automated deployment scripts that complete in under 10 minutes
```
**改进**：将抽象概念转化为具体的、可验证的行为。

#### 4.4.4 规则 3：Traceable（可追溯性）

**定义**：需求必须能够追溯到其来源（业务目标、用户需求、法规等）,并能够追踪到设计、实现和测试。

**说明**：
- 每个需求应该有唯一的标识符
- 需求应该引用其来源或依据
- 需求应该能够链接到相关的设计元素和测试用例
- 维护需求追溯矩阵

**违规示例**：
```
❌ The system must encrypt data
```
**问题**：没有标识符,没有说明为什么需要加密,无法追溯来源。

**正确示例**：
```
✅ **需求 1.3：数据加密**（来源：GDPR 第 32 条、安全策略 SP-2023-001）

THE system SHALL encrypt all personally identifiable information (PII) at rest using AES-256 encryption

_追溯：业务需求 BR-1.2, 安全标准 SEC-001_
```
**改进**：包含需求编号、来源引用和追溯信息。

---

**违规示例**：
```
❌ Users should be able to export data
```
**问题**：没有编号,没有上下文,无法追溯到业务需求或用户故事。

**正确示例**：
```
✅ **需求 2.5：数据导出**（来源：用户故事 US-12）

WHEN a user requests data export THEN the system SHALL generate a CSV file containing all user data within 30 seconds

_追溯：用户故事 US-12, 设计文档 DD-2.3, 测试用例 TC-25_
```
**改进**：明确的编号、来源和追溯链接。

#### 4.4.5 规则 4：Singular（单一性）

**定义**：每个需求应该只表达一个单一的条件或行为,不应该包含多个需求。

**说明**：
- 避免使用"and"、"or"连接多个不同的需求
- 每个需求应该独立可测试
- 如果需求包含多个条件,考虑拆分为多个需求
- 使用 EARS 模式保持需求的原子性

**违规示例**：
```
❌ WHEN a user logs in THEN the system SHALL authenticate the user, create a session, log the event, and send a notification email
```
**问题**：包含四个不同的行为,应该拆分为独立的需求。

**正确示例**：
```
✅ **需求 1.1：用户认证**
WHEN a user submits login credentials THEN the system SHALL validate the credentials against the user database

✅ **需求 1.2：会话创建**
WHEN user authentication succeeds THEN the system SHALL create a new session with a 30-minute timeout

✅ **需求 1.3：登录日志**
WHEN a user successfully logs in THEN the system SHALL log the event with timestamp and user ID

✅ **需求 1.4：登录通知**
WHEN a user successfully logs in from a new device THEN the system SHALL send a notification email to the user's registered email address
```
**改进**：将复合需求拆分为四个独立的、可单独测试的需求。

---

**违规示例**：
```
❌ THE system SHALL support CSV and JSON export formats and allow users to schedule exports
```
**问题**：包含两个不同的功能（格式支持和调度功能）。

**正确示例**：
```
✅ **需求 2.1：导出格式支持**
THE system SHALL support data export in CSV and JSON formats

✅ **需求 2.2：导出调度**
THE system SHALL allow users to schedule automated data exports on daily, weekly, or monthly intervals
```
**改进**：拆分为两个独立的需求,每个关注一个功能。

#### 4.4.6 规则 5：Necessary（必要性）

**定义**：每个需求都必须有明确的业务价值或技术必要性,不应包含不必要的需求。

**说明**：
- 每个需求应该能够追溯到业务目标或用户需求
- 避免"镀金"（添加不必要的功能）
- 质疑每个需求的存在理由
- 如果无法解释需求的必要性,考虑删除它

**违规示例**：
```
❌ THE system SHALL display a loading animation with a spinning logo
```
**问题**：过于具体的实现细节,可能不是真正必要的需求。

**正确示例**：
```
✅ THE system SHALL provide visual feedback to users during operations that take longer than 1 second to complete
```
**改进**：关注真正的需求（用户反馈）,而不是具体的实现方式。

---

**违规示例**：
```
❌ THE system SHALL use a blue color scheme for all buttons
```
**问题**：这是设计决策,不是功能需求,除非有特定的业务或可访问性理由。

**正确示例**：
```
✅ THE system SHALL maintain a minimum contrast ratio of 4.5:1 between text and background colors to meet WCAG 2.1 Level AA standards
```
**改进**：关注必要的可访问性需求,而不是任意的设计选择。

#### 4.4.7 规则 6：Complete（完整性）

**定义**：需求必须包含所有必要的信息,不应遗漏关键细节。

**说明**：
- 需求应该回答"谁"、"什么"、"何时"、"在什么条件下"
- 包含所有必要的前提条件和后置条件
- 定义所有相关的边界条件和限制
- 不应该有待定（TBD）或待确定（TBC）的内容

**违规示例**：
```
❌ WHEN a user uploads a file THEN the system SHALL validate the file
```
**问题**：没有说明验证什么（文件类型？大小？内容？）,验证失败时怎么办。

**正确示例**：
```
✅ WHEN a user uploads a file THEN the system SHALL validate that:
   - The file size does not exceed 10MB
   - The file format is one of: PDF, DOCX, TXT, or CSV
   - The file name contains only alphanumeric characters, hyphens, and underscores

IF validation fails THEN the system SHALL reject the upload and display an error message indicating the specific validation failure
```
**改进**：明确所有验证标准和失败处理。

---

**违规示例**：
```
❌ THE system SHALL send notifications to users
```
**问题**：缺少关键信息：什么时候发送？通过什么渠道？什么内容？

**正确示例**：
```
✅ WHEN a user's account balance falls below $10 THEN the system SHALL send an email notification to the user's registered email address within 5 minutes, containing the current balance and a link to add funds
```
**改进**：包含触发条件、通知渠道、时间要求和内容要求。

#### 4.4.8 规则 7：Consistent（一致性）

**定义**：需求不应与其他需求或已知约束相冲突。

**说明**：
- 需求之间不应有逻辑矛盾
- 使用一致的术语和定义
- 确保需求与系统约束和外部标准一致
- 定期审查需求集以识别冲突

**违规示例**：
```
❌ 需求 1.1: THE system SHALL store all user data in the cloud
❌ 需求 1.2: THE system SHALL operate without internet connectivity
```
**问题**：两个需求相互矛盾,无法同时满足。

**正确示例**：
```
✅ 需求 1.1: THE system SHALL synchronize user data to cloud storage when internet connectivity is available
✅ 需求 1.2: THE system SHALL cache user data locally and operate in offline mode when internet connectivity is unavailable
```
**改进**：解决冲突,明确在线和离线模式的行为。

---

**违规示例**：
```
❌ 需求 2.1: THE system SHALL complete user authentication within 500 milliseconds
❌ 需求 2.2: THE system SHALL perform multi-factor authentication including SMS verification for all login attempts
```
**问题**：SMS 验证通常需要几秒钟,与 500 毫秒的要求不一致。

**正确示例**：
```
✅ 需求 2.1: THE system SHALL complete initial credential validation within 500 milliseconds
✅ 需求 2.2: WHEN multi-factor authentication is enabled THEN the system SHALL send an SMS verification code within 10 seconds and allow up to 5 minutes for user verification
```
**改进**：区分不同的认证阶段,设置合理的时间要求。

#### 4.4.9 规则 8：Feasible（可行性）

**定义**：需求必须在给定的技术、时间和资源约束下可以实现。

**说明**：
- 考虑技术限制和物理定律
- 评估实现成本和时间
- 确保需求不违反已知的技术约束
- 与技术团队验证可行性

**违规示例**：
```
❌ THE system SHALL predict user behavior with 100% accuracy
```
**问题**：100% 准确的预测在实践中是不可能的,违反了统计学和机器学习的基本原理。

**正确示例**：
```
✅ THE system SHALL predict user purchase intent with a minimum accuracy of 75% as measured against historical conversion data
```
**改进**：设置现实可达的目标,基于行业标准和历史数据。

---

**违规示例**：
```
❌ THE system SHALL process 1 million transactions per second on a single server
```
**问题**：对于大多数硬件配置,这个性能目标是不现实的。

**正确示例**：
```
✅ THE system SHALL process at least 10,000 transactions per second using a horizontally scalable architecture with load balancing across multiple servers
```
**改进**：设置可行的性能目标,并说明实现方式（水平扩展）。

### 4.5 INCOSE 质量规则应用指南

#### 4.5.1 需求审查检查清单

在编写或审查需求时,使用以下检查清单确保符合 INCOSE 质量规则：

**明确性检查**：
- [ ] 需求中是否有模糊的词语（快速、高效、用户友好等）？
- [ ] 所有量化指标是否明确？
- [ ] 术语是否在术语表中定义？

**可验证性检查**：
- [ ] 如何验证这个需求？（测试、检查、分析、演示）
- [ ] 验证标准是否客观且可重复？
- [ ] 是否避免了"最大化"、"最小化"等无法验证的词语？

**可追溯性检查**：
- [ ] 需求是否有唯一标识符？
- [ ] 需求是否引用了来源（用户故事、业务目标、法规）？
- [ ] 需求是否链接到相关的设计和测试？

**单一性检查**：
- [ ] 需求是否只表达一个条件或行为？
- [ ] 是否可以拆分为更小的独立需求？
- [ ] 需求是否可以独立测试？

**必要性检查**：
- [ ] 为什么需要这个需求？
- [ ] 需求是否追溯到业务目标或用户需求？
- [ ] 如果删除这个需求,会有什么影响？

**完整性检查**：
- [ ] 需求是否包含所有必要的信息？
- [ ] 是否定义了所有前提条件和后置条件？
- [ ] 是否有待定（TBD）的内容？

**一致性检查**：
- [ ] 需求是否与其他需求冲突？
- [ ] 术语使用是否一致？
- [ ] 需求是否与系统约束一致？

**可行性检查**：
- [ ] 需求在技术上可行吗？
- [ ] 需求在预算和时间约束内可实现吗？
- [ ] 是否与技术团队验证过可行性？

#### 4.5.2 常见质量问题和解决方法

| 问题类型 | 识别方法 | 解决方法 |
|---------|---------|---------|
| 模糊需求 | 包含"快速"、"高效"等词 | 用具体的量化指标替换 |
| 复合需求 | 包含多个"and"或"or" | 拆分为多个独立需求 |
| 不可验证 | 无法定义测试方法 | 添加可测量的验收标准 |
| 实现细节 | 指定具体技术或方法 | 重写为功能需求 |
| 缺少上下文 | 没有前提条件或触发事件 | 使用 EARS 模式添加上下文 |
| 不一致术语 | 同一概念使用不同词语 | 使用术语表标准化术语 |
| 过度约束 | 限制了实现选择 | 关注"做什么"而非"怎么做" |
| 缺少错误处理 | 只描述正常流程 | 添加异常和错误情况的需求 |

#### 4.5.3 质量改进示例

**原始需求**（存在多个质量问题）：
```
❌ The system should quickly process user requests and handle errors appropriately
```

**问题分析**：
- ❌ 不明确："quickly"（快速）是模糊的
- ❌ 不可验证：没有具体的性能指标
- ❌ 不单一：包含两个不同的需求（处理请求和错误处理）
- ❌ 不完整：没有说明什么类型的请求,什么类型的错误
- ❌ 使用"should"而非"SHALL"

**改进后的需求**：
```
✅ **需求 3.1：请求处理性能**
THE system SHALL process user API requests with a median response time of 200 milliseconds and 95th percentile response time of 500 milliseconds

✅ **需求 3.2：请求超时处理**
IF an API request processing exceeds 30 seconds THEN the system SHALL terminate the request and return HTTP 504 Gateway Timeout status

✅ **需求 3.3：错误响应格式**
WHEN an error occurs during request processing THEN the system SHALL return a JSON response containing an error code, error message, and request ID
```

**改进说明**：
- ✅ 明确：使用具体的时间指标（200ms、500ms、30s）
- ✅ 可验证：可以通过性能测试验证
- ✅ 单一：拆分为三个独立的需求
- ✅ 完整：明确了请求类型、超时值和错误响应格式
- ✅ 使用"SHALL"表示强制性需求

### 4.6 EARS 模式与 INCOSE 质量规则的结合

EARS 模式和 INCOSE 质量规则是互补的：

- **EARS 模式**提供了需求的**结构和语法**
- **INCOSE 质量规则**确保需求的**质量和特征**

**最佳实践**：

1. **先使用 EARS 模式**构建需求的基本结构
2. **然后应用 INCOSE 质量规则**检查和改进需求质量
3. **迭代优化**直到需求同时满足结构和质量要求

**示例工作流**：

```
步骤 1：使用 EARS 模式编写初始需求
WHEN a user uploads a file THEN the system SHALL process the file

步骤 2：应用 INCOSE 质量规则检查
- 明确性：❌ "process"（处理）是模糊的
- 完整性：❌ 缺少文件类型、大小限制、处理时间
- 可验证性：❌ 没有明确的验证标准

步骤 3：改进需求
WHEN a user uploads a file THEN the system SHALL:
- Validate the file format is one of: PDF, DOCX, or TXT
- Validate the file size does not exceed 10MB
- Extract text content from the file within 5 seconds
- Store the extracted text in the database

IF validation fails THEN the system SHALL reject the upload and return an error message indicating the specific validation failure

步骤 4：最终审查
✅ 使用 EARS Event-driven 模式
✅ 明确：所有操作都有具体定义
✅ 可验证：可以测试格式、大小、时间和存储
✅ 完整：包含正常流程和错误处理
✅ 单一：可以考虑拆分为多个需求以提高单一性
```

### 4.4 INCOSE 质量规则

INCOSE（International Council on Systems Engineering，国际系统工程理事会）定义了一套需求质量规则，用于确保需求的清晰性、完整性和可测试性。以下是核心质量规则及其说明。

#### 4.4.1 必要性（Necessary）

**规则**：每个需求都必须记录一个必要的能力、特性、约束或质量因素。

**说明**：需求应该描述系统真正需要的功能，而不是"锦上添花"的特性。

**违规示例**：
```
THE system SHALL have a beautiful user interface
```
**问题**："beautiful"（美观）是主观的，不是必要的功能需求。

**正确示例**：
```
THE system SHALL comply with WCAG 2.1 Level AA accessibility standards
```

#### 4.4.2 实现无关性（Implementation-free）

**规则**：需求应该描述"做什么"（what），而不是"怎么做"（how）。

**说明**：需求不应该规定具体的实现技术、算法或架构，这些属于设计阶段的决策。

**违规示例**：
```
THE system SHALL use PostgreSQL database to store user data
```
**问题**：规定了具体的数据库技术，限制了设计选择。

**正确示例**：
```
THE system SHALL persist user data with ACID transaction guarantees
```

**违规示例**：
```
WHEN a user submits a form THEN the system SHALL call the validateInput() function
```
**问题**：规定了具体的函数名称，这是实现细节。

**正确示例**：
```
WHEN a user submits a form THEN the system SHALL validate all input fields before processing
```

#### 4.4.3 明确性（Unambiguous）

**规则**：需求必须有且仅有一种解释，不能含糊不清。

**说明**：避免使用模糊的词语，如"快速"、"高效"、"用户友好"等，应该使用可量化的标准。

**违规示例**：
```
THE system SHALL respond quickly to user requests
```
**问题**："quickly"（快速）是模糊的，没有明确的标准。

**正确示例**：
```
THE system SHALL respond to user requests within 200 milliseconds for 95% of requests
```

**违规示例**：
```
THE system SHALL support many concurrent users
```
**问题**："many"（许多）是模糊的数量。

**正确示例**：
```
THE system SHALL support at least 10,000 concurrent users
```

#### 4.4.4 一致性（Consistent）

**规则**：需求不应该与其他需求冲突或矛盾。

**说明**：所有需求应该能够同时满足，不存在逻辑冲突。

**违规示例**：
```
需求 1: THE system SHALL encrypt all data in transit using TLS 1.3
需求 2: THE system SHALL support legacy clients using SSL 3.0
```
**问题**：TLS 1.3 和 SSL 3.0 不兼容，两个需求冲突。

**正确示例**：
```
需求 1: THE system SHALL encrypt all data in transit using TLS 1.2 or higher
需求 2: THE system SHALL reject connections from clients using SSL 3.0 or earlier
```

#### 4.4.5 完整性（Complete）

**规则**：需求集合应该完整地描述系统的所有必要功能，不遗漏关键行为。

**说明**：需求应该覆盖正常流程、异常流程、边界条件和错误处理。

**不完整示例**：
```
WHEN a user logs in with valid credentials THEN the system SHALL grant access
```
**问题**：只描述了成功情况，没有描述失败情况。

**完整示例**：
```
需求 1: WHEN a user logs in with valid credentials THEN the system SHALL grant access and create a session
需求 2: WHEN a user logs in with invalid credentials THEN the system SHALL deny access and display an error message
需求 3: IF a user enters incorrect credentials three times THEN the system SHALL lock the account for 15 minutes
```

#### 4.4.6 单一性（Singular）

**规则**：每个需求应该只描述一个单一的能力或约束。

**说明**：避免使用"and"、"or"将多个需求合并为一个，这会降低可追溯性和可测试性。

**违规示例**：
```
WHEN a user submits an order THEN the system SHALL validate the order, process the payment, update the inventory, and send a confirmation email
```
**问题**：一个需求描述了四个不同的行为。

**正确示例**：
```
需求 1: WHEN a user submits an order THEN the system SHALL validate the order data
需求 2: WHEN an order is validated THEN the system SHALL process the payment
需求 3: WHEN a payment is successful THEN the system SHALL update the inventory
需求 4: WHEN an order is completed THEN the system SHALL send a confirmation email to the user
```

#### 4.4.7 可行性（Feasible）

**规则**：需求必须在技术上和经济上可行。

**说明**：需求应该是可以实现的，不应该要求不可能或不切实际的功能。

**违规示例**：
```
THE system SHALL predict user behavior with 100% accuracy
```
**问题**：100% 准确预测是不可能的。

**正确示例**：
```
THE system SHALL predict user behavior with at least 85% accuracy based on historical data
```

#### 4.4.8 可追溯性（Traceable）

**规则**：每个需求应该有唯一的标识符，便于在设计、实现和测试中引用。

**说明**：使用编号系统（如 1.1, 1.2, 2.1）为每个需求分配唯一标识。

**示例**：
```markdown
### 需求 1：用户认证

#### 1.1 登录功能
WHEN a user submits valid credentials THEN the system SHALL authenticate the user and create a session

#### 1.2 登出功能
WHEN a user logs out THEN the system SHALL terminate the session and clear authentication tokens

### 需求 2：会话管理

#### 2.1 会话超时
WHILE a user session is inactive for 30 minutes the system SHALL automatically terminate the session
```

#### 4.4.9 可验证性（Verifiable）

**规则**：需求必须可以通过测试、检查、分析或演示来验证。

**说明**：需求应该定义明确的验收标准，使得可以客观地判断需求是否被满足。

**违规示例**：
```
THE system SHALL be user-friendly
```
**问题**："user-friendly"（用户友好）是主观的，无法客观验证。

**正确示例**：
```
THE system SHALL allow users to complete the checkout process in no more than 3 clicks
```

**违规示例**：
```
THE system SHALL be secure
```
**问题**："secure"（安全）过于宽泛，无法验证。

**正确示例**：
```
需求 1: THE system SHALL enforce password complexity requirements (minimum 12 characters, including uppercase, lowercase, numbers, and special characters)
需求 2: THE system SHALL implement rate limiting of 100 requests per minute per IP address
需求 3: THE system SHALL log all authentication attempts with timestamp and source IP
```

### 4.5 requirements.md 模板

本节提供 `requirements.md` 文档的标准模板，包含所有必需章节和格式规范。

#### 4.5.1 模板结构

```markdown
# 需求文档：{功能名称}

## 简介

{简要描述该功能的目的、背景和价值。1-2 段文字即可。}

## 术语表

{定义本文档中使用的关键术语和概念，确保所有人对术语有共同理解。}

- **术语1**（英文术语）: 定义说明
- **术语2**（英文术语）: 定义说明
- **术语3**（英文术语）: 定义说明

## 需求

### 需求 1: {需求名称}

**用户故事**: {使用"作为...我希望...以便..."格式描述业务价值}

#### 验收标准

1. {使用 EARS 模式编写的验收标准 1}
2. {使用 EARS 模式编写的验收标准 2}
3. {使用 EARS 模式编写的验收标准 3}

### 需求 2: {需求名称}

**用户故事**: {用户故事}

#### 验收标准

1. {验收标准 1}
2. {验收标准 2}
3. {验收标准 3}

{继续添加更多需求...}
```

#### 4.5.2 章节说明

##### 简介章节

**目的**：提供功能的高层次概述，帮助读者快速理解功能的背景和价值。

**内容要求**：
- 1-2 段文字
- 说明功能的目的和业务价值
- 说明功能的范围（包含什么，不包含什么）
- 可选：说明功能的利益相关者

**示例**：
```markdown
## 简介

本功能为电商平台添加用户认证系统，使用户能够安全地登录、管理会话和访问个人账户。认证系统是平台安全架构的核心组件，为后续的授权、个性化和订单管理功能提供基础。

该功能包括用户注册、登录、登出、会话管理和密码重置。不包括社交媒体登录（如 Google、Facebook 登录），这将在后续版本中实现。
```

##### 术语表章节

**目的**：定义文档中使用的关键术语，确保所有人对术语有共同理解，避免歧义。

**内容要求**：
- 使用项目符号列表
- 每个术语包含中文名称和英文名称（如果适用）
- 提供清晰、简洁的定义
- 按字母顺序或逻辑顺序排列

**格式**：
```markdown
- **术语中文名**（English Term）: 定义说明
```

**示例**：
```markdown
## 术语表

- **用户**（User）: 在系统中注册并拥有账户的个人
- **会话**（Session）: 用户登录后到登出或超时之间的时间段，期间用户保持认证状态
- **访问令牌**（Access Token）: 用于验证用户身份的短期凭证，通常为 JWT 格式
- **刷新令牌**（Refresh Token）: 用于获取新访问令牌的长期凭证，存储在安全的 HTTP-only cookie 中
- **凭证**（Credentials）: 用户用于认证的信息，通常包括用户名和密码
- **认证**（Authentication）: 验证用户身份的过程
- **授权**（Authorization）: 确定已认证用户可以访问哪些资源的过程
```

##### 需求章节

**目的**：详细描述系统必须满足的所有功能性和非功能性需求。

**内容要求**：
- 使用层次化的编号系统（需求 1, 需求 2, 需求 3...）
- 每个需求包含用户故事和验收标准
- 验收标准使用 EARS 模式编写
- 验收标准使用编号列表（1, 2, 3...）

**用户故事格式**：
```
作为 <角色>，我希望 <功能>，以便 <业务价值>
```

**示例**：
```markdown
## 需求

### 需求 1: 用户登录

**用户故事**: 作为注册用户，我希望能够使用用户名和密码登录系统，以便访问我的个人账户和订单历史。

#### 验收标准

1. WHEN a user submits valid credentials THEN the system SHALL authenticate the user and return an access token
2. WHEN a user submits invalid credentials THEN the system SHALL return an error message and deny access
3. IF a user enters incorrect credentials three times consecutively THEN the system SHALL lock the account for 15 minutes
4. THE system SHALL hash all passwords using bcrypt with a cost factor of at least 12
5. WHEN a user successfully logs in THEN the system SHALL create a session record with expiration time

### 需求 2: 会话管理

**用户故事**: 作为系统管理员，我希望系统能够自动管理用户会话的生命周期，以便确保安全性和资源的有效利用。

#### 验收标准

1. WHILE a user session is active the system SHALL refresh the access token every 15 minutes
2. WHILE a user session is inactive for 30 minutes the system SHALL automatically terminate the session
3. WHEN a user logs out THEN the system SHALL invalidate the access token and delete the session record
4. THE system SHALL limit each user to a maximum of 5 concurrent sessions
5. WHEN a user exceeds the session limit THEN the system SHALL terminate the oldest session

### 需求 3: 密码重置

**用户故事**: 作为忘记密码的用户，我希望能够通过电子邮件重置密码，以便重新获得账户访问权限。

#### 验收标准

1. WHEN a user requests a password reset THEN the system SHALL send a reset link to the user's registered email address
2. THE system SHALL generate a unique, time-limited reset token valid for 1 hour
3. WHEN a user clicks the reset link THEN the system SHALL verify the token and allow the user to set a new password
4. IF a reset token has expired THEN the system SHALL reject the reset request and prompt the user to request a new link
5. WHEN a user successfully resets their password THEN the system SHALL invalidate all existing sessions for that user
```

#### 4.5.3 完整示例：用户认证功能

以下是一个完整的 `requirements.md` 文档示例：

```markdown
# 需求文档：用户认证系统

## 简介

本功能为电商平台添加用户认证系统，使用户能够安全地登录、管理会话和访问个人账户。认证系统是平台安全架构的核心组件，为后续的授权、个性化和订单管理功能提供基础。

该功能包括用户注册、登录、登出、会话管理和密码重置。不包括社交媒体登录（如 Google、Facebook 登录）和多因素认证（MFA），这些将在后续版本中实现。

## 术语表

- **用户**（User）: 在系统中注册并拥有账户的个人
- **会话**（Session）: 用户登录后到登出或超时之间的时间段，期间用户保持认证状态
- **访问令牌**（Access Token）: 用于验证用户身份的短期凭证，采用 JWT 格式，有效期 15 分钟
- **刷新令牌**（Refresh Token）: 用于获取新访问令牌的长期凭证，存储在安全的 HTTP-only cookie 中，有效期 7 天
- **凭证**（Credentials）: 用户用于认证的信息，包括用户名（或电子邮件）和密码
- **认证**（Authentication）: 验证用户身份的过程
- **会话超时**（Session Timeout）: 用户在一段时间内没有活动后，系统自动终止会话的机制
- **密码哈希**（Password Hash）: 使用单向哈希算法（bcrypt）存储的密码，无法反向解密
- **重置令牌**（Reset Token）: 用于密码重置流程的一次性、时间限制的令牌

## 需求

### 需求 1: 用户注册

**用户故事**: 作为新用户，我希望能够创建账户，以便使用平台的功能和服务。

#### 验收标准

1. WHEN a user submits a registration form with valid data THEN the system SHALL create a new user account
2. THE system SHALL require the following fields for registration: email address, username, and password
3. THE system SHALL validate that the email address is in valid format
4. THE system SHALL validate that the username is unique and contains only alphanumeric characters and hyphens
5. THE system SHALL enforce password complexity requirements: minimum 12 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character
6. IF a user attempts to register with an existing email or username THEN the system SHALL reject the registration and display an appropriate error message
7. WHEN a user successfully registers THEN the system SHALL send a verification email to the provided email address
8. THE system SHALL hash all passwords using bcrypt with a cost factor of at least 12 before storing

### 需求 2: 用户登录

**用户故事**: 作为注册用户，我希望能够使用用户名和密码登录系统，以便访问我的个人账户和订单历史。

#### 验收标准

1. WHEN a user submits valid credentials THEN the system SHALL authenticate the user and return an access token and refresh token
2. WHEN a user submits invalid credentials THEN the system SHALL return an error message "Invalid username or password" and deny access
3. IF a user enters incorrect credentials three times consecutively THEN the system SHALL lock the account for 15 minutes
4. WHEN a user's account is locked THEN the system SHALL display a message indicating the lockout duration
5. WHEN a user successfully logs in THEN the system SHALL create a session record with user ID, login timestamp, and expiration time
6. THE system SHALL return the access token in the response body and set the refresh token as an HTTP-only, secure cookie
7. THE system SHALL log all login attempts (successful and failed) with timestamp, username, and source IP address

### 需求 3: 会话管理

**用户故事**: 作为系统管理员，我希望系统能够自动管理用户会话的生命周期，以便确保安全性和资源的有效利用。

#### 验收标准

1. THE system SHALL set access token expiration to 15 minutes from issuance
2. THE system SHALL set refresh token expiration to 7 days from issuance
3. WHILE a user session is active the system SHALL allow the user to refresh the access token using a valid refresh token
4. WHEN a user requests a token refresh with a valid refresh token THEN the system SHALL issue a new access token
5. WHILE a user session is inactive for 30 minutes the system SHALL automatically terminate the session and invalidate the refresh token
6. THE system SHALL limit each user to a maximum of 5 concurrent sessions
7. WHEN a user exceeds the session limit THEN the system SHALL terminate the oldest session
8. WHEN a user logs out THEN the system SHALL invalidate the access token and refresh token and delete the session record

### 需求 4: 令牌验证

**用户故事**: 作为系统，我需要验证用户的访问令牌，以便确保只有已认证的用户可以访问受保护的资源。

#### 验收标准

1. WHEN a user makes a request to a protected endpoint with a valid access token THEN the system SHALL allow the request to proceed
2. WHEN a user makes a request with an expired access token THEN the system SHALL return HTTP 401 status with error message "Token expired"
3. WHEN a user makes a request with an invalid or malformed token THEN the system SHALL return HTTP 401 status with error message "Invalid token"
4. WHEN a user makes a request without an access token THEN the system SHALL return HTTP 401 status with error message "Authentication required"
5. THE system SHALL verify the token signature using the configured secret key
6. THE system SHALL extract the user ID from the validated token and make it available to the request handler

### 需求 5: 密码重置

**用户故事**: 作为忘记密码的用户，我希望能够通过电子邮件重置密码，以便重新获得账户访问权限。

#### 验收标准

1. WHEN a user requests a password reset THEN the system SHALL generate a unique reset token and send a reset link to the user's registered email address
2. THE system SHALL generate a cryptographically secure reset token with at least 32 bytes of entropy
3. THE system SHALL set the reset token expiration to 1 hour from generation
4. WHEN a user clicks the reset link with a valid token THEN the system SHALL display a password reset form
5. IF a reset token has expired THEN the system SHALL reject the reset request and display a message prompting the user to request a new link
6. WHEN a user submits a new password through the reset form THEN the system SHALL validate the password against complexity requirements
7. WHEN a user successfully resets their password THEN the system SHALL invalidate all existing sessions and refresh tokens for that user
8. WHEN a user successfully resets their password THEN the system SHALL send a confirmation email to the user
9. THE system SHALL allow only one active reset token per user at a time

### 需求 6: 账户安全

**用户故事**: 作为用户，我希望我的账户受到保护，以便防止未经授权的访问。

#### 验收标准

1. THE system SHALL implement rate limiting of 10 login attempts per IP address per minute
2. WHEN an IP address exceeds the rate limit THEN the system SHALL return HTTP 429 status and block further attempts for 5 minutes
3. THE system SHALL log all security-related events including: login attempts, password changes, password resets, and account lockouts
4. THE system SHALL store all passwords as bcrypt hashes with a cost factor of at least 12
5. THE system SHALL never return password hashes in API responses
6. THE system SHALL use HTTPS for all authentication-related endpoints
7. THE system SHALL set secure and HTTP-only flags on all authentication cookies
8. THE system SHALL implement CSRF protection for all state-changing operations

### 需求 7: 用户登出

**用户故事**: 作为用户，我希望能够安全地登出系统，以便在共享设备上保护我的账户。

#### 验收标准

1. WHEN a user logs out THEN the system SHALL invalidate the current access token
2. WHEN a user logs out THEN the system SHALL delete the refresh token cookie
3. WHEN a user logs out THEN the system SHALL delete the session record from the database
4. THE system SHALL provide a "logout from all devices" option that invalidates all sessions for the user
5. WHEN a user logs out from all devices THEN the system SHALL invalidate all access tokens and refresh tokens for that user
```

#### 4.5.4 编写需求文档的最佳实践

1. **从简介开始**：先写简介章节，明确功能的范围和目标，这有助于后续需求的聚焦

2. **建立术语表**：在编写需求之前，先定义关键术语，确保一致性

3. **使用用户故事**：每个需求都应该有用户故事，说明"谁需要这个功能"和"为什么需要"

4. **应用 EARS 模式**：所有验收标准都应该使用 EARS 模式，确保清晰和一致性

5. **覆盖正常和异常流程**：不要只描述"快乐路径"，也要包含错误处理和边界条件

6. **保持原子性**：每个验收标准应该描述一个单一的行为，避免使用"and"合并多个行为

7. **使用可验证的标准**：避免模糊的词语（如"快速"、"用户友好"），使用可量化的标准

8. **引用术语表**：在需求中使用术语表中定义的术语，保持一致性

9. **考虑安全性**：对于涉及认证、授权、数据处理的功能，明确安全需求

10. **迭代改进**：需求文档不是一次性完成的，根据反馈和发现的缺口持续改进

#### 4.5.5 需求文档检查清单

在完成需求文档后，使用以下检查清单验证质量：

- [ ] 简介章节清楚地说明了功能的目的和范围
- [ ] 术语表定义了所有关键术语
- [ ] 每个需求都有用户故事
- [ ] 每个需求都有至少 3 个验收标准
- [ ] 所有验收标准都使用 EARS 模式
- [ ] 需求覆盖了正常流程和异常流程
- [ ] 需求符合 INCOSE 质量规则（必要性、实现无关性、明确性等）
- [ ] 需求之间没有冲突或矛盾
- [ ] 所有需求都是可验证的（可以通过测试确认）
- [ ] 需求使用了术语表中定义的术语
- [ ] 文档格式一致，易于阅读

