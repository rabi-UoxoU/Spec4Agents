# Spec 模板

完整 requirements.md、design.md、tasks.md、bugfix.md 从共享 reference.md 提取；pending/ 仅用于尚未进入的阶段。默认自然语言为中文。

选择语言：用户明确指定 → 已有 Spec 语言 → 新建时当前对话主要语言。其他语言先将所需完整及 pending 模板复制到项目外临时目录，翻译自然语言，运行初始化时传入 --template-dir。保留 EARS 关键词 WHEN、THEN、WHILE、IF、WHERE、THE、SHALL，保留文件名、API、JSON 字段、枚举值等技术标识符。不得因为 EARS 为英文而把中文验收标准全文写成英文。

唯一文档替换变量是 {{featureName}}；其余双花括号属于示例正文，按字面保留。配置由脚本使用标准库生成 UUID v4 并序列化，.config.agent 展示字段结构，Bugfix 省略 workflowType。

只需准备当前类型/流程会使用的模板，额外文件被忽略。Feature requirements-first 使用完整 requirements.md 和 pending/design.md、pending/tasks.md；design-first 使用完整 design.md 和 pending/requirements.md、pending/tasks.md；Bugfix 使用完整 bugfix.md 和 pending/design.md、pending/tasks.md。
