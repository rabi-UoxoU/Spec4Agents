## 7. 属性测试指南

### 7.1 正确性模式（Correctness Patterns）

属性测试（Property-Based Testing，PBT）的核心在于识别代码中存在的**正确性模式**——即无论输入如何变化，代码都应当满足的普遍性质。以下是 7 种常见的正确性模式，每种模式都有其独特的适用场景和验证方式。

---

#### 7.1.1 Invariants（不变量）

**定义**：无论输入如何变化，某些属性始终保持不变。

**说明**：

不变量是系统中最基础的正确性保证。它描述的是一个在所有合法操作下都不会被破坏的性质。不变量通常与数据结构的完整性、业务规则的约束或系统状态的合法性相关。

验证不变量时，你不需要知道操作的具体输出，只需要确认某个属性在操作前后都成立。

**代码示例**：

```python
# 示例：排序后列表长度不变
def test_sort_preserves_length(lst):
    sorted_lst = sort(lst)
    assert len(sorted_lst) == len(lst)  # 不变量：长度不变

# 示例：排序后元素集合不变（没有元素丢失或新增）
def test_sort_preserves_elements(lst):
    sorted_lst = sort(lst)
    assert set(sorted_lst) == set(lst)  # 不变量：元素集合不变

# 示例：二叉搜索树的结构不变量
def test_bst_invariant(tree, value):
    insert(tree, value)
    # 不变量：插入后仍然是合法的 BST
    assert is_valid_bst(tree)

# 示例：账户余额不变量
def test_transfer_preserves_total_balance(account_a, account_b, amount):
    total_before = account_a.balance + account_b.balance
    transfer(account_a, account_b, amount)
    total_after = account_a.balance + account_b.balance
    assert total_after == total_before  # 不变量：总余额不变
```

**适用场景**：

- 数据结构操作（排序、过滤、映射）
- 数据库事务（转账、库存调整）
- 状态机转换（合法状态约束）
- 集合操作（并集、交集、差集）
- 任何需要保证数据完整性的操作

---

#### 7.1.2 Round Trip（往返）

**定义**：将操作与其逆操作组合后，返回原始值。

**说明**：

往返属性是最直观的正确性模式之一。它验证两个互逆操作的组合是否构成恒等变换。最典型的例子是序列化与反序列化：将数据序列化为字节流，再反序列化回来，应当得到与原始数据等价的结果。

往返属性有两个方向：
- **正向往返**：`decode(encode(x)) == x`
- **逆向往返**：`encode(decode(y)) == y`（并非总是成立，取决于编码是否有损）

**代码示例**：

```python
# 示例：JSON 序列化往返
def test_json_round_trip(data):
    assert json.loads(json.dumps(data)) == data

# 示例：Base64 编码往返
def test_base64_round_trip(bytes_data):
    assert base64.decode(base64.encode(bytes_data)) == bytes_data

# 示例：压缩往返
def test_compression_round_trip(data):
    assert decompress(compress(data)) == data

# 示例：加密往返（使用相同密钥）
def test_encryption_round_trip(plaintext, key):
    assert decrypt(encrypt(plaintext, key), key) == plaintext

# 示例：URL 编码往返
def test_url_encoding_round_trip(url):
    assert url_decode(url_encode(url)) == url

# 示例：解析器往返（parse → print → parse）
def test_parser_round_trip(source_code):
    ast1 = parse(source_code)
    printed = pretty_print(ast1)
    ast2 = parse(printed)
    assert ast1 == ast2  # 两次解析结果相同
```

**适用场景**：

- 序列化器和反序列化器（JSON、XML、Protobuf、MessagePack）
- 编码和解码（Base64、URL 编码、HTML 实体）
- 压缩和解压缩
- 加密和解密
- 解析器和 pretty printer（**必须**实现此属性，详见 7.3 节）
- 数据格式转换（CSV ↔ 对象、Markdown ↔ HTML）

---

#### 7.1.3 Idempotence（幂等性）

**定义**：执行操作两次与执行一次的结果相同。

**说明**：

幂等性是分布式系统和 API 设计中的重要概念。一个幂等操作满足：`f(f(x)) == f(x)`。这意味着无论操作执行多少次，结果都与执行一次相同。

幂等性对于网络请求重试、消息队列处理和数据库操作尤为重要——当操作可能因网络故障而重复执行时，幂等性保证了系统的一致性。

**代码示例**：

```python
# 示例：排序的幂等性
def test_sort_idempotent(lst):
    assert sort(sort(lst)) == sort(lst)

# 示例：去重的幂等性
def test_deduplicate_idempotent(lst):
    assert deduplicate(deduplicate(lst)) == deduplicate(lst)

# 示例：HTTP PUT 请求的幂等性
def test_put_request_idempotent(resource_id, data):
    response1 = put(resource_id, data)
    response2 = put(resource_id, data)
    assert get(resource_id) == get(resource_id)  # 两次 PUT 后状态相同

# 示例：数据库 upsert 的幂等性
def test_upsert_idempotent(record):
    upsert(record)
    upsert(record)
    assert count_by_id(record.id) == 1  # 不会创建重复记录

# 示例：格式化代码的幂等性
def test_formatter_idempotent(code):
    formatted_once = format_code(code)
    formatted_twice = format_code(formatted_once)
    assert formatted_twice == formatted_once

# 示例：规范化的幂等性
def test_normalize_idempotent(text):
    assert normalize(normalize(text)) == normalize(text)
```

**适用场景**：

- HTTP PUT 和 DELETE 请求
- 数据库 upsert 操作
- 消息队列消费者（at-least-once 语义）
- 代码格式化工具
- 数据规范化和清洗
- 缓存失效操作
- 配置应用（Terraform、Ansible 等 IaC 工具）

---

#### 7.1.4 Metamorphic（变形）

**定义**：不同输入之间存在已知关系，无需知道具体输出即可验证正确性。

**说明**：

变形测试解决了一个经典难题：当你无法轻易计算预期输出时，如何验证函数的正确性？变形属性通过描述**输入变换与输出变换之间的关系**来绕过这个问题。

例如，你可能不知道 `sin(x)` 的精确值，但你知道 `sin(x) == sin(π - x)`。这个关系就是一个变形属性，可以用来验证 `sin` 函数的实现。

**代码示例**：

```python
# 示例：搜索结果的变形属性
# 添加更多匹配项不会减少搜索结果数量
def test_search_metamorphic(query, extra_matching_document):
    results_before = search(query, corpus)
    results_after = search(query, corpus + [extra_matching_document])
    assert len(results_after) >= len(results_before)

# 示例：排序的变形属性
# 反转输入后排序，结果应该是原排序结果的反转
def test_sort_metamorphic(lst):
    assert sort(lst, reverse=True) == list(reversed(sort(lst)))

# 示例：机器学习模型的变形属性
# 对图像进行水平翻转后，分类结果应该相同（对于对称类别）
def test_classifier_metamorphic(image):
    result1 = classify(image)
    result2 = classify(flip_horizontal(image))
    assert result1 == result2  # 假设分类对翻转不敏感

# 示例：数学函数的变形属性
# sin(x) == sin(π - x)
def test_sin_metamorphic(x):
    assert abs(sin(x) - sin(math.pi - x)) < 1e-10

# 示例：路径查找的变形属性
# 添加一条边不会增加最短路径的长度
def test_shortest_path_metamorphic(graph, start, end, new_edge):
    path_before = shortest_path(graph, start, end)
    path_after = shortest_path(graph + [new_edge], start, end)
    assert len(path_after) <= len(path_before)

# 示例：编译器的变形属性
# 添加无用代码不应改变程序的输出
def test_compiler_metamorphic(program, dead_code):
    output1 = run(compile(program))
    output2 = run(compile(program + dead_code))
    assert output1 == output2
```

**适用场景**：

- 搜索和排名算法（难以计算精确排名）
- 机器学习模型（难以预测精确输出）
- 数学函数（利用已知数学关系）
- 编译器和解释器（语义等价变换）
- 图算法（路径、连通性）
- 任何"神谕问题"（oracle problem）——即难以独立计算预期输出的场景

---

#### 7.1.5 Model-Based（基于模型）

**定义**：将优化实现与简单参考实现进行比较，两者应产生相同结果。

**说明**：

基于模型的测试使用一个**简单但正确的参考实现**（模型）来验证**复杂但高效的实际实现**。参考实现通常是直接、朴素的实现，易于理解和验证其正确性；实际实现则可能经过了大量优化，难以直接验证。

这种模式特别适合验证性能优化是否破坏了正确性。

**代码示例**：

```python
# 示例：高效排序 vs 朴素排序
def naive_sort(lst):
    """朴素的冒泡排序（参考实现）"""
    result = lst.copy()
    for i in range(len(result)):
        for j in range(len(result) - 1):
            if result[j] > result[j + 1]:
                result[j], result[j + 1] = result[j + 1], result[j]
    return result

def test_optimized_sort_matches_model(lst):
    assert optimized_sort(lst) == naive_sort(lst)

# 示例：高效缓存查询 vs 直接数据库查询
def test_cached_query_matches_database(user_id):
    result_from_cache = get_user_cached(user_id)
    result_from_db = get_user_from_db(user_id)
    assert result_from_cache == result_from_db

# 示例：并行计算 vs 串行计算
def test_parallel_sum_matches_sequential(numbers):
    assert parallel_sum(numbers) == sum(numbers)  # sum() 是参考实现

# 示例：优化的字符串搜索 vs 朴素搜索
def naive_search(text, pattern):
    """朴素的字符串搜索（参考实现）"""
    results = []
    for i in range(len(text) - len(pattern) + 1):
        if text[i:i+len(pattern)] == pattern:
            results.append(i)
    return results

def test_kmp_search_matches_naive(text, pattern):
    assert kmp_search(text, pattern) == naive_search(text, pattern)

# 示例：优化的 JSON 解析器 vs 标准库
def test_fast_json_parser_matches_stdlib(json_string):
    assert fast_json_parse(json_string) == json.loads(json_string)
```

**适用场景**：

- 性能优化（验证优化后的实现与原始实现等价）
- 并行/分布式计算（验证并行版本与串行版本等价）
- 缓存层（验证缓存结果与直接查询结果一致）
- 自定义数据结构（验证与标准库实现等价）
- 编译器优化（验证优化后的代码语义不变）
- 任何"有参考实现可用"的场景

---

#### 7.1.6 Confluence（汇合性）

**定义**：操作的顺序不影响最终结果。

**说明**：

汇合性（也称为交换性或结合性）描述的是：无论以何种顺序执行一组操作，最终状态都相同。这在并发系统、分布式数据库和函数式编程中尤为重要。

汇合性保证了系统的**最终一致性**：即使操作以不同顺序到达，系统最终会收敛到相同的状态。

**代码示例**：

```python
# 示例：集合操作的汇合性（并集的交换律）
def test_union_commutative(set_a, set_b):
    assert union(set_a, set_b) == union(set_b, set_a)

# 示例：加法的交换律
def test_addition_commutative(a, b):
    assert add(a, b) == add(b, a)

# 示例：数据库操作的汇合性
# 无论先插入 A 再插入 B，还是先插入 B 再插入 A，最终状态相同
def test_insert_order_independent(record_a, record_b):
    db1 = new_database()
    insert(db1, record_a)
    insert(db1, record_b)

    db2 = new_database()
    insert(db2, record_b)
    insert(db2, record_a)

    assert db1.state == db2.state

# 示例：CRDT（无冲突复制数据类型）的汇合性
def test_crdt_merge_commutative(state_a, state_b):
    assert merge(state_a, state_b) == merge(state_b, state_a)

# 示例：配置合并的汇合性
def test_config_merge_order_independent(config_a, config_b):
    result1 = merge_configs(config_a, config_b)
    result2 = merge_configs(config_b, config_a)
    assert result1 == result2

# 示例：事件溯源的汇合性
# 对于可交换的事件，应用顺序不影响最终状态
def test_commutative_events(initial_state, event_a, event_b):
    state1 = apply(apply(initial_state, event_a), event_b)
    state2 = apply(apply(initial_state, event_b), event_a)
    assert state1 == state2
```

**适用场景**：

- 分布式系统（最终一致性）
- CRDT（无冲突复制数据类型）
- 事件溯源（可交换事件）
- 数学运算（交换律、结合律）
- 配置合并（多来源配置）
- 并发数据结构（无锁算法）
- 函数式编程中的 Monoid 和 Commutative Monoid

---

#### 7.1.7 Error Conditions（错误条件）

**定义**：无效输入应当正确触发错误，而不是静默失败或产生错误结果。

**说明**：

错误条件测试验证系统对无效输入的处理是否正确。这包括：
- 无效输入应当抛出异常或返回错误，而不是静默接受
- 错误消息应当清晰、有意义
- 错误不应该导致系统进入不一致状态
- 边界值（空输入、极大值、极小值）应当被正确处理

这种模式特别重要，因为错误处理代码往往是最难测试的部分，也是最容易出现安全漏洞的地方。

**代码示例**：

```python
# 示例：除法的错误条件
def test_division_by_zero_raises_error(numerator):
    with pytest.raises(ZeroDivisionError):
        divide(numerator, 0)

# 示例：无效 JSON 应当抛出解析错误
def test_invalid_json_raises_parse_error(invalid_json_string):
    with pytest.raises(ParseError):
        parse_json(invalid_json_string)

# 示例：负数索引应当抛出错误
def test_negative_index_raises_error(lst, negative_index):
    assume(negative_index < 0)
    with pytest.raises(IndexError):
        get_element(lst, negative_index)

# 示例：空字符串不应被接受为有效用户名
def test_empty_username_rejected(password):
    result = create_user("", password)
    assert result.is_error()
    assert "username" in result.error_message.lower()

# 示例：超出范围的值应当被拒绝
def test_out_of_range_age_rejected(name):
    # 年龄必须在 0-150 之间
    result_negative = create_profile(name, age=-1)
    assert result_negative.is_error()

    result_too_large = create_profile(name, age=200)
    assert result_too_large.is_error()

# 示例：格式错误的 email 应当被拒绝
def test_invalid_email_format_rejected(invalid_email):
    assume(not is_valid_email_format(invalid_email))
    result = register_user(invalid_email, "password123")
    assert result.is_error()

# 示例：错误不应破坏系统状态
def test_error_does_not_corrupt_state(system, invalid_input):
    state_before = system.get_state()
    try:
        system.process(invalid_input)
    except Exception:
        pass  # 预期会抛出异常
    state_after = system.get_state()
    assert state_before == state_after  # 状态不应被破坏
```

**适用场景**：

- 输入验证（用户输入、API 参数、配置文件）
- 边界值处理（空值、零值、最大值、最小值）
- 类型错误处理（错误的数据类型）
- 权限验证（未授权访问应当被拒绝）
- 资源限制（文件大小、请求频率）
- 任何需要验证"坏输入被正确拒绝"的场景

---

#### 7.1.8 正确性模式快速参考

| 模式 | 核心思想 | 典型公式 | 最常见场景 |
|------|---------|---------|-----------|
| **Invariants** | 某属性始终成立 | `property(f(x)) == property(x)` | 数据结构操作、事务 |
| **Round Trip** | 操作与逆操作互消 | `decode(encode(x)) == x` | 序列化、编解码、解析器 |
| **Idempotence** | 重复执行无副作用 | `f(f(x)) == f(x)` | HTTP PUT、upsert、格式化 |
| **Metamorphic** | 输入关系决定输出关系 | `f(transform(x)) == transform'(f(x))` | 搜索、ML 模型、数学函数 |
| **Model-Based** | 与参考实现对比 | `optimized(x) == reference(x)` | 性能优化、缓存、并行计算 |
| **Confluence** | 顺序不影响结果 | `f(g(x)) == g(f(x))` | 分布式系统、CRDT、并发 |
| **Error Conditions** | 无效输入触发错误 | `invalid(x) → error(f(x))` | 输入验证、边界值、权限 |


### 7.2 常见正确性模式（概览）

以下是对七种正确性模式的快速概览，详细说明和代码示例请参见上方 7.1 节。

在设计测试策略时，以下七种正确性模式可以帮助识别适合属性测试的场景：

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| **Invariants**（不变量） | 无论输入如何变化，某些属性始终成立 | 数据验证、约束检查 |
| **Round Trip**（往返） | 操作与其逆操作组合后恢复原始状态 | 序列化/反序列化、编码/解码 |
| **Idempotence**（幂等性） | 执行操作两次与执行一次结果相同 | 数据库更新、缓存刷新 |
| **Metamorphic**（变形关系） | 输入之间的关系决定输出之间的关系 | 排序算法、搜索功能 |
| **Model-Based**（基于模型） | 优化实现与简单参考实现结果一致 | 性能优化、算法替换 |
| **Confluence**（汇合性） | 操作顺序不影响最终结果 | 并发操作、事件处理 |
| **Error Conditions**（错误条件） | 无效输入始终触发适当的错误 | 输入验证、边界检查 |

#### 7.2.1 Invariants（不变量）

**定义**：无论对数据进行什么操作，某些属性始终保持不变。

**示例**：
```typescript
// 属性：对任意非空列表排序后，长度不变
property("排序不改变列表长度", fc.array(fc.integer(), { minLength: 1 }), (arr) => {
  const sorted = sort(arr);
  return sorted.length === arr.length;
});

// 属性：密码哈希值永远不等于原始密码
property("密码哈希的单向性", fc.string({ minLength: 1 }), (password) => {
  const hash = hashPassword(password);
  return hash !== password;
});
```

#### 7.2.2 Round Trip（往返）

**定义**：将操作与其逆操作组合后，结果应恢复到原始状态。

**示例**：
```typescript
// 属性：序列化后反序列化，结果与原始对象相等
property("JSON 序列化往返", fc.record({ name: fc.string(), age: fc.integer() }), (obj) => {
  const serialized = JSON.stringify(obj);
  const deserialized = JSON.parse(serialized);
  return deepEqual(deserialized, obj);
});

// 属性：编码后解码，结果与原始字符串相等
property("Base64 编码往返", fc.string(), (str) => {
  const encoded = base64Encode(str);
  const decoded = base64Decode(encoded);
  return decoded === str;
});
```

#### 7.2.3 Idempotence（幂等性）

**定义**：执行操作两次与执行一次的结果相同。

**示例**：
```typescript
// 属性：对已排序的列表再次排序，结果不变
property("排序的幂等性", fc.array(fc.integer()), (arr) => {
  const sortedOnce = sort(arr);
  const sortedTwice = sort(sortedOnce);
  return deepEqual(sortedOnce, sortedTwice);
});

// 属性：多次验证同一个有效 token，结果一致
property("Token 验证的幂等性", fc.string(), (userId) => {
  const token = generateToken(userId);
  const result1 = validateToken(token);
  const result2 = validateToken(token);
  return deepEqual(result1, result2);
});
```

#### 7.2.4 Metamorphic（变形关系）

**定义**：输入之间的关系决定了输出之间的关系，无需知道具体的正确输出。

**示例**：
```typescript
// 属性：搜索结果的子集关系——更严格的查询返回更少的结果
property("搜索结果的单调性", fc.string(), fc.string(), (query1, query2) => {
  // 如果 query2 包含 query1，则 query2 的结果是 query1 结果的子集
  const results1 = search(query1);
  const results2 = search(query1 + query2);
  return results2.every(r => results1.includes(r));
});
```

#### 7.2.5 Model-Based（基于模型）

**定义**：优化实现与简单的参考实现（模型）产生相同的结果。

**示例**：
```typescript
// 属性：优化的排序算法与简单冒泡排序结果一致
property("优化排序与参考实现一致", fc.array(fc.integer()), (arr) => {
  const optimizedResult = quickSort([...arr]);
  const referenceResult = bubbleSort([...arr]);
  return deepEqual(optimizedResult, referenceResult);
});
```

#### 7.2.6 Confluence（汇合性）

**定义**：操作的执行顺序不影响最终结果。

**示例**：
```typescript
// 属性：集合的并集操作满足交换律
property("集合并集的交换律", fc.set(fc.integer()), fc.set(fc.integer()), (setA, setB) => {
  const unionAB = union(setA, setB);
  const unionBA = union(setB, setA);
  return deepEqual(unionAB, unionBA);
});
```

#### 7.2.7 Error Conditions（错误条件）

**定义**：无效输入始终触发适当的错误，而不是静默失败或产生错误结果。

**示例**：
```typescript
// 属性：空字符串作为用户名始终触发验证错误
property("空用户名触发验证错误", fc.constant(""), (username) => {
  expect(() => validateUsername(username)).toThrow(ValidationError);
  return true;
});

// 属性：负数 ID 始终触发错误
property("负数 ID 触发错误", fc.integer({ max: -1 }), (id) => {
  expect(() => findUserById(id)).toThrow(InvalidIdError);
  return true;
});
```

### 7.3 PBT 决策指南

在决定是否使用属性测试时，可以通过以下四个决策问题来评估。

#### 7.3.1 四个决策问题

**问题 1：输入变化（Input Variation）**

> 这个函数是否接受多种不同的输入？

- **是** → 考虑使用 PBT（函数需要在各种输入下都正确工作）
- **否** → 可能不需要 PBT（固定输入用示例测试即可）

**问题 2：代码所有权（Code Ownership）**

> 这是我们自己编写的核心逻辑吗？

- **是** → 考虑使用 PBT（我们对代码的正确性负责）
- **否** → 可能不需要 PBT（第三方库或外部服务应由其提供者保证正确性）

**问题 3：迭代价值（Iterative Value）**

> 随着代码演进，这些测试是否仍然有价值？

- **是** → 考虑使用 PBT（属性测试在重构时能持续发现回归问题）
- **否** → 可能不需要 PBT（一次性验证用示例测试即可）

**问题 4：成本合理性（Cost Justification）**

> 编写属性测试的成本是否合理？

- **是** → 使用 PBT（复杂逻辑、高风险代码值得投入）
- **否** → 使用示例测试（简单逻辑不需要过度测试）

#### 7.3.2 决策流程图

```
函数是否接受多种不同输入？
├── 否 → 使用示例测试
└── 是 ↓
    这是我们自己编写的核心逻辑吗？
    ├── 否 → 使用集成测试或跳过
    └── 是 ↓
        随着代码演进，测试是否仍有价值？
        ├── 否 → 使用示例测试
        └── 是 ↓
            编写属性测试的成本是否合理？
            ├── 否 → 使用示例测试
            └── 是 → 使用 PBT ✓
```

#### 7.3.3 何时使用 PBT

满足以下条件时，优先考虑使用属性测试：

1. **纯函数和转换逻辑**：函数根据输入计算输出，没有副作用
   ```typescript
   // 适合 PBT：字符串转换函数
   function toSlug(title: string): string {
     return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
   }
   ```

2. **数据验证逻辑**：验证函数需要在各种输入下都正确工作
   ```typescript
   // 适合 PBT：邮箱验证函数
   function isValidEmail(email: string): boolean {
     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   }
   ```

3. **序列化和反序列化**：需要验证 round-trip 属性
   ```typescript
   // 适合 PBT：自定义序列化器
   function serialize(data: Config): string { ... }
   function deserialize(str: string): Config { ... }
   ```

4. **算法实现**：排序、搜索、计算等算法
   ```typescript
   // 适合 PBT：自定义排序算法
   function customSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] { ... }
   ```

5. **业务规则**：复杂的业务逻辑，需要在各种边界条件下验证
   ```typescript
   // 适合 PBT：折扣计算逻辑
   function calculateDiscount(price: number, quantity: number, memberLevel: string): number { ... }
   ```

#### 7.3.4 何时不使用 PBT

以下场景**不适合**使用属性测试：

**1. 基础设施代码（Infrastructure Code）**

数据库连接、文件系统操作、网络请求等基础设施代码不适合 PBT，因为：
- 依赖外部系统，难以生成有意义的随机输入
- 测试速度慢，不适合大量随机测试
- 应使用集成测试验证

```typescript
// 不适合 PBT：数据库操作
async function saveUser(user: User): Promise<void> {
  await db.query('INSERT INTO users VALUES ($1, $2)', [user.id, user.name]);
}
```

**2. 外部服务集成（External Service Integration）**

调用第三方 API、外部服务的代码不适合 PBT，因为：
- 外部服务的行为由第三方决定，不是我们的核心逻辑
- 随机输入可能触发真实的外部调用，产生副作用
- 应使用集成测试或 mock 测试

```typescript
// 不适合 PBT：第三方支付 API 调用
async function processPayment(amount: number, cardToken: string): Promise<PaymentResult> {
  return await stripeClient.charges.create({ amount, source: cardToken });
}
```

**3. 配置文件处理（Configuration Handling）**

读取和解析配置文件的代码通常不适合 PBT，因为：
- 配置格式是固定的，不需要测试随机输入
- 配置的正确性依赖于具体的业务规则，不是通用属性
- 应使用示例测试验证特定配置场景

```typescript
// 不适合 PBT：配置文件解析
function loadConfig(configPath: string): AppConfig {
  const raw = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(raw) as AppConfig;
}
```

**4. 确定性外部行为（Deterministic External Behavior）**

当外部系统的行为是固定的、确定性的时，不需要 PBT：
- 固定格式的外部数据（如特定 API 的响应格式）
- 已知的外部系统约束
- 应使用示例测试验证已知的行为

```typescript
// 不适合 PBT：解析固定格式的外部 API 响应
function parseGitHubUser(response: GitHubApiResponse): User {
  return {
    id: response.id,
    name: response.login,
    email: response.email ?? '',
  };
}
```

**5. 高成本操作（High-Cost Operations）**

需要大量计算资源或时间的操作不适合 PBT：
- 机器学习模型推理
- 大规模数据处理
- 复杂的图形渲染
- 应使用少量精心选择的示例测试

```typescript
// 不适合 PBT：机器学习模型推理（成本过高）
async function classifyImage(imageBuffer: Buffer): Promise<string[]> {
  return await mlModel.predict(imageBuffer);
}
```

#### 7.3.5 PBT 决策速查表

| 场景 | 推荐方法 | 原因 |
|------|---------|------|
| 纯函数转换逻辑 | ✅ PBT | 输入多样，逻辑可验证 |
| 数据验证函数 | ✅ PBT | 需要覆盖各种边界输入 |
| 序列化/反序列化 | ✅ PBT | Round-trip 属性天然适合 |
| 排序/搜索算法 | ✅ PBT | 通用属性（如排序后有序）易于表达 |
| 数据库操作 | ❌ 集成测试 | 依赖外部系统 |
| 第三方 API 调用 | ❌ 集成测试/Mock | 外部行为不受控 |
| 配置文件读取 | ❌ 示例测试 | 固定格式，无需随机输入 |
| 机器学习推理 | ❌ 示例测试 | 成本过高 |
| HTTP 路由处理 | ❌ 集成测试 | 依赖框架和中间件 |
| 业务规则计算 | ✅ PBT | 核心逻辑，输入多样 |

### 7.4 解析器和序列化器特殊要求

解析器（Parser）和序列化器（Serializer/Pretty Printer）是属性测试的最佳候选，因为它们具有明确的正确性属性，且输入空间巨大，手动测试难以覆盖所有边界情况。本节规定了在 Spec 工作流中处理解析器和序列化器需求的特殊规则。

#### 7.4.1 为什么解析器需要特殊处理

解析器和序列化器是 PBT 的理想候选，原因如下：

1. **输入空间巨大**：解析器的输入是任意字符串，可能的输入组合几乎无限，手动测试只能覆盖极小的子集
2. **存在明确的正确性属性**：round-trip 属性（`parse(print(parse(x))) == parse(x)`）是一个清晰、可自动验证的不变量
3. **边界情况难以预测**：Unicode 字符、嵌套结构、空输入、超长输入等边界情况很容易被手动测试遗漏
4. **错误代价高**：解析器的 bug 往往导致数据损坏或安全漏洞，需要高置信度的测试覆盖

#### 7.4.2 核心规则

在编写涉及解析器或序列化器的需求时，必须遵守以下四条核心规则：

**规则 1：显式需求**

所有解析器必须作为**显式需求**列出，不能隐含在其他需求中。

- ✅ 正确：为 JSON 解析器单独创建一个需求条目
- ❌ 错误：在"数据导入"需求中隐含地提到"系统应当解析 JSON 文件"

**规则 2：引用语法**

解析器需求必须明确引用正在解析的**语法规范**（Grammar/Syntax）。

- ✅ 正确：`系统应当能够解析符合 RFC 8259 规范的 JSON 文档`
- ❌ 错误：`系统应当能够解析 JSON 文档`（未引用具体规范）

语法引用可以是：
- 标准规范（如 RFC 8259 for JSON、W3C XML 规范）
- 自定义 DSL 的 BNF/EBNF 语法定义
- 语言版本（如 Python 3.11 语法、ECMAScript 2023）

**规则 3：包含 Pretty Printer**

每个解析器需求必须包含对应的 **pretty printer**（格式化输出/序列化器）需求。

- Pretty printer 将 AST（抽象语法树）或内部表示转换回规范的文本格式
- Pretty printer 是 round-trip 测试的必要组成部分
- 没有 pretty printer 的解析器需求是不完整的

**规则 4：包含 Round-Trip 属性**

每个解析器需求必须包含 **round-trip 测试**需求，即：

```
对任意有效输入 x：parse(print(parse(x))) == parse(x)
```

这个属性确保：
- 解析器能正确解析所有有效输入
- Pretty printer 能正确序列化解析结果
- 解析和序列化的组合是幂等的

#### 7.4.3 解析器需求模板

以下是符合所有四条规则的解析器需求标准模板：

```markdown
### 需求X: {语言/格式}解析器

**用户故事:** 作为...，我希望能够解析{语法描述}，以便...

#### 验收标准

1. 系统应当能够解析符合{语法规范引用}的{格式}文档
2. 系统应当提供 pretty printer，将 AST 格式化输出为规范的{格式}文本
3. 系统应当满足 round-trip 属性：对任意有效输入 x，parse(print(parse(x))) == parse(x)
4. 系统应当对无效输入返回有意义的错误信息，包含行号和错误描述
```

**模板说明**：

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `{语言/格式}` | 被解析的语言或格式名称 | JSON、XML、Markdown、自定义 DSL |
| `{语法描述}` | 对语法的简短描述 | "符合 RFC 8259 的 JSON 数据" |
| `{语法规范引用}` | 具体的语法规范 | RFC 8259、W3C XML 1.0、附录 A 中的 BNF 语法 |
| `{格式}` | 格式名称 | JSON、XML、DSL |

#### 7.4.4 完整示例

以下是三个不同场景的解析器需求完整示例：

**示例 1：JSON 解析器**

```markdown
### 需求 3: JSON 解析器

**用户故事:** 作为数据处理系统，我希望能够解析 JSON 格式的配置文件和 API 响应，以便在系统内部处理结构化数据。

#### 验收标准

1. 系统应当能够解析符合 RFC 8259 规范的 JSON 文档，支持所有 JSON 数据类型（null、boolean、number、string、array、object）
2. 系统应当提供 pretty printer，将内部 JSON AST 格式化输出为规范的 JSON 文本，支持可配置的缩进级别
3. 系统应当满足 round-trip 属性：对任意有效的 JSON 输入 x，`parse(print(parse(x))) == parse(x)`
4. 系统应当对无效的 JSON 输入返回错误信息，包含行号、列号和具体的语法错误描述
```

**示例 2：自定义 DSL 解析器**

```markdown
### 需求 5: 查询语言解析器

**用户故事:** 作为数据分析师，我希望能够使用自定义查询语言（QueryDSL）来过滤和聚合数据，以便灵活地分析业务数据。

#### 验收标准

1. 系统应当能够解析符合附录 A 中定义的 QueryDSL BNF 语法的查询表达式
2. 系统应当提供 pretty printer，将解析后的查询 AST 格式化输出为规范的 QueryDSL 文本（标准化空白符和括号）
3. 系统应当满足 round-trip 属性：对任意有效的 QueryDSL 输入 x，`parse(print(parse(x))) == parse(x)`
4. 系统应当对语法错误的查询返回错误信息，包含错误位置（行号和列号）和期望的语法元素描述
```

**示例 3：配置文件解析器**

```markdown
### 需求 7: TOML 配置解析器

**用户故事:** 作为系统管理员，我希望能够使用 TOML 格式的配置文件来配置应用程序，以便以人类可读的方式管理配置。

#### 验收标准

1. 系统应当能够解析符合 TOML v1.0.0 规范的配置文件，支持所有 TOML 数据类型（字符串、整数、浮点数、布尔值、日期时间、数组、内联表、表）
2. 系统应当提供 pretty printer，将解析后的配置数据序列化为规范的 TOML 文本，保持键的字母顺序
3. 系统应当满足 round-trip 属性：对任意有效的 TOML 输入 x，`parse(print(parse(x))) == parse(x)`
4. 系统应当对无效的 TOML 输入返回错误信息，包含文件名、行号和具体的错误描述
```

#### 7.4.5 在设计文档中的对应要求

当需求文档中包含解析器需求时，设计文档的测试策略章节必须包含对应的属性测试规划：

```markdown
### 正确性属性（解析器相关）

1. **{格式}解析器的 Round-Trip 属性**（Round Trip）
   - 属性：对任意有效的{格式}输入 x，`parse(print(parse(x))) == parse(x)`
   - 测试方法：属性测试，使用 PBT 框架生成随机有效的{格式}文档，验证 round-trip 属性
   - 测试框架：{fast-check / Hypothesis / QuickCheck 等}

2. **{格式}解析器的错误处理**（Error Conditions）
   - 属性：对任意无效的{格式}输入，解析器应当返回错误而不是崩溃或返回错误结果
   - 测试方法：属性测试，生成随机的无效输入（随机字节序列、截断的有效输入等），验证解析器始终返回错误而不抛出未处理的异常
```

#### 7.4.6 常见错误和解决方法

**错误 1：解析器需求隐含在其他需求中**

```markdown
❌ 错误示例：
### 需求 2: 数据导入功能
#### 验收标准
1. 系统应当支持从 CSV 文件导入数据
2. 系统应当支持从 JSON 文件导入数据  ← 隐含了 JSON 解析器
```

```markdown
✅ 正确示例：
### 需求 2: 数据导入功能
#### 验收标准
1. 系统应当支持从 CSV 文件导入数据（参见需求 3：CSV 解析器）
2. 系统应当支持从 JSON 文件导入数据（参见需求 4：JSON 解析器）

### 需求 3: CSV 解析器
（完整的解析器需求，包含 pretty printer 和 round-trip 属性）

### 需求 4: JSON 解析器
（完整的解析器需求，包含 pretty printer 和 round-trip 属性）
```

**错误 2：缺少 pretty printer 需求**

```markdown
❌ 错误示例：
### 需求 5: XML 解析器
#### 验收标准
1. 系统应当能够解析符合 W3C XML 1.0 规范的 XML 文档
2. 系统应当对无效 XML 返回错误信息
← 缺少 pretty printer 需求和 round-trip 属性
```

```markdown
✅ 正确示例：
### 需求 5: XML 解析器
#### 验收标准
1. 系统应当能够解析符合 W3C XML 1.0 规范的 XML 文档
2. 系统应当提供 pretty printer，将 XML DOM 序列化为规范的 XML 文本
3. 系统应当满足 round-trip 属性：对任意有效的 XML 输入 x，parse(print(parse(x))) == parse(x)
4. 系统应当对无效 XML 返回包含行号和错误描述的错误信息
```

**错误 3：round-trip 属性描述不精确**

```markdown
❌ 错误示例：
3. 系统应当支持解析和序列化的互转
← 描述模糊，没有明确的数学属性
```

```markdown
✅ 正确示例：
3. 系统应当满足 round-trip 属性：对任意有效输入 x，parse(print(parse(x))) == parse(x)
← 精确的数学属性，可以直接转化为属性测试代码
```

#### 7.4.7 解析器需求检查清单

在完成包含解析器的需求文档后，使用以下检查清单验证：

- [ ] 所有解析器都作为独立的显式需求列出
- [ ] 每个解析器需求都引用了具体的语法规范
- [ ] 每个解析器需求都包含 pretty printer 验收标准
- [ ] 每个解析器需求都包含 round-trip 属性验收标准（`parse(print(parse(x))) == parse(x)`）
- [ ] 每个解析器需求都包含错误处理验收标准（无效输入的处理）
- [ ] 设计文档的测试策略章节包含对应的属性测试规划
- [ ] round-trip 属性的描述是精确的数学表达式，而非模糊描述

### 7.5 PBT vs 集成测试对比示例

以下示例展示了同一功能（用户名验证）分别用 PBT 和集成测试的不同写法，说明各自的优缺点。

#### 7.5.1 功能描述

用户名验证规则：
- 长度在 3 到 50 个字符之间
- 只允许字母、数字和连字符（`-`）
- 不能以连字符开头或结尾
- 不能包含连续的连字符

#### 7.5.2 使用 PBT 的写法

```typescript
import fc from 'fast-check';
import { validateUsername } from './auth';

describe('validateUsername - 属性测试', () => {
  // 属性 1：有效用户名始终通过验证（Invariant）
  // **Validates: Requirements 1.4**
  it('有效用户名始终通过验证', () => {
    // 生成符合规则的有效用户名
    const validUsernameArb = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'.split('')),
      { minLength: 3, maxLength: 50 }
    );

    fc.assert(
      fc.property(validUsernameArb, (username) => {
        return validateUsername(username) === true;
      })
    );
  });

  // 属性 2：过短的用户名始终失败（Error Conditions）
  // **Validates: Requirements 1.4**
  it('长度不足的用户名始终失败', () => {
    const shortUsernameArb = fc.stringOf(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      { minLength: 0, maxLength: 2 }
    );

    fc.assert(
      fc.property(shortUsernameArb, (username) => {
        return validateUsername(username) === false;
      })
    );
  });

  // 属性 3：包含非法字符的用户名始终失败（Error Conditions）
  // **Validates: Requirements 1.4**
  it('包含非法字符的用户名始终失败', () => {
    // 生成包含非法字符（如空格、@、#）的用户名
    const invalidCharArb = fc.constantFrom(' ', '@', '#', '!', '.', '_');
    const usernameWithInvalidCharArb = fc.tuple(
      fc.stringOf(fc.constantFrom(...'abc'.split('')), { minLength: 1, maxLength: 10 }),
      invalidCharArb,
      fc.stringOf(fc.constantFrom(...'abc'.split('')), { minLength: 1, maxLength: 10 })
    ).map(([prefix, invalid, suffix]) => prefix + invalid + suffix);

    fc.assert(
      fc.property(usernameWithInvalidCharArb, (username) => {
        return validateUsername(username) === false;
      })
    );
  });
});
```

**PBT 的优点**：
- 自动生成数百个测试用例，覆盖各种边界情况
- 发现手动测试难以想到的边界输入（如全数字用户名、最大长度用户名）
- 测试逻辑简洁，直接表达业务规则
- 代码演进时，属性测试持续有效

**PBT 的缺点**：
- 需要学习属性测试框架（如 fast-check、Hypothesis）
- 生成器的编写需要一定技巧
- 随机性可能导致偶发性失败（需要固定随机种子）
- 不适合验证具体的输出值

#### 7.5.3 使用集成测试的写法

```typescript
import { validateUsername } from './auth';

describe('validateUsername - 集成测试', () => {
  // 测试有效用户名
  describe('有效用户名', () => {
    it('应接受标准字母数字用户名', () => {
      expect(validateUsername('john123')).toBe(true);
    });

    it('应接受包含连字符的用户名', () => {
      expect(validateUsername('john-doe')).toBe(true);
    });

    it('应接受最短有效用户名（3 个字符）', () => {
      expect(validateUsername('abc')).toBe(true);
    });

    it('应接受最长有效用户名（50 个字符）', () => {
      expect(validateUsername('a'.repeat(50))).toBe(true);
    });
  });

  // 测试无效用户名
  describe('无效用户名', () => {
    it('应拒绝空字符串', () => {
      expect(validateUsername('')).toBe(false);
    });

    it('应拒绝过短的用户名（少于 3 个字符）', () => {
      expect(validateUsername('ab')).toBe(false);
    });

    it('应拒绝过长的用户名（超过 50 个字符）', () => {
      expect(validateUsername('a'.repeat(51))).toBe(false);
    });

    it('应拒绝包含空格的用户名', () => {
      expect(validateUsername('john doe')).toBe(false);
    });

    it('应拒绝以连字符开头的用户名', () => {
      expect(validateUsername('-john')).toBe(false);
    });

    it('应拒绝以连字符结尾的用户名', () => {
      expect(validateUsername('john-')).toBe(false);
    });

    it('应拒绝包含连续连字符的用户名', () => {
      expect(validateUsername('john--doe')).toBe(false);
    });
  });
});
```

**集成测试的优点**：
- 测试用例直观，易于理解和维护
- 明确验证具体的输入/输出对
- 不需要学习额外的框架
- 失败时容易定位问题（知道具体哪个输入失败了）

**集成测试的缺点**：
- 只测试了开发者想到的场景，可能遗漏边界情况
- 随着规则变化，需要手动更新测试用例
- 测试用例数量有限，覆盖率不如 PBT
- 难以发现意外的边界情况（如特殊 Unicode 字符）

#### 7.5.4 最佳实践：结合使用两种方法

对于核心业务逻辑，推荐**同时使用 PBT 和集成测试**：

- **PBT**：验证通用属性（如"有效输入始终通过"、"无效输入始终失败"）
- **集成测试**：验证具体的业务场景（如"以连字符开头的用户名被拒绝"）

```typescript
describe('validateUsername', () => {
  // 集成测试：验证具体场景
  it('应拒绝以连字符开头的用户名', () => {
    expect(validateUsername('-john')).toBe(false);
  });

  it('应接受标准用户名', () => {
    expect(validateUsername('john-doe')).toBe(true);
  });

  // PBT：验证通用属性
  it('有效用户名始终通过验证', () => {
    fc.assert(
      fc.property(validUsernameGenerator(), (username) => {
        return validateUsername(username) === true;
      })
    );
  });

  it('无效用户名始终被拒绝', () => {
    fc.assert(
      fc.property(invalidUsernameGenerator(), (username) => {
        return validateUsername(username) === false;
      })
    );
  });
});
```

这种组合方式既能验证具体的业务规则，又能通过随机测试发现意外的边界情况，是最全面的测试策略。


