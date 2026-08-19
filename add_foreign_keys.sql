-- 为所有表添加关联数据（外键约束）
-- 执行前请确保已导入基础数据

SET FOREIGN_KEY_CHECKS = 0;

-- 1. user 表关联（无外键，作为基础表）

-- 2. user_address 关联 user
ALTER TABLE `user_address` 
ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. user_collect 关联 user 和 house
ALTER TABLE `user_collect` 
ADD CONSTRAINT `fk_collect_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_collect_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. user_session 关联 user
ALTER TABLE `user_session` 
ADD CONSTRAINT `fk_session_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. user_points 关联 user
ALTER TABLE `user_points` 
ADD CONSTRAINT `fk_points_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. user_coupon 关联 user 和 coupon
ALTER TABLE `user_coupon` 
ADD CONSTRAINT `fk_ucoupon_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_ucoupon_coupon` FOREIGN KEY (`coupon_id`) REFERENCES `coupon` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 7. user_notify_setting 关联 user
ALTER TABLE `user_notify_setting` 
ADD CONSTRAINT `fk_notify_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 8. realname_auth 关联 user
ALTER TABLE `realname_auth` 
ADD CONSTRAINT `fk_realname_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. house 关联 user (landlord)
ALTER TABLE `house` 
ADD CONSTRAINT `fk_house_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. house 关联 agent
ALTER TABLE `house` 
ADD CONSTRAINT `fk_house_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 11. house 关联 building
ALTER TABLE `house` 
ADD CONSTRAINT `fk_house_building` FOREIGN KEY (`building_id`) REFERENCES `building` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 12. house 关联 region
ALTER TABLE `house` 
ADD CONSTRAINT `fk_house_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 13. house_image 关联 house
ALTER TABLE `house_image` 
ADD CONSTRAINT `fk_image_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 14. house_room 关联 house
ALTER TABLE `house_room` 
ADD CONSTRAINT `fk_room_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 15. house_facility 关联 house 和 facility
ALTER TABLE `house_facility` 
ADD CONSTRAINT `fk_hfacility_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_hfacility_facility` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 16. house_tag 关联 house 和 tag
ALTER TABLE `house_tag` 
ADD CONSTRAINT `fk_htag_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_htag_tag` FOREIGN KEY (`tag_id`) REFERENCES `tag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 17. house_metro_rel 关联 house 和 metro_station
ALTER TABLE `house_metro_rel` 
ADD CONSTRAINT `fk_hmetro_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_hmetro_metro` FOREIGN KEY (`metro_id`) REFERENCES `metro_station` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 18. house_poi_rel 关联 house 和 poi
ALTER TABLE `house_poi_rel` 
ADD CONSTRAINT `fk_hpoi_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_hpoi_poi` FOREIGN KEY (`poi_id`) REFERENCES `poi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 19. lease_order 关联 house
ALTER TABLE `lease_order` 
ADD CONSTRAINT `fk_order_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 20. lease_order 关联 tenant (user)
ALTER TABLE `lease_order` 
ADD CONSTRAINT `fk_order_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 21. lease_order 关联 landlord (user)
ALTER TABLE `lease_order` 
ADD CONSTRAINT `fk_order_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 22. lease_order 关联 agent
ALTER TABLE `lease_order` 
ADD CONSTRAINT `fk_order_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 23. contract 关联 house
ALTER TABLE `contract` 
ADD CONSTRAINT `fk_contract_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 24. contract 关联 tenant (user)
ALTER TABLE `contract` 
ADD CONSTRAINT `fk_contract_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 25. contract 关联 landlord (user)
ALTER TABLE `contract` 
ADD CONSTRAINT `fk_contract_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 26. contract 关联 agent
ALTER TABLE `contract` 
ADD CONSTRAINT `fk_contract_agent` FOREIGN KEY (`agent_id`) REFERENCES `agent_broker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 27. contract 关联 template
ALTER TABLE `contract` 
ADD CONSTRAINT `fk_contract_template` FOREIGN KEY (`template_id`) REFERENCES `contract_template` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 28. contract_attachment 关联 contract
ALTER TABLE `contract_attachment` 
ADD CONSTRAINT `fk_contract_attach` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 29. contract_sign_log 关联 contract
ALTER TABLE `contract_sign_log` 
ADD CONSTRAINT `fk_contract_sign` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 30. contract_status_log 关联 contract
ALTER TABLE `contract_status_log` 
ADD CONSTRAINT `fk_contract_status` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 31. booking 关联 house
ALTER TABLE `booking` 
ADD CONSTRAINT `fk_booking_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 32. booking 关联 tenant (user)
ALTER TABLE `booking` 
ADD CONSTRAINT `fk_booking_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 33. booking 关联 landlord (user)
ALTER TABLE `booking` 
ADD CONSTRAINT `fk_booking_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 34. payment 关联 lease_order
ALTER TABLE `payment` 
ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 35. payment 关联 user
ALTER TABLE `payment` 
ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 36. refund 关联 lease_order
ALTER TABLE `refund` 
ADD CONSTRAINT `fk_refund_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 37. refund 关联 user
ALTER TABLE `refund` 
ADD CONSTRAINT `fk_refund_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 38. withdraw 关联 user
ALTER TABLE `withdraw` 
ADD CONSTRAINT `fk_withdraw_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 39. finance_settlement 关联 lease_order
ALTER TABLE `finance_settlement` 
ADD CONSTRAINT `fk_settlement_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 40. finance_settlement 关联 contract
ALTER TABLE `finance_settlement` 
ADD CONSTRAINT `fk_settlement_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 41. review 关联 house
ALTER TABLE `review` 
ADD CONSTRAINT `fk_review_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 42. review 关联 user (reviewer)
ALTER TABLE `review` 
ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 43. review 关联 contract
ALTER TABLE `review` 
ADD CONSTRAINT `fk_review_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 44. message 关联 sender (user)
ALTER TABLE `message` 
ADD CONSTRAINT `fk_message_sender` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 45. message 关联 receiver (user)
ALTER TABLE `message` 
ADD CONSTRAINT `fk_message_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 46. message 关联 house (可选)
ALTER TABLE `message` 
ADD CONSTRAINT `fk_message_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 47. repair_order 关联 house
ALTER TABLE `repair_order` 
ADD CONSTRAINT `fk_repair_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 48. repair_order 关联 user (requester)
ALTER TABLE `repair_order` 
ADD CONSTRAINT `fk_repair_requester` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 49. repair_order 关联 landlord (user)
ALTER TABLE `repair_order` 
ADD CONSTRAINT `fk_repair_landlord` FOREIGN KEY (`landlord_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 50. ticket 关联 user (creator)
ALTER TABLE `ticket` 
ADD CONSTRAINT `fk_ticket_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 51. ticket 关联 user (handler)
ALTER TABLE `ticket` 
ADD CONSTRAINT `fk_ticket_handler` FOREIGN KEY (`handler_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 52. ticket_attachment 关联 ticket
ALTER TABLE `ticket_attachment` 
ADD CONSTRAINT `fk_ticket_attach` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 53. ticket_log 关联 ticket
ALTER TABLE `ticket_log` 
ADD CONSTRAINT `fk_ticket_log` FOREIGN KEY (`ticket_id`) REFERENCES `ticket` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 54. role_permission 关联 role 和 permission
ALTER TABLE `role_permission` 
ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 55. user_role 关联 user 和 role
ALTER TABLE `user_role` 
ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 56. sys_dict_item 关联 sys_dict_type
ALTER TABLE `sys_dict_item` 
ADD CONSTRAINT `fk_dict_item_type` FOREIGN KEY (`type_id`) REFERENCES `sys_dict_type` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 57. house_price_history 关联 house
ALTER TABLE `house_price_history` 
ADD CONSTRAINT `fk_price_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 58. house_schedule 关联 house
ALTER TABLE `house_schedule` 
ADD CONSTRAINT `fk_schedule_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 59. house_view_history 关联 house 和 user
ALTER TABLE `house_view_history` 
ADD CONSTRAINT `fk_view_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_view_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 60. house_report 关联 house 和 user
ALTER TABLE `house_report` 
ADD CONSTRAINT `fk_report_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_report_user` FOREIGN KEY (`reporter_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 61. content 关联 user (creator)
ALTER TABLE `content` 
ADD CONSTRAINT `fk_content_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 62. content_audit 关联 content
ALTER TABLE `content_audit` 
ADD CONSTRAINT `fk_audit_content` FOREIGN KEY (`content_id`) REFERENCES `content` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 63. blacklist 关联 user
ALTER TABLE `blacklist` 
ADD CONSTRAINT `fk_blacklist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 64. risk_event 关联 user
ALTER TABLE `risk_event` 
ADD CONSTRAINT `fk_risk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 65. risk_rule 关联 user (creator)
ALTER TABLE `risk_rule` 
ADD CONSTRAINT `fk_risk_rule_creator` FOREIGN KEY (`creator_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 66. operate_log 关联 user
ALTER TABLE `operate_log` 
ADD CONSTRAINT `fk_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 67. login_log 关联 user
ALTER TABLE `login_log` 
ADD CONSTRAINT `fk_login_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 68. sms_code 关联 user
ALTER TABLE `sms_code` 
ADD CONSTRAINT `fk_sms_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 69. points_log 关联 user
ALTER TABLE `points_log` 
ADD CONSTRAINT `fk_pointslog_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 70. credit_log 关联 user
ALTER TABLE `credit_log` 
ADD CONSTRAINT `fk_creditlog_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 71. invoice 关联 user
ALTER TABLE `invoice` 
ADD CONSTRAINT `fk_invoice_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 72. invoice_title 关联 user
ALTER TABLE `invoice_title` 
ADD CONSTRAINT `fk_invoicetitle_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 73. account_ledger 关联 user
ALTER TABLE `account_ledger` 
ADD CONSTRAINT `fk_ledger_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 74. deposit_record 关联 lease_order
ALTER TABLE `deposit_record` 
ADD CONSTRAINT `fk_deposit_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 75. fee_bill 关联 house
ALTER TABLE `fee_bill` 
ADD CONSTRAINT `fk_feebill_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 76. fee_bill 关联 user (tenant)
ALTER TABLE `fee_bill` 
ADD CONSTRAINT `fk_feebill_tenant` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 77. landlord_bill 关联 house
ALTER TABLE `landlord_bill` 
ADD CONSTRAINT `fk_lbill_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 78. landlord_bill 关联 user (landlord)
ALTER TABLE `landlord_bill` 
ADD CONSTRAINT `fk_lbill_landlord` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 79. sublease 关联 house 和 user
ALTER TABLE `sublease` 
ADD CONSTRAINT `fk_sublease_house` FOREIGN KEY (`house_id`) REFERENCES `house` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_sublease_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 80. termination 关联 contract
ALTER TABLE `termination` 
ADD CONSTRAINT `fk_termination_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 81. lease_renewal 关联 contract
ALTER TABLE `lease_renewal` 
ADD CONSTRAINT `fk_renewal_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 82. dispute 关联 lease_order
ALTER TABLE `dispute` 
ADD CONSTRAINT `fk_dispute_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 83. dispute 关联 user (complainant)
ALTER TABLE `dispute` 
ADD CONSTRAINT `fk_dispute_complainant` FOREIGN KEY (`complainant_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 84. dispute 关联 user (respondent)
ALTER TABLE `dispute` 
ADD CONSTRAINT `fk_dispute_respondent` FOREIGN KEY (`respondent_id`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 85. checkin_record 关联 lease_order
ALTER TABLE `checkin_record` 
ADD CONSTRAINT `fk_checkin_order` FOREIGN KEY (`order_id`) REFERENCES `lease_order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 86. data_export_request 关联 user
ALTER TABLE `data_export_request` 
ADD CONSTRAINT `fk_export_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 87. scheduled_job 关联 user (creator)
ALTER TABLE `scheduled_job` 
ADD CONSTRAINT `fk_job_user` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 88. search_log 关联 user
ALTER TABLE `search_log` 
ADD CONSTRAINT `fk_search_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 89. user_event 关联 user
ALTER TABLE `user_event` 
ADD CONSTRAINT `fk_ event_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 90. activity 无外键关联

-- 91. ad_slot 无外键关联

-- 92. ad_material 关联 ad_slot
ALTER TABLE `ad_material` 
ADD CONSTRAINT `fk_ad_material_slot` FOREIGN KEY (`slot_id`) REFERENCES `ad_slot` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 93. agent_broker 关联 agent_store
ALTER TABLE `agent_broker` 
ADD CONSTRAINT `fk_broker_store` FOREIGN KEY (`store_id`) REFERENCES `agent_store` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 94. agent_store 关联 region
ALTER TABLE `agent_store` 
ADD CONSTRAINT `fk_store_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 95. building 关联 region
ALTER TABLE `building` 
ADD CONSTRAINT `fk_building_region` FOREIGN KEY (`region_id`) REFERENCES `region` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 96. department 关联 department (self)
ALTER TABLE `department` 
ADD CONSTRAINT `fk_dept_parent` FOREIGN KEY (`parent_id`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 97. employee 关联 department
ALTER TABLE `employee` 
ADD CONSTRAINT `fk_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 98. employee 关联 user
ALTER TABLE `employee` 
ADD CONSTRAINT `fk_emp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 99. region 无外键关联（基础表）

-- 100. metro_station 无外键关联（基础表）

-- 101. poi 无外键关联（基础表）

-- 102. facility 无外键关联（基础表）

-- 103. tag 无外键关联（基础表）

SET FOREIGN_KEY_CHECKS = 1;

-- 验证外键约束
-- SELECT 
--   TABLE_NAME,
--   CONSTRAINT_NAME,
•   REFERENCED_TABLE_NAME,
--   REFERENCED_COLUMN_NAME
-- FROM information_schema.KEY_COLUMN_USAGE
-- WHERE TABLE_SCHEMA = 'anju_rent' 
-- AND REFERENCED_TABLE_NAME IS NOT NULL;
