# 模块拆分清单 (apifox/modules/)

按 tag 拆分自 `openapi.json`, 每个文件为**自包含** OpenAPI 3.0 文档, 可直接导入 ApiFox 独立项目。

| 文件 | 模块 | 接口数 | DTO 数 | 引用组件 |

|---|---|---|---|---|
| `admin.json` | 后台 Admin | 40 | 17 | AdminContract, AdminHouse, AdminOrder, AdminTicket, AdminUser, AdminUserItem, ContentItem, DashboardToday … |
| `house.json` | 房源 House | 29 | 11 | BrowseHistoryItem, CollectItem, HouseImage, HouseItem, HouseList, HouseRoom, LandlordHouseStats, ReportItem … |
| `order.json` | 订单 Order | 15 | 5 | OrderDetail, OrderItem, OrderList, PayResult, RentPeriod |
| `pay.json` | 支付 Pay | 15 | 8 | PayMethod, PayOrder, PayRecord, PayRecordList, RefundItem, RefundList, WithdrawItem, WithdrawList |
| `contract.json` | 合同 Contract | 14 | 4 | ContractAttachment, ContractDetail, ContractItem, ContractTemplate |
| `workorder.json` | 工单 Workorder | 13 | 3 | AdminTicket, RepairSubmit, WorkOrderItem |
| `booking.json` | 看房预约 Booking | 10 | 2 | BookingItem, BookingList |
| `user.json` | 用户 User | 9 | 8 | AccountCancelData, AccountCancelStatus, ChangePasswordData, ChangePhoneData, RealnameStatus, RealnameSubmitData, UpdateProfileData, UserProfile |
| `bill.json` | 账单 Bill | 7 | 2 | BillItem, BillList |
| `risk.json` | 风控 Risk | 7 | 4 | BlacklistItem, ReportItem, RiskRecord, RiskRule |
| `search.json` | 搜索 Search | 6 | 4 | HotKeyword, HouseItem, SearchLog, SearchSuggest |
| `address.json` | 地址 Address | 5 | 2 | AddressItem, AddressList |
| `auth.json` | 认证 Auth | 4 | 5 | ForgotPwdData, LoginData, LoginResult, RegisterData, SmsSendData |
| `session.json` | 会话 Session | 4 | 2 | SessionItem, SessionList |
| `message.json` | 消息 Message | 3 | 1 | MessageItem |
| `notify.json` | 通知 Notify | 2 | 1 | NotifySetting |
| `points.json` | 积分 Points | 2 | 3 | CouponItem, CouponList, PointsInfo |
| `storage.json` | 文件 Storage | 1 | 0 |  |

**合计**: 18 个模块文件, 186 接口 (与总规范一致), 全局 DTO 组件 85 个。


## 使用说明

- 每位开发者认领一个模块文件, 导入 ApiFox 新建项目即可独立定义/调试。

- 跨模块共享的 DTO (如 `HouseItem`) 会按副本形式包含在各文件中, 联调时以**真实后端**定义为最终准。

- 修改前端接口后, 重跑 `gen_openapi.py` + `backfill_fields.py` + 本脚本即可重新生成。
