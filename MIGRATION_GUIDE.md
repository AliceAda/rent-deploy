# 数据库迁移执行指南

## 📋 合并后的迁移文件

已将三个 SQL 文件合并为一个：
- `database_migration.sql`（331 行）

**包含内容：**
1. **第一部分**：枚举值修复（25 张表）
2. **第二部分**：外键约束添加（103 个）
3. **第三部分**：关联视图创建（15 个）

---

## 🚀 执行方式

### 方式1：Navicat/DBeaver（推荐）

```
1. 连接数据库：
   - 主机：192.168.254.156
   - 端口：3306
   - 用户：root
   - 密码：123456
   - 数据库：anju_rent

2. 执行 SQL：
   - 右键数据库 → 运行 SQL 文件
   - 选择：database_migration.sql
   - 点击「开始执行」

3. 验证结果：
   - 检查外键：SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'anju_rent' AND REFERENCED_TABLE_NAME IS NOT NULL;
   - 检查视图：SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

### 方式2：MySQL 命令行

```bash
# 执行迁移
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < database_migration.sql

# 输入密码：123456
```

### 方式3：Python 脚本

```python
import mysql.connector
import os

# 连接数据库
conn = mysql.connector.connect(
    host='192.168.254.156',
    port=3306,
    user='root',
    password='123456',
    database='anju_rent'
)

cursor = conn.cursor()

# 读取 SQL 文件
sql_file = 'database_migration.sql'
with open(sql_file, 'r', encoding='utf-8') as f:
    sql_content = f.read()

# 执行 SQL（分语句执行）
sql_statements = sql_content.split(';')
for stmt in sql_statements:
    stmt = stmt.strip()
    if stmt and not stmt.startswith('--'):
        try:
            cursor.execute(stmt)
            print(f'Executed: {stmt[:50]}...')
        except Exception as e:
            print(f'Error: {e}')
            print(f'Statement: {stmt}')

conn.commit()
cursor.close()
conn.close()
print('Migration completed!')
```

---

## ⚠️ 执行前检查

### 1. 备份数据库
```bash
# 使用 mysqldump 备份
mysqldump -h 192.168.254.156 -P 3306 -u root -p anju_rent > anju_rent_backup_$(date +%Y%m%d_%H%M%S).sql

# 或使用 Navicat：
# 右键数据库 → 转储 SQL 文件
```

### 2. 检查现有数据
```sql
-- 检查 contract 表的现有状态值
SELECT DISTINCT status FROM contract;

-- 检查 house 表的现有状态值
SELECT DISTINCT status FROM house;

-- 如果有旧值，先转换
UPDATE contract SET status = '已终止' WHERE status IN ('退租中', '已解除');
UPDATE contract SET status = '待签订' WHERE status = '待签';
```

---

## ✅ 执行后验证

### 1. 验证外键约束
```sql
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'anju_rent' 
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
-- 应该返回 103 条记录
```

### 2. 验证视图
```sql
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
-- 应该返回 15 个视图
```

### 3. 验证枚举值
```sql
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'anju_rent' 
AND COLUMN_TYPE LIKE '%enum%'
ORDER BY TABLE_NAME, COLUMN_NAME;
```

### 4. 测试关联查询
```sql
-- 测试房源详情视图
SELECT * FROM v_house_detail LIMIT 5;

-- 测试订单详情视图
SELECT * FROM v_order_detail LIMIT 5;

-- 测试合同详情视图
SELECT * FROM v_contract_detail LIMIT 5;
```

---

## 🐛 常见问题处理

### Q1: 外键约束失败
```
错误：Cannot add foreign key constraint
原因：关联表不存在或字段类型不匹配
解决：
1. 检查引用表是否存在
2. 检查字段类型是否一致
3. 检查数据是否满足外键约束
```

### Q2: 枚举值转换失败
```
错误：Out of range value for column
原因：现有数据值不在新枚举范围内
解决：
1. 查询现有数据：SELECT DISTINCT status FROM table;
2. 如有旧值，先更新为新值
3. 再执行 ALTER TABLE
```

### Q3: 视图创建失败
```
错误：View's SELECT contains a subquery in the FROM clause
解决：简化视图定义或使用临时表
```

---

## 📊 执行统计

| 项目 | 数量 |
|------|------|
| 枚举修复 | 25 张表 |
| 外键约束 | 103 个 |
| 关联视图 | 15 个 |
| SQL 行数 | 331 行 |

---

**执行时间**: 预计 5-10 分钟
**数据安全性**: 只添加约束和视图，不删除数据
