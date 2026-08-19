# 远程数据库连接与执行方案

## 一、当前环境检查

### 本地环境
- **操作系统**: Windows
- **当前状态**: 未安装 MySQL 客户端
- **plink**: 未安装

### 远程数据库
- **地址**: 192.168.254.156
- **端口**: 3306
- **数据库**: anju_rent
- **用户**: root
- **密码**: 123456

---

## 二、执行方案（推荐顺序）

### 方案1：使用 Navicat/DBeaver（推荐）
最安全、可视化的方式

```
步骤：
1. 打开 Navicat/DBeaver
2. 新建 MySQL 连接
   - 主机: 192.168.254.156
   - 端口: 3306
   - 用户名: root
   - 密码: 123456
3. 连接到 anju_rent 数据库
4. 右键数据库 → 运行 SQL 文件
5. 依次执行以下文件：
   - add_foreign_keys.sql
   - fix_enum.sql
   - create_views.sql
```

### 方案2：安装 MySQL 客户端
```bash
# 方式1：安装 MySQL Workbench
# 下载：https://dev.mysql.com/downloads/workbench/

# 方式2：安装 MySQL Connector/CLI
# 下载：https://dev.mysql.com/downloads/installer/

# 安装后执行：
cd D:\Project\rent-deploy
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < add_foreign_keys.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < fix_enum.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < create_views.sql
```

### 方案3：使用 Python 脚本（需要安装 mysql-connector）
```python
# 安装依赖
pip install mysql-connector-python

# 执行脚本
python execute_sql.py
```

---

## 三、执行前准备

### 1. 备份数据库
```sql
-- 在 Navicat/DBeaver 中执行
-- 右键数据库 anju_rent → 转储 SQL 文件
-- 保存为：anju_rent_backup_20260819.sql
```

### 2. 检查现有数据
```sql
-- 检查 contract 表的状态值
SELECT DISTINCT status FROM contract;

-- 检查 house 表的状态值
SELECT DISTINCT status FROM house;

-- 检查是否有需要转换的旧枚举值
SELECT status, COUNT(*) as count 
FROM contract 
GROUP BY status;
```

### 3. 如需转换旧枚举值
```sql
-- 将旧值转换为新值
UPDATE contract 
SET status = '已终止' 
WHERE status IN ('退租中', '已解除');

UPDATE contract 
SET status = '待签订' 
WHERE status = '待签';
```

---

## 四、执行顺序与验证

### 第一步：添加外键约束
```sql
-- 执行文件
add_foreign_keys.sql

-- 验证
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'anju_rent' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### 第二步：修复枚举值
```sql
-- 执行文件
fix_enum.sql

-- 验证
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'anju_rent' 
AND COLUMN_TYPE LIKE '%enum%';
```

### 第三步：创建视图
```sql
-- 执行文件
create_views.sql

-- 验证
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

---

## 五、如果 plink 可用（SSH 隧道方式）

### 1. 安装 plink
```bash
# 下载 plink
# https://www.chiark.greenend.org.uk/~sgtatham/putty/latest.html
# 或者使用 Chocolatey
choco install putty
```

### 2. 创建 SSH 隧道
```bash
# 创建隧道（保持终端开启）
plink -L 3307:192.168.254.156:3306 root@your_ssh_server -N
```

### 3. 通过隧道连接
```bash
mysql -h 127.0.0.1 -P 3307 -u root -p anju_rent < add_foreign_keys.sql
```

---

## 六、推荐执行流程

```
┌─────────────────────────────────────────────────────────┐
│  1. 备份数据库（重要！）                                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  2. 检查现有数据，确认枚举值状态                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  3. 执行 add_foreign_keys.sql                           │
│     - 添加 103 个外键约束                                 │
│     - 验证：SELECT FROM information_schema...            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  4. 执行 fix_enum.sql                                   │
│     - 修复 25 张表的枚举值                                │
│     - 验证：SELECT COLUMN_TYPE FROM information_schema.. │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  5. 执行 create_views.sql                               │
│     - 创建 15 个视图                                      │
│     - 验证：SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW'   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  6. 验证所有操作成功                                      │
│     - 检查外键约束                                        │
│     - 检查视图创建                                        │
│     - 测试关联查询                                        │
└─────────────────────────────────────────────────────────┘
```

---

## 七、验证 SQL 脚本

### 验证外键
```sql
SELECT 
  TABLE_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'anju_rent' 
AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
```

### 验证视图
```sql
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

### 验证枚举
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

### 测试关联查询
```sql
-- 测试房源详情视图
SELECT * FROM v_house_detail LIMIT 5;

-- 测试订单详情视图
SELECT * FROM v_order_detail LIMIT 5;

-- 测试合同详情视图
SELECT * FROM v_contract_detail LIMIT 5;
```

---

## 八、常见问题处理

### Q1: 外键约束失败
```
错误：Cannot add foreign key constraint
原因：关联表不存在或字段类型不匹配
解决：
1. 检查引用表是否存在
2. 检查字段类型是否一致
3. 检查数据是否满足外键约束（引用值必须存在）
```

### Q2: 枚举值转换失败
```
错误：Out of range value for column
原因：现有数据值不在新枚举范围内
解决：
1. 先查询现有数据：SELECT DISTINCT status FROM table;
2. 如有旧值，先更新为新值
3. 再执行 ALTER TABLE
```

### Q3: 视图创建失败
```
错误：View's SELECT contains a subquery in the FROM clause
原因：视图定义复杂
解决：
1. 检查视图定义语法
2. 简化视图查询
3. 或改用临时表/存储过程
```

---

## 九、执行命令汇总

### 使用 Navicat/DBeaver
```
1. 连接数据库：192.168.254.156:3306
2. 选择数据库：anju_rent
3. 右键 → 运行 SQL 文件
4. 依次选择：
   - add_foreign_keys.sql
   - fix_enum.sql
   - create_views.sql
```

### 使用 MySQL 命令行（需先安装）
```bash
# 方式1：逐个执行
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < add_foreign_keys.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < fix_enum.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < create_views.sql

# 方式2：批量执行（创建批处理文件）
@echo off
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < add_foreign_keys.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < fix_enum.sql
mysql -h 192.168.254.156 -P 3306 -u root -p anju_rent < create_views.sql
pause
```

---

**建议**: 优先使用 Navicat/DBeaver 执行，可视化操作更安全方便！
