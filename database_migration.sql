-- =============================================
-- 安居易租数据库迁移脚本
-- 包含：外键约束 + 枚举修复 + 关联视图
-- 执行前请先备份数据库！
-- =============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =============================================
-- 第一部分：修复枚举值编码（25张表）
-- =============================================

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
MODIFY COLUMN `status` enum('待结算','已完结') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '待结算';

-- =============================================
-- 第二部分：添加外键约束（103个）
-- =============================================

ALTER TABLE `user_address` ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_collect` ADD CONSTRAINT `fk_collect_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_collect_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_session` ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_points` ADD CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_coupon` ADD CONSTRAINT `fk_ucoupon_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_ucoupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_notify_setting` ADD CONSTRAINT `fk_notify_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `realname_auth` ADD CONSTRAINT `fk_realname_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house` ADD CONSTRAINT `fk_house_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `house` ADD CONSTRAINT `fk_house_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `house` ADD CONSTRAINT `fk_house_building` FOREIGN KEY (`building_id`) REFERENCES `building` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `house` ADD CONSTRAINT `fk_house_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `house_image` ADD CONSTRAINT `fk_image_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_room` ADD CONSTRAINT `fk_room_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_facility` ADD CONSTRAINT `fk_hfacility_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_hfacility_facility` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_tag` ADD CONSTRAINT `fk_htag_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_htag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_metro_rel` ADD CONSTRAINT `fk_hmetro_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_hmetro_metro` FOREIGN KEY (`metro_id`) REFERENCES `metro_station` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_poi_rel` ADD CONSTRAINT `fk_hpoi_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_hpoi_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `lease_order` ADD CONSTRAINT `fk_order_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `lease_order` ADD CONSTRAINT `fk_order_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `lease_order` ADD CONSTRAINT `fk_order_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `lease_order` ADD CONSTRAINT `fk_order_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `contract` ADD CONSTRAINT `fk_contract_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contract` ADD CONSTRAINT `fk_contract_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contract` ADD CONSTRAINT `fk_contract_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `contract` ADD CONSTRAINT `fk_contract_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `contract` ADD CONSTRAINT `fk_contract_template` FOREIGN KEY (`template_id`) REFERENCES `contract_template` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `contract_attachment` ADD CONSTRAINT `fk_contract_attach` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contract_sign_log` ADD CONSTRAINT `fk_contract_sign` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `contract_status_log` ADD CONSTRAINT `fk_contract_status` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `booking` ADD CONSTRAINT `fk_booking_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `booking` ADD CONSTRAINT `fk_booking_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `booking` ADD CONSTRAINT `fk_booking_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `payment` ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `payment` ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `refund` ADD CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `refund` ADD CONSTRAINT `fk_refund_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `withdraw` ADD CONSTRAINT `fk_withdraw_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `finance_settlement` ADD CONSTRAINT `fk_settlement_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `finance_settlement` ADD CONSTRAINT `fk_settlement_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `review` ADD CONSTRAINT `fk_review_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `review` ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `review` ADD CONSTRAINT `fk_review_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `message` ADD CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `message` ADD CONSTRAINT `fk_message_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `message` ADD CONSTRAINT `fk_message_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `repair_order` ADD CONSTRAINT `fk_repair_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `repair_order` ADD CONSTRAINT `fk_repair_requester` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `repair_order` ADD CONSTRAINT `fk_repair_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ticket` ADD CONSTRAINT `fk_ticket_handler` FOREIGN KEY (`handler_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ticket_attachment` ADD CONSTRAINT `fk_ticket_attach` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ticket_log` ADD CONSTRAINT `fk_ticket_log` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `role_permission` ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_role` ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sys_dict_item` ADD CONSTRAINT `fk_dict_item_type` FOREIGN KEY (`type_id`) REFERENCES `sys_dict_type` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `house_price_history` ADD CONSTRAINT `fk_price_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_schedule` ADD CONSTRAINT `fk_schedule_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_view_history` ADD CONSTRAINT `fk_view_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_view_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `house_report` ADD CONSTRAINT `fk_report_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_report_user` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `content` ADD CONSTRAINT `fk_content_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `content_audit` ADD CONSTRAINT `fk_audit_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `blacklist` ADD CONSTRAINT `fk_blacklist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `risk_event` ADD CONSTRAINT `fk_risk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `risk_rule` ADD CONSTRAINT `fk_risk_rule_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `operate_log` ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `login_log` ADD CONSTRAINT `fk_login_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `sms_code` ADD CONSTRAINT `fk_sms_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `points_log` ADD CONSTRAINT `fk_pointslog_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `credit_log` ADD CONSTRAINT `fk_creditlog_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `invoice` ADD CONSTRAINT `fk_invoice_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `invoice_title` ADD CONSTRAINT `fk_invoicetitle_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `account_ledger` ADD CONSTRAINT `fk_ledger_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `deposit_record` ADD CONSTRAINT `fk_deposit_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_bill` ADD CONSTRAINT `fk_feebill_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `fee_bill` ADD CONSTRAINT `fk_feebill_tenant` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `landlord_bill` ADD CONSTRAINT `fk_lbill_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `landlord_bill` ADD CONSTRAINT `fk_lbill_landlord` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `sublease` ADD CONSTRAINT `fk_sublease_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_sublease_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `termination` ADD CONSTRAINT `fk_termination_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `lease_renewal` ADD CONSTRAINT `fk_renewal_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `dispute` ADD CONSTRAINT `fk_dispute_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `dispute` ADD CONSTRAINT `fk_dispute_complainant` FOREIGN KEY (`complainant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `dispute` ADD CONSTRAINT `fk_dispute_respondent` FOREIGN KEY (`respondent_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `checkin_record` ADD CONSTRAINT `fk_checkin_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `data_export_request` ADD CONSTRAINT `fk_export_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `scheduled_job` ADD CONSTRAINT `fk_job_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `search_log` ADD CONSTRAINT `fk_search_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `user_event` ADD CONSTRAINT `fk_event_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ad_material` ADD CONSTRAINT `fk_ad_material_slot` FOREIGN KEY (`slot_id`) REFERENCES `ad_slot` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `agent_broker` ADD CONSTRAINT `fk_broker_store` FOREIGN KEY (`store_id`) REFERENCES `agent_store` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `agent_store` ADD CONSTRAINT `fk_store_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `building` ADD CONSTRAINT `fk_building_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `department` ADD CONSTRAINT `fk_dept_parent` FOREIGN KEY (`parent_id`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `employee` ADD CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `employee` ADD CONSTRAINT `fk_emp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================
-- 第三部分：创建关联视图（15个）
-- =============================================

CREATE OR REPLACE VIEW `v_house_detail` AS
SELECT h.*, COUNT(DISTINCT hi.id) AS image_count, COUNT(DISTINCT uc.id) AS collect_count, AVG(r.score) AS avg_score, COUNT(DISTINCT r.id) AS review_count
FROM `house` h
LEFT JOIN `house_image` hi ON h.id = hi.house_id
LEFT JOIN `user_collect` uc ON h.id = uc.house_id
LEFT JOIN `review` r ON h.id = r.house_id AND r.status = '已通过'
GROUP BY h.id;

CREATE OR REPLACE VIEW `v_order_detail` AS
SELECT lo.*, h.title AS house_title, h.district AS house_district, h.price AS house_price, t.name AS tenant_name, t.phone AS tenant_phone, l.name AS landlord_name, l.phone AS landlord_phone
FROM `lease_order` lo
LEFT JOIN `house` h ON lo.house_id = h.id
LEFT JOIN `user` t ON lo.tenant_id = t.id
LEFT JOIN `user` l ON lo.landlord_id = l.id;

CREATE OR REPLACE VIEW `v_contract_detail` AS
SELECT c.*, h.title AS house_title, h.district AS house_district, t.name AS tenant_name, t.phone AS tenant_phone, l.name AS landlord_name, l.phone AS landlord_phone
FROM `contract` c
LEFT JOIN `house` h ON c.house_id = h.id
LEFT JOIN `user` t ON c.tenant_id = t.id
LEFT JOIN `user` l ON c.landlord_id = l.id;

CREATE OR REPLACE VIEW `v_booking_detail` AS
SELECT b.*, h.title AS house_title, h.district AS house_district, h.price AS house_price, t.name AS tenant_name, t.phone AS tenant_phone, l.name AS landlord_name, l.phone AS landlord_phone
FROM `booking` b
LEFT JOIN `house` h ON b.house_id = h.id
LEFT JOIN `user` t ON b.tenant_id = t.id
LEFT JOIN `user` l ON b.landlord_id = l.id;

CREATE OR REPLACE VIEW `v_payment_detail` AS
SELECT p.*, lo.order_no, lo.status AS order_status, h.title AS house_title, t.name AS user_name, t.phone AS user_phone
FROM `payment` p
LEFT JOIN `lease_order` lo ON p.order_id = lo.id
LEFT JOIN `house` h ON lo.house_id = h.id
LEFT JOIN `user` t ON p.user_id = t.id;

CREATE OR REPLACE VIEW `v_ticket_detail` AS
SELECT t.*, creator.name AS creator_name, creator.phone AS creator_phone, handler.name AS handler_name, handler.phone AS handler_phone
FROM `ticket` t
LEFT JOIN `user` creator ON t.creator_id = creator.id
LEFT JOIN `user` handler ON t.handler_id = handler.id;

CREATE OR REPLACE VIEW `v_finance_detail` AS
SELECT fs.*, lo.order_no, h.title AS house_title, l.name AS landlord_name, a.name AS agent_name
FROM `finance_settlement` fs
LEFT JOIN `lease_order` lo ON fs.order_id = lo.id
LEFT JOIN `house` h ON fs.house_id = h.id
LEFT JOIN `user` l ON fs.landlord_id = l.id
LEFT JOIN `agent_broker` a ON fs.agent_id = a.id;

CREATE OR REPLACE VIEW `v_house_stats` AS
SELECT h.id, h.title, h.district, h.price, h.status, COUNT(DISTINCT hi.id) AS image_count, COUNT(DISTINCT uc.id) AS collect_count, COUNT(DISTINCT hv.id) AS view_count, AVG(r.score) AS avg_score, COUNT(DISTINCT r.id) AS review_count
FROM `house` h
LEFT JOIN `house_image` hi ON h.id = hi.house_id
LEFT JOIN `user_collect` uc ON h.id = uc.house_id
LEFT JOIN `house_view_history` hv ON h.id = hv.house_id
LEFT JOIN `review` r ON h.id = r.house_id AND r.status = '已通过'
GROUP BY h.id;

CREATE OR REPLACE VIEW `v_user_stats` AS
SELECT u.id, u.name, u.phone, u.role, u.account_status, u.credit_score, COUNT(DISTINCT c.id) AS contract_count, COUNT(DISTINCT lo.id) AS order_count, COUNT(DISTINCT b.id) AS booking_count, COUNT(DISTINCT h.id) AS house_count
FROM `user` u
LEFT JOIN `contract` c ON u.id = c.tenant_id OR u.id = c.landlord_id
LEFT JOIN `lease_order` lo ON u.id = lo.tenant_id OR u.id = lo.landlord_id
LEFT JOIN `booking` b ON u.id = b.tenant_id OR u.id = b.landlord_id
LEFT JOIN `house` h ON u.id = h.landlord_id
GROUP BY u.id;

CREATE OR REPLACE VIEW `v_agent_stats` AS
SELECT ab.id, ab.name, ab.phone, ab.level, ab.status, ast.name AS store_name, COUNT(DISTINCT h.id) AS house_count, COUNT(DISTINCT lo.id) AS order_count, COUNT(DISTINCT c.id) AS contract_count, SUM(lo.amount) AS total_amount
FROM `agent_broker` ab
LEFT JOIN `agent_store` ast ON ab.store_id = ast.id
LEFT JOIN `house` h ON ab.id = h.agent_id
LEFT JOIN `lease_order` lo ON ab.id = lo.agent_id
LEFT JOIN `contract` c ON ab.id = c.agent_id
GROUP BY ab.id;

CREATE OR REPLACE VIEW `v_landlord_stats` AS
SELECT u.id, u.name, u.phone, COUNT(DISTINCT h.id) AS house_count, COUNT(DISTINCT c.id) AS contract_count, COUNT(DISTINCT lo.id) AS order_count, SUM(lo.amount) AS total_amount, AVG(c.monthly_rent) AS avg_rent
FROM `user` u
LEFT JOIN `house` h ON u.id = h.landlord_id
LEFT JOIN `contract` c ON u.id = c.landlord_id
LEFT JOIN `lease_order` lo ON u.id = lo.landlord_id
WHERE u.role = 'landlord'
GROUP BY u.id;

CREATE OR REPLACE VIEW `v_order_status_log` AS
SELECT los.*, lo.order_no, lo.status AS current_status, u.name AS operator_name
FROM `lease_order_status_log` los
LEFT JOIN `lease_order` lo ON los.order_id = lo.id
LEFT JOIN `user` u ON los.operator_id = u.id;

CREATE OR REPLACE VIEW `v_contract_status_log` AS
SELECT csl.*, c.contract_no, c.status AS current_status, u.name AS operator_name
FROM `contract_status_log` csl
LEFT JOIN `contract` c ON csl.contract_id = c.id
LEFT JOIN `user` u ON csl.operator_id = u.id;

CREATE OR REPLACE VIEW `v_house_audit_log` AS
SELECT hal.*, h.title AS house_title, h.district, u.name AS operator_name
FROM `house_audit_log` hal
LEFT JOIN `house` h ON hal.house_id = h.id
LEFT JOIN `user` u ON hal.operator_id = u.id;

CREATE OR REPLACE VIEW `v_operate_log` AS
SELECT ol.*, u.name AS operator_name, u.phone AS operator_phone
FROM `operate_log` ol
LEFT JOIN `user` u ON ol.user_id = u.id;

SET FOREIGN_KEY_CHECKS = 1;

-- 验证 SQL
-- SELECT TABLE_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'anju_rent' AND REFERENCED_TABLE_NAME IS NOT NULL;
-- SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
