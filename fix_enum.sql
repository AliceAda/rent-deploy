-- 修复数据库枚举值编码问题
-- 执行前请备份数据库

-- 1. account_cancel 表状态枚举修复
ALTER TABLE `account_cancel` 
MODIFY COLUMN `status` enum('待处理','已注销','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待处理';

-- 2. activity 表状态枚举修复
ALTER TABLE `activity` 
MODIFY COLUMN `status` enum('未开始','进行中','已结束') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未开始';

-- 3. ad_material 表状态枚举修复
ALTER TABLE `ad_material` 
MODIFY COLUMN `status` enum('草稿','投放中','已下架') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '草稿';

-- 4. booking 表状态枚举修复
ALTER TABLE `booking` 
MODIFY COLUMN `status` enum('待确认','已确认','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待确认';

-- 5. contract 表状态枚举修复（统一前端枚举）
ALTER TABLE `contract` 
MODIFY COLUMN `status` enum('草稿','待签订','生效中','已到期','已终止') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '草稿';

-- 6. contract 表终止类型枚举修复
ALTER TABLE `contract` 
MODIFY COLUMN `terminate_type` enum('正常退租','违约退租','协商解约') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL;

-- 7. content 表状态枚举修复
ALTER TABLE `content` 
MODIFY COLUMN `status` enum('草稿','已发布') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '草稿';

-- 8. finance_settlement 表状态枚举修复
ALTER TABLE `finance_settlement` 
MODIFY COLUMN `settle_status` enum('待结算','已结算','已提现','冻结') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待结算';

-- 9. house 表状态枚举修复
ALTER TABLE `house` 
MODIFY COLUMN `status` enum('可租','已租','待审核','违规','已下架') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待审核';

-- 10. lease_order 表状态枚举修复
ALTER TABLE `lease_order` 
MODIFY COLUMN `status` enum('待支付','已支付','已取消','已完成') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待支付';

-- 11. payment 表状态枚举修复
ALTER TABLE `payment` 
MODIFY COLUMN `status` enum('待支付','已支付','已退款','退款中','失败') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待支付';

-- 12. refund 表状态枚举修复
ALTER TABLE `refund` 
MODIFY COLUMN `status` enum('待处理','已处理','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待处理';

-- 13. review 表状态枚举修复
ALTER TABLE `review` 
MODIFY COLUMN `status` enum('待审核','已通过','未通过') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待审核';

-- 14. ticket 表状态枚举修复
ALTER TABLE `ticket` 
MODIFY COLUMN `status` enum('待受理','处理中','已完成','已关闭') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待受理';

-- 15. user 表认证状态枚举修复
ALTER TABLE `user` 
MODIFY COLUMN `cert_status` enum('未认证','待审核','已认证','未通过') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未认证';

-- 16. user 表账号状态枚举修复
ALTER TABLE `user` 
MODIFY COLUMN `account_status` enum('正常','冻结','封禁') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '正常';

-- 17. withdraw 表状态枚举修复
ALTER TABLE `withdraw` 
MODIFY COLUMN `status` enum('待审核','已打款','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待审核';

-- 18. agent_broker 表状态枚举修复
ALTER TABLE `agent_broker` 
MODIFY COLUMN `status` enum('正常','冻结') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '正常';

-- 19. realname_auth 表状态枚举修复
ALTER TABLE `realname_auth` 
MODIFY COLUMN `status` enum('未申请','待审核','已认证','已拒绝') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未申请';

-- 20. coupon 表状态枚举修复
ALTER TABLE `coupon` 
MODIFY COLUMN `status` enum('未激活','已激活','已过期') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未激活';

-- 21. user_coupon 表状态枚举修复
ALTER TABLE `user_coupon` 
MODIFY COLUMN `status` enum('未使用','已使用','已过期') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未使用';

-- 22. repair_order 表状态枚举修复
ALTER TABLE `repair_order` 
MODIFY COLUMN `status` enum('待处理','处理中','已完成','已关闭') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待处理';

-- 23. dispute 表状态枚举修复
ALTER TABLE `dispute` 
MODIFY COLUMN `status` enum('待受理','调解中','已裁决','已撤销','已关闭') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待受理';

-- 24. fee_bill 表状态枚举修复
ALTER TABLE `fee_bill` 
MODIFY COLUMN `status` enum('待支付','已支付','已豁免') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待支付';

-- 25. deposit_record 表状态枚举修复
ALTER TABLE `deposit_record` 
MODIFY COLUMN `status` enum('待结算','已完结算') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待结算';

-- 执行完成后验证
-- SELECT COLUMN_NAME, COLUMN_TYPE FROM information_schema.COLUMNS 
-- WHERE TABLE_SCHEMA = 'anju_rent' AND COLUMN_TYPE LIKE '%enum%';
