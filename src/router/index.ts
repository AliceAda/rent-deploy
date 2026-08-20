import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', name: 'Home', component: () => import('@/views/user/Home.vue'), meta: { title: '首页' } },
      { path: 'houses', name: 'HouseList', component: () => import('@/views/user/HouseList.vue'), meta: { title: '房源列表' } },
      { path: 'house/:id', name: 'HouseDetail', component: () => import('@/views/user/HouseDetail.vue'), meta: { title: '房源详情' } },
      { path: 'map-find', name: 'MapFind', component: () => import('@/views/user/MapFind.vue'), meta: { title: '地图找房' } },
      { path: 'market', name: 'Market', component: () => import('@/views/user/Market.vue'), meta: { title: '市场详情' } },
      { path: 'mine', name: 'Mine', component: () => import('@/views/user/Mine.vue'), meta: { title: '个人中心' } },
      { path: 'orders', name: 'MyOrders', component: () => import('@/views/user/MyOrders.vue'), meta: { title: '我的订单' } },
      { path: 'order/:id', name: 'OrderDetail', component: () => import('@/views/user/OrderDetail.vue'), meta: { title: '订单详情' } },
      { path: 'contracts', name: 'MyContracts', component: () => import('@/views/user/MyContracts.vue'), meta: { title: '我的合同' } },
      { path: 'contract/:id', name: 'ContractDetail', component: () => import('@/views/user/ContractDetail.vue'), meta: { title: '合同详情' } },
      { path: 'sign-contract/:id', name: 'SignContract', component: () => import('@/views/user/SignContract.vue'), meta: { title: '电子签约' } },
      { path: 'bookings', name: 'MyBookings', component: () => import('@/views/user/MyBookings.vue'), meta: { title: '看房预约' } },
      { path: 'bills', name: 'MyBills', component: () => import('@/views/user/MyBills.vue'), meta: { title: '我的账单' } },
      { path: 'pay-records', name: 'PayRecords', component: () => import('@/views/user/PayRecords.vue'), meta: { title: '支付记录' } },
      { path: 'favorites', name: 'Favorites', component: () => import('@/views/user/Favorites.vue'), meta: { title: '我的收藏' } },
      { path: 'history', name: 'BrowseHistory', component: () => import('@/views/user/BrowseHistory.vue'), meta: { title: '浏览历史' } },
      { path: 'compare', name: 'Compare', component: () => import('@/views/user/Compare.vue'), meta: { title: '房源对比' } },
      { path: 'messages', name: 'MessageCenter', component: () => import('@/views/user/MessageCenter.vue'), meta: { title: '消息中心' } },
      { path: 'work-orders', name: 'WorkOrders', component: () => import('@/views/user/Repair.vue'), meta: { title: '报修投诉' } },
      { path: 'work-order/:id', name: 'WorkOrderDetail', component: () => import('@/views/user/WorkOrderDetail.vue'), meta: { title: '工单详情' } },
      { path: 'points', name: 'Points', component: () => import('@/views/user/Points.vue'), meta: { title: '积分与优惠券' } },
      { path: 'realname', name: 'Realname', component: () => import('@/views/user/Realname.vue'), meta: { title: '实名认证' } },
      { path: 'profile', name: 'EditProfile', component: () => import('@/views/user/EditProfile.vue'), meta: { title: '个人资料' } },
      { path: 'security', name: 'Security', component: () => import('@/views/user/Security.vue'), meta: { title: '账户安全' } },
      { path: 'sessions', name: 'Sessions', component: () => import('@/views/user/Sessions.vue'), meta: { title: '登录设备' } },
      { path: 'addresses', name: 'AddressManage', component: () => import('@/views/user/AddressManage.vue'), meta: { title: '收货地址' } },
      { path: 'notify-settings', name: 'NotifySettings', component: () => import('@/views/user/NotifySettings.vue'), meta: { title: '通知设置' } },
      { path: 'review/:houseId', name: 'Review', component: () => import('@/views/user/Review.vue'), meta: { title: '写评价' } },
      { path: 'account-cancel', name: 'AccountCancel', component: () => import('@/views/user/AccountCancel.vue'), meta: { title: '注销账户' } }
    ]
  },
  {
    path: '/auth',
    children: [
      { path: 'login', name: 'Login', component: () => import('@/views/auth/Login.vue'), meta: { title: '登录', guest: true } },
      { path: 'register', name: 'Register', component: () => import('@/views/auth/Register.vue'), meta: { title: '注册', guest: true } },
      { path: 'forgot-password', name: 'ForgotPassword', component: () => import('@/views/auth/ForgotPassword.vue'), meta: { title: '忘记密码', guest: true } }
    ]
  },
  {
    path: '/landlord',
    component: () => import('@/layouts/LandlordLayout.vue'),
    meta: { requiresAuth: true, roles: ['landlord'] },
    children: [
      { path: '', redirect: '/landlord/dashboard' },
      { path: 'dashboard', name: 'LandlordDashboard', component: () => import('@/views/landlord/Dashboard.vue'), meta: { title: '工作台' } },
      { path: 'houses', name: 'MyHouses', component: () => import('@/views/landlord/MyHouses.vue'), meta: { title: '我的房源' } },
      { path: 'house/edit/:id', name: 'HouseEdit', component: () => import('@/views/landlord/HouseEdit.vue'), meta: { title: '编辑房源' } },
      { path: 'house/publish', name: 'PublishHouse', component: () => import('@/views/landlord/PublishHouse.vue'), meta: { title: '发布房源' } },
      { path: 'bookings', name: 'Bookings', component: () => import('@/views/landlord/Bookings.vue'), meta: { title: '看房预约' } },
      { path: 'booking/:id', name: 'BookingDetail', component: () => import('@/views/landlord/BookingDetail.vue'), meta: { title: '预约详情' } },
      { path: 'orders', name: 'LandlordOrders', component: () => import('@/views/landlord/Orders.vue'), meta: { title: '订单管理' } },
      { path: 'contracts', name: 'LandlordContracts', component: () => import('@/views/landlord/Contracts.vue'), meta: { title: '合同管理' } },
      { path: 'bills', name: 'LandlordBills', component: () => import('@/views/landlord/Bills.vue'), meta: { title: '账单管理' } },
      { path: 'bill/:id', name: 'BillDetail', component: () => import('@/views/landlord/BillDetail.vue'), meta: { title: '账单详情' } },
      { path: 'withdraw', name: 'Withdraw', component: () => import('@/views/landlord/Withdraw.vue'), meta: { title: '提现' } },
      { path: 'repairs', name: 'RepairManage', component: () => import('@/views/landlord/RepairManage.vue'), meta: { title: '报修管理' } },
      { path: 'profile', name: 'LandlordProfile', component: () => import('@/views/LandlordProfile.vue'), meta: { title: '房东资料' } }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['agent', 'admin'] },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '数据概览' } },
      { path: 'houses', name: 'AdminHouses', component: () => import('@/views/admin/HouseManage.vue'), meta: { title: '房源管理' } },
      { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/UserManage.vue'), meta: { title: '用户管理' } },
      { path: 'users/:id', name: 'AdminUserDetail', component: () => import('@/views/admin/UserDetail.vue'), meta: { title: '用户详情', hidden: true } },
      { path: 'agents', name: 'AdminAgents', component: () => import('@/views/AgentManage.vue'), meta: { title: '经纪人管理' } },
      { path: 'trades', name: 'AdminTrades', component: () => import('@/views/admin/TradeManage.vue'), meta: { title: '交易管理' } },
      { path: 'contracts', name: 'AdminContracts', component: () => import('@/views/admin/ContractManage.vue'), meta: { title: '合同管理' } },
      { path: 'contract-templates', name: 'AdminContractTemplates', component: () => import('@/views/admin/ContractTemplate.vue'), meta: { title: '合同模板', group: '合同管理' } },
      { path: 'finance', name: 'AdminFinance', component: () => import('@/views/admin/Finance.vue'), meta: { title: '财务概览', group: '财务管理' } },
      { path: 'refunds', name: 'AdminRefunds', component: () => import('@/views/admin/RefundManage.vue'), meta: { title: '退款审核', group: '财务管理' } },
      { path: 'withdrawals', name: 'AdminWithdrawals', component: () => import('@/views/admin/WithdrawManage.vue'), meta: { title: '提现审批', group: '财务管理' } },
      { path: 'tickets', name: 'AdminTickets', component: () => import('@/views/admin/TicketManage.vue'), meta: { title: '工单管理' } },
      { path: 'reports', name: 'AdminReports', component: () => import('@/views/admin/ReportManage.vue'), meta: { title: '举报管理', group: '风控管理' } },
      { path: 'risk', name: 'AdminRisk', component: () => import('@/views/admin/RiskManage.vue'), meta: { title: '风控管理', group: '风控管理' } },
      { path: 'search', name: 'AdminSearch', component: () => import('@/views/admin/SearchManage.vue'), meta: { title: '搜索管理' } },
      { path: 'content', name: 'AdminContent', component: () => import('@/views/admin/ContentManage.vue'), meta: { title: '内容管理' } },
      { path: 'message-templates', name: 'AdminMessageTemplates', component: () => import('@/views/admin/MessageTemplate.vue'), meta: { title: '消息模板' } },
      { path: 'statistics', name: 'AdminStatistics', component: () => import('@/views/admin/Statistics.vue'), meta: { title: '数据统计' } },
      { path: 'system', name: 'AdminSystem', component: () => import('@/views/admin/SystemManage.vue'), meta: { title: '系统设置', group: '系统管理' } },
      { path: 'dict', name: 'AdminDict', component: () => import('@/views/admin/DictManage.vue'), meta: { title: '数据字典', group: '系统管理' } },
      { path: 'config', name: 'AdminConfig', component: () => import('@/views/admin/ConfigManage.vue'), meta: { title: '系统配置', group: '系统管理' } },
      { path: 'activities', name: 'AdminActivities', component: () => import('@/views/admin/extended/AdminActivities.vue'), meta: { title: '活动管理', group: '扩展功能' } },
      { path: 'ads', name: 'AdminAds', component: () => import('@/views/admin/extended/AdminAds.vue'), meta: { title: '广告管理', group: '扩展功能' } },
      { path: 'disputes', name: 'AdminDisputes', component: () => import('@/views/admin/extended/AdminDisputes.vue'), meta: { title: '纠纷管理', group: '扩展功能' } },
      { path: 'invoices', name: 'AdminInvoices', component: () => import('@/views/admin/extended/AdminInvoices.vue'), meta: { title: '发票管理', group: '扩展功能' } },
      { path: 'reconciliation', name: 'AdminReconciliation', component: () => import('@/views/admin/extended/AdminReconciliation.vue'), meta: { title: '财务对账', group: '扩展功能' } },
      { path: 'taxes', name: 'AdminTaxes', component: () => import('@/views/admin/extended/AdminTaxes.vue'), meta: { title: '税务管理', group: '扩展功能' } },
      { path: 'terminations', name: 'AdminTerminations', component: () => import('@/views/admin/extended/AdminTerminations.vue'), meta: { title: '退租管理', group: '扩展功能' } },
      { path: 'subleases', name: 'AdminSubleases', component: () => import('@/views/admin/extended/AdminSubleases.vue'), meta: { title: '转租管理', group: '扩展功能' } },
      { path: 'renewals', name: 'AdminRenewals', component: () => import('@/views/admin/extended/AdminRenewals.vue'), meta: { title: '续租管理', group: '扩展功能' } },
      { path: 'checkins', name: 'AdminCheckins', component: () => import('@/views/admin/extended/AdminCheckins.vue'), meta: { title: '入住记录', group: '扩展功能' } },
      { path: 'deposits', name: 'AdminDeposits', component: () => import('@/views/admin/extended/AdminDeposits.vue'), meta: { title: '押金管理', group: '扩展功能' } },
      { path: 'audit-logs', name: 'AdminAuditLogs', component: () => import('@/views/admin/extended/AdminAuditLogs.vue'), meta: { title: '审核日志', group: '扩展功能' } },
      { path: 'status-logs', name: 'AdminStatusLogs', component: () => import('@/views/admin/extended/AdminStatusLogs.vue'), meta: { title: '状态日志', group: '扩展功能' } },
      { path: 'credit-logs', name: 'AdminCreditLogs', component: () => import('@/views/admin/extended/AdminCreditLogs.vue'), meta: { title: '信用日志', group: '扩展功能' } },
      { path: 'invite-records', name: 'AdminInvites', component: () => import('@/views/admin/extended/AdminInvites.vue'), meta: { title: '邀请记录', group: '扩展功能' } },
      { path: 'rent-periods', name: 'AdminRentPeriods', component: () => import('@/views/admin/extended/AdminRentPeriods.vue'), meta: { title: '租期配置', group: '扩展功能' } }
    ]
  },
  {
    path: '/dev',
    children: [
      { path: 'api-status', name: 'ApiStatus', component: () => import('@/views/dev/ApiStatus.vue'), meta: { title: 'API 状态', guest: true } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '安居易租'} - 租房管理平台`
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/auth/login')
      return
    }
  }
  if (to.meta.guest) {
    const token = localStorage.getItem('token')
    if (token) {
      next('/')
      return
    }
  }
  next()
})

export default router
