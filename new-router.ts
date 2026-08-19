import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore, type UserRole, ROLE_HOME } from '@/store/auth'

// 路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: UserRole[]
    // 布局选择：admin | landlord
    layout?: 'admin' | 'landlord'
    menu?: { icon?: string; group?: string }
    hidden?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/auth/Login.vue'), meta: { title: '登录' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/Register.vue'), meta: { title: '注册' } },
  { path: '/forgot-password', name: 'forgot', component: () => import('@/views/auth/ForgotPassword.vue'), meta: { title: '忘记密码' } },
  
  // ===== 租客端 =====
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'home', component: () => import('@/views/user/Home.vue'), meta: { title: '首页' } },
      { path: 'list', name: 'list', component: () => import('@/views/user/HouseList.vue'), meta: { title: '找房' } },
      { path: 'map', name: 'map', component: () => import('@/views/user/MapFind.vue'), meta: { title: '地图找房' } },
      { path: 'market', name: 'market', component: () => import('@/views/user/Market.vue'), meta: { title: '租金行情' } },
      { path: 'detail/:id', name: 'detail', component: () => import('@/views/user/HouseDetail.vue'), meta: { title: '房源详情' } },
      { path: 'compare', name: 'compare', component: () => import('@/views/user/Compare.vue'), meta: { title: '房源对比' } },
      { path: 'sign/:id', name: 'sign', component: () => import('@/views/user/SignContract.vue'), meta: { title: '在线签约', requiresAuth: true } },
      { path: 'mine', name: 'mine', component: () => import('@/views/user/Mine.vue'), meta: { title: '我的', requiresAuth: true } },
      { path: 'profile', name: 'profile', component: () => import('@/views/user/EditProfile.vue'), meta: { title: '编辑资料', requiresAuth: true } },
      { path: 'security', name: 'security', component: () => import('@/views/user/Security.vue'), meta: { title: '密码安全', requiresAuth: true } },
      { path: 'sessions', name: 'sessions', component: () => import('@/views/user/Sessions.vue'), meta: { title: '登录会话', requiresAuth: true } },
      { path: 'messages', name: 'messages', component: () => import('@/views/user/MessageCenter.vue'), meta: { title: '消息中心', requiresAuth: true } },
      { path: 'bookings', name: 'bookings', component: () => import('@/views/user/MyBookings.vue'), meta: { title: '我的预约', requiresAuth: true } },
      { path: 'orders', name: 'orders', component: () => import('@/views/user/MyOrders.vue'), meta: { title: '我的订单', requiresAuth: true } },
      { path: 'orders/:id', name: 'order-detail', component: () => import('@/views/user/OrderDetail.vue'), meta: { title: '订单详情', requiresAuth: true } },
      { path: 'contracts', name: 'contracts', component: () => import('@/views/user/MyContracts.vue'), meta: { title: '我的合同', requiresAuth: true } },
      { path: 'contracts/:id', name: 'contract-detail', component: () => import('@/views/user/ContractDetail.vue'), meta: { title: '合同详情', requiresAuth: true } },
      { path: 'repair', name: 'repair', component: () => import('@/views/user/Repair.vue'), meta: { title: '报修投诉', requiresAuth: true } },
      { path: 'repair/:id', name: 'workorder-detail', component: () => import('@/views/user/WorkOrderDetail.vue'), meta: { title: '工单详情', requiresAuth: true } },
      { path: 'bills', name: 'bills', component: () => import('@/views/user/MyBills.vue'), meta: { title: '我的账单', requiresAuth: true } },
      { path: 'pay-records', name: 'pay-records', component: () => import('@/views/user/PayRecords.vue'), meta: { title: '支付记录', requiresAuth: true } },
      { path: 'favorites', name: 'favorites', component: () => import('@/views/user/Favorites.vue'), meta: { title: '我的收藏', requiresAuth: true } },
      { path: 'history', name: 'history', component: () => import('@/views/user/BrowseHistory.vue'), meta: { title: '浏览历史', requiresAuth: true } },
      { path: 'account-cancel', name: 'account-cancel', component: () => import('@/views/user/AccountCancel.vue'), meta: { title: '账号注销', requiresAuth: true } },
      { path: 'address', name: 'address', component: () => import('@/views/user/AddressManage.vue'), meta: { title: '地址管理', requiresAuth: true } },
      { path: 'realname', name: 'realname', component: () => import('@/views/user/Realname.vue'), meta: { title: '实名认证', requiresAuth: true } },
      { path: 'review', name: 'review', component: () => import('@/views/user/Review.vue'), meta: { title: '写评价', requiresAuth: true } },
      { path: 'points', name: 'points', component: () => import('@/views/user/Points.vue'), meta: { title: '积分优惠券', requiresAuth: true } },
      { path: 'notify', name: 'notify', component: () => import('@/views/user/NotifySettings.vue'), meta: { title: '通知设置', requiresAuth: true } }
    ]
  },
  
  // ===== 平台后台（管理员 + 经纪人） =====
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, roles: ['admin', 'agent'], layout: 'admin' },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '工作台', menu: { icon: 'DataLine' } } },
      { path: 'houses', name: 'admin-houses', component: () => import('@/views/admin/HouseManage.vue'), meta: { title: '房源管理', menu: { icon: 'House' } } },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UserManage.vue'), meta: { title: '用户管理', menu: { icon: 'User' } } },
      { path: 'users/:id', name: 'admin-user-detail', component: () => import('@/views/admin/UserDetail.vue'), meta: { title: '用户详情', hidden: true } },
      { path: 'agents', name: 'admin-agents', component: () => import('@/views/admin/AgentManage.vue'), meta: { title: '经纪人管理', menu: { icon: 'UserFilled', group: '人员管理' } } },
      { path: 'trades', name: 'admin-trades', component: () => import('@/views/admin/TradeManage.vue'), meta: { title: '交易管理', menu: { icon: 'Tickets' } } },
      { path: 'contracts', name: 'admin-contracts', component: () => import('@/views/admin/ContractManage.vue'), meta: { title: '合同列表', menu: { icon: 'Document', group: '合同管理' } } },
      { path: 'contract-templates', name: 'admin-contract-templates', component: () => import('@/views/admin/ContractTemplate.vue'), meta: { title: '合同模板', menu: { icon: 'Document', group: '合同管理' } } },
      { path: 'finance', name: 'admin-finance', component: () => import('@/views/admin/Finance.vue'), meta: { title: '财务概览', menu: { icon: 'Money', group: '财务管理' } } },
      { path: 'refunds', name: 'admin-refunds', component: () => import('@/views/admin/RefundManage.vue'), meta: { title: '退款审批', menu: { icon: 'Money', group: '财务管理' } } },
      { path: 'withdrawals', name: 'admin-withdrawals', component: () => import('@/views/admin/WithdrawManage.vue'), meta: { title: '提现审批', menu: { icon: 'Money', group: '财务管理' } } },
      { path: 'tickets', name: 'admin-tickets', component: () => import('@/views/admin/TicketManage.vue'), meta: { title: '工单管理', menu: { icon: 'Service' } } },
      { path: 'content', name: 'admin-content', component: () => import('@/views/admin/ContentManage.vue'), meta: { title: '内容管理', menu: { icon: 'Notebook' } } },
      { path: 'statistics', name: 'admin-statistics', component: () => import('@/views/admin/Statistics.vue'), meta: { title: '数据统计', menu: { icon: 'TrendCharts' } } },
      { path: 'risk', name: 'admin-risk', component: () => import('@/views/admin/RiskManage.vue'), meta: { title: '风控中心', menu: { icon: 'WarnTriangleFilled', group: '风控管理' } } },
      { path: 'reports', name: 'admin-reports', component: () => import('@/views/admin/ReportManage.vue'), meta: { title: '举报管理', menu: { icon: 'WarnTriangleFilled', group: '风控管理' } } },
      { path: 'search', name: 'admin-search', component: () => import('@/views/admin/SearchManage.vue'), meta: { title: '搜索管理', menu: { icon: 'Search' } } },
      { path: 'message-templates', name: 'admin-message-templates', component: () => import('@/views/admin/MessageTemplate.vue'), meta: { title: '消息模板', menu: { icon: 'Message' } } },
      { path: 'system', name: 'admin-system', component: () => import('@/views/admin/SystemManage.vue'), meta: { title: '系统设置', menu: { icon: 'Setting', group: '系统管理' } } },
      { path: 'dict', name: 'admin-dict', component: () => import('@/views/admin/DictManage.vue'), meta: { title: '数据字典', menu: { icon: 'Setting', group: '系统管理' } } },
      { path: 'config', name: 'admin-config', component: () => import('@/views/admin/ConfigManage.vue'), meta: { title: '系统配置', menu: { icon: 'Setting', group: '系统管理' } } }
    ]
  },
  
  // ===== 房东中心 =====
  {
    path: '/landlord',
    component: () => import('@/layouts/LandlordLayout.vue'),
    redirect: '/landlord/dashboard',
    meta: { requiresAuth: true, roles: ['landlord'], layout: 'landlord' },
    children: [
      { path: 'dashboard', name: 'landlord-dashboard', component: () => import('@/views/landlord/Dashboard.vue'), meta: { title: '工作台', menu: { icon: 'Odometer' } } },
      { path: 'my-houses', name: 'landlord-houses', component: () => import('@/views/landlord/MyHouses.vue'), meta: { title: '我的房源', menu: { icon: 'House' } } },
      { path: 'houses/:id', name: 'landlord-house-edit', component: () => import('@/views/landlord/HouseEdit.vue'), meta: { title: '编辑房源', hidden: true } },
      { path: 'publish', name: 'landlord-publish', component: () => import('@/views/landlord/PublishHouse.vue'), meta: { title: '发布房源', menu: { icon: 'Plus' } } },
      { path: 'bookings', name: 'landlord-bookings', component: () => import('@/views/landlord/Bookings.vue'), meta: { title: '看房预约', menu: { icon: 'Calendar' } } },
      { path: 'bookings/:id', name: 'landlord-booking-detail', component: () => import('@/views/landlord/BookingDetail.vue'), meta: { title: '预约详情', hidden: true } },
      { path: 'orders', name: 'landlord-orders', component: () => import('@/views/landlord/Orders.vue'), meta: { title: '订单', menu: { icon: 'Tickets' } } },
      { path: 'contracts', name: 'landlord-contracts', component: () => import('@/views/landlord/Contracts.vue'), meta: { title: '合同管理', menu: { icon: 'Document' } } },
      { path: 'workorders', name: 'landlord-workorders', component: () => import('@/views/landlord/RepairManage.vue'), meta: { title: '工单处理', menu: { icon: 'Service' } } },
      { path: 'bills', name: 'landlord-bills', component: () => import('@/views/landlord/Bills.vue'), meta: { title: '账单', menu: { icon: 'Money' } } },
      { path: 'bills/:id', name: 'landlord-bill-detail', component: () => import('@/views/landlord/BillDetail.vue'), meta: { title: '账单详情', hidden: true } },
      { path: 'withdraw', name: 'landlord-withdraw', component: () => import('@/views/landlord/Withdraw.vue'), meta: { title: '提现管理', menu: { icon: 'Wallet' } } },
      { path: 'profile', name: 'landlord-profile', component: () => import('@/views/landlord/LandlordProfile.vue'), meta: { title: '房东资料', menu: { icon: 'UserFilled' } } }
    ]
  },
  
  // 开发工具
  { path: '/api-status', name: 'api-status', component: () => import('@/views/dev/ApiStatus.vue'), meta: { title: '接口状态' } },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 角色越权拦截
  if (to.meta.roles && auth.isLoggedIn && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return ROLE_HOME[auth.user.role] || '/'
  }

  return true
})

export default router
