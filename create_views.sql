-- 创建关联数据查询视图

-- 1. 房源详情视图
CREATE OR REPLACE VIEW `v_house_detail` AS
SELECT 
  h.*,
  COUNT(DISTINCT hi.id) AS image_count,
  COUNT(DISTINCT uc.id) AS collect_count,
  AVG(r.score) AS avg_score,
  COUNT(DISTINCT r.id) AS review_count
FROM `house` h
LEFT JOIN `house_image` hi ON h.id = hi.house_id
LEFT JOIN `user_collect` uc ON h.id = uc.house_id
LEFT JOIN `review` r ON h.id = r.house_id AND r.status = '已通过'
GROUP BY h.id;

-- 2. 订单详情视图
CREATE OR REPLACE VIEW `v_order_detail` AS
SELECT 
  lo.*,
  h.title AS house_title,
  h.district AS house_district,
  h.price AS house_price,
  t.name AS tenant_name,
  t.phone AS tenant_phone,
  l.name AS landlord_name,
  l.phone AS landlord_phone
FROM `lease_order` lo
LEFT JOIN `house` h ON lo.house_id = h.id
LEFT JOIN `user` t ON lo.tenant_id = t.id
LEFT JOIN `user` l ON lo.landlord_id = l.id;

-- 3. 合同详情视图
CREATE OR REPLACE VIEW `v_contract_detail` AS
SELECT 
  c.*,
  h.title AS house_title,
  h.district AS house_district,
  t.name AS tenant_name,
  t.phone AS tenant_phone,
  l.name AS landlord_name,
  l.phone AS landlord_phone
FROM `contract` c
LEFT JOIN `house` h ON c.house_id = h.id
LEFT JOIN `user` t ON c.tenant_id = t.id
LEFT JOIN `user` l ON c.landlord_id = l.id;

-- 4. 预约详情视图
CREATE OR REPLACE VIEW `v_booking_detail` AS
SELECT 
  b.*,
  h.title AS house_title,
  h.district AS house_district,
  h.price AS house_price,
  t.name AS tenant_name,
  t.phone AS tenant_phone,
  l.name AS landlord_name,
  l.phone AS landlord_phone
FROM `booking` b
LEFT JOIN `house` h ON b.house_id = h.id
LEFT JOIN `user` t ON b.tenant_id = t.id
LEFT JOIN `user` l ON b.landlord_id = l.id;

-- 5. 支付详情视图
CREATE OR REPLACE VIEW `v_payment_detail` AS
SELECT 
  p.*,
  lo.order_no,
  lo.status AS order_status,
  h.title AS house_title,
  t.name AS user_name,
  t.phone AS user_phone
FROM `payment` p
LEFT JOIN `lease_order` lo ON p.order_id = lo.id
LEFT JOIN `house` h ON lo.house_id = h.id
LEFT JOIN `user` t ON p.user_id = t.id;

-- 6. 工单详情视图
CREATE OR REPLACE VIEW `v_ticket_detail` AS
SELECT 
  t.*,
  creator.name AS creator_name,
  creator.phone AS creator_phone,
  handler.name AS handler_name,
  handler.phone AS handler_phone
FROM `ticket` t
LEFT JOIN `user` creator ON t.creator_id = creator.id
LEFT JOIN `user` handler ON t.handler_id = handler.id;

-- 7. 财务结算视图
CREATE OR REPLACE VIEW `v_finance_detail` AS
SELECT 
  fs.*,
  lo.order_no,
  h.title AS house_title,
  l.name AS landlord_name,
  a.name AS agent_name
FROM `finance_settlement` fs
LEFT JOIN `lease_order` lo ON fs.order_id = lo.id
LEFT JOIN `house` h ON fs.house_id = h.id
LEFT JOIN `user` l ON fs.landlord_id = l.id
LEFT JOIN `agent_broker` a ON fs.agent_id = a.id;

-- 8. 房源统计视图
CREATE OR REPLACE VIEW `v_house_stats` AS
SELECT 
  h.id,
  h.title,
  h.district,
  h.price,
  h.status,
  COUNT(DISTINCT hi.id) AS image_count,
  COUNT(DISTINCT uc.id) AS collect_count,
  COUNT(DISTINCT hv.id) AS view_count,
  AVG(r.score) AS avg_score,
  COUNT(DISTINCT r.id) AS review_count
FROM `house` h
LEFT JOIN `house_image` hi ON h.id = hi.house_id
LEFT JOIN `user_collect` uc ON h.id = uc.house_id
LEFT JOIN `house_view_history` hv ON h.id = hv.house_id
LEFT JOIN `review` r ON h.id = r.house_id AND r.status = '已通过'
GROUP BY h.id;

-- 9. 用户统计视图
CREATE OR REPLACE VIEW `v_user_stats` AS
SELECT 
  u.id,
  u.name,
  u.phone,
  u.role,
  u.account_status,
  u.credit_score,
  COUNT(DISTINCT c.id) AS contract_count,
  COUNT(DISTINCT lo.id) AS order_count,
  COUNT(DISTINCT b.id) AS booking_count,
  COUNT(DISTINCT h.id) AS house_count
FROM `user` u
LEFT JOIN `contract` c ON u.id = c.tenant_id OR u.id = c.landlord_id
LEFT JOIN `lease_order` lo ON u.id = lo.tenant_id OR u.id = lo.landlord_id
LEFT JOIN `booking` b ON u.id = b.tenant_id OR u.id = b.landlord_id
LEFT JOIN `house` h ON u.id = h.landlord_id
GROUP BY u.id;

-- 10. 经纪人统计视图
CREATE OR REPLACE VIEW `v_agent_stats` AS
SELECT 
  ab.id,
  ab.name,
  ab.phone,
  ab.level,
  ab.status,
  ast.name AS store_name,
  COUNT(DISTINCT h.id) AS house_count,
  COUNT(DISTINCT lo.id) AS order_count,
  COUNT(DISTINCT c.id) AS contract_count,
  SUM(lo.amount) AS total_amount
FROM `agent_broker` ab
LEFT JOIN `agent_store` ast ON ab.store_id = ast.id
LEFT JOIN `house` h ON ab.id = h.agent_id
LEFT JOIN `lease_order` lo ON ab.id = lo.agent_id
LEFT JOIN `contract` c ON ab.id = c.agent_id
GROUP BY ab.id;

-- 11. 房东统计视图
CREATE OR REPLACE VIEW `v_landlord_stats` AS
SELECT 
  u.id,
  u.name,
  u.phone,
  COUNT(DISTINCT h.id) AS house_count,
  COUNT(DISTINCT c.id) AS contract_count,
  COUNT(DISTINCT lo.id) AS order_count,
  SUM(lo.amount) AS total_amount,
  AVG(c.monthly_rent) AS avg_rent
FROM `user` u
LEFT JOIN `house` h ON u.id = h.landlord_id
LEFT JOIN `contract` c ON u.id = c.landlord_id
LEFT JOIN `lease_order` lo ON u.id = lo.landlord_id
WHERE u.role = 'landlord'
GROUP BY u.id;

-- 12. 订单状态日志视图
CREATE OR REPLACE VIEW `v_order_status_log` AS
SELECT 
  los.*,
  lo.order_no,
  lo.status AS current_status,
  u.name AS operator_name
FROM `lease_order_status_log` los
LEFT JOIN `lease_order` lo ON los.order_id = lo.id
LEFT JOIN `user` u ON los.operator_id = u.id;

-- 13. 合同状态日志视图
CREATE OR REPLACE VIEW `v_contract_status_log` AS
SELECT 
  csl.*,
  c.contract_no,
  c.status AS current_status,
  u.name AS operator_name
FROM `contract_status_log` csl
LEFT JOIN `contract` c ON csl.contract_id = c.id
LEFT JOIN `user` u ON csl.operator_id = u.id;

-- 14. 房源审核日志视图
CREATE OR REPLACE VIEW `v_house_audit_log` AS
SELECT 
  hal.*,
  h.title AS house_title,
  h.district,
  u.name AS operator_name
FROM `house_audit_log` hal
LEFT JOIN `house` h ON hal.house_id = h.id
LEFT JOIN `user` u ON hal.operator_id = u.id;

-- 15. 操作日志视图
CREATE OR REPLACE VIEW `v_operate_log` AS
SELECT 
  ol.*,
  u.name AS operator_name,
  u.phone AS operator_phone
FROM `operate_log` ol
LEFT JOIN `user` u ON ol.user_id = u.id;
