import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore, type UserRole, ROLE_HOME } from '@/store/auth'

// 路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    roles?: UserRole[]
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: () => import('@/views/auth/Login.vue'), meta: { title: '登录' } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/Register.vue'), meta: { title: '注册' } },
  { path: '/forgot-password', name: 'forgot', component: () => import('@/views/auth/ForgotPassword.vue'), meta: { title: '忘记密码' } },
  {
    path: '/',
    component: () => import('@/layouts/UserLayout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'home', component: () => import('@/views/user/Home.vue'), meta: { title: '首页' } },
      { path: 'list', name: 'list', component: () => import('@/views/user/HouseList.vue'), meta: { title: '找房' } },
      { path: 'detail/:id', name: 'detail', component: () => import('@/views/user/HouseDetail.vue'), meta: { title: '房源详情' } },
      { path: 'sign/:id', name: 'sign', component: () => import('@/views/user/SignContract.vue'), meta: { title: '在线签约', requiresAuth: true } },
      { path: 'mine', name: 'mine', component: () => import('@/views/user/Mine.vue'), meta: { title: '我的', requiresAuth: true } },
      { path: 'profile', name: 'profile', component: () => import('@/views/user/EditProfile.vue'), meta: { title: '编辑资料', requiresAuth: true } },
      { path: 'messages', name: 'messages', component: () => import('@/views/user/MessageCenter.vue'), meta: { title: '消息中心', requiresAuth: true } },
      { path: 'bookings', name: 'bookings', component: () => import('@/views/user/MyBookings.vue'), meta: { title: '我的预约', requiresAuth: true } },
      { path: 'orders', name: 'orders', component: () => import('@/views/user/MyOrders.vue'), meta: { title: '我的订单', requiresAuth: true } },
      { path: 'contracts', name: 'contracts', component: () => import('@/views/user/MyContracts.vue'), meta: { title: '我的合同', requiresAuth: true } },
      { path: 'repair', name: 'repair', component: () => import('@/views/user/Repair.vue'), meta: { title: '报修投诉', requiresAuth: true } },
      { path: 'address', name: 'address', component: () => import('@/views/user/AddressManage.vue'), meta: { title: '地址管理', requiresAuth: true } },
      { path: 'realname', name: 'realname', component: () => import('@/views/user/Realname.vue'), meta: { title: '实名认证', requiresAuth: true } },
      { path: 'review', name: 'review', component: () => import('@/views/user/Review.vue'), meta: { title: '写评价', requiresAuth: true } },
      { path: 'points', name: 'points', component: () => import('@/views/user/Points.vue'), meta: { title: '积分优惠券', requiresAuth: true } },
      { path: 'notify', name: 'notify', component: () => import('@/views/user/NotifySettings.vue'), meta: { title: '通知设置', requiresAuth: true } }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, roles: ['agent', 'admin'] },
    children: [
      { path: 'dashboard', name: 'admin-dashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '工作台' } },
      { path: 'houses', name: 'admin-houses', component: () => import('@/views/admin/HouseManage.vue'), meta: { title: '房源管理' } },
      { path: 'users', name: 'admin-users', component: () => import('@/views/admin/UserManage.vue'), meta: { title: '用户管理' } },
      { path: 'trades', name: 'admin-trades', component: () => import('@/views/admin/TradeManage.vue'), meta: { title: '交易管理' } },
      { path: 'contracts', name: 'admin-contracts', component: () => import('@/views/admin/ContractManage.vue'), meta: { title: '合同管理' } },
      { path: 'finance', name: 'admin-finance', component: () => import('@/views/admin/Finance.vue'), meta: { title: '财务管理' } },
      { path: 'tickets', name: 'admin-tickets', component: () => import('@/views/admin/TicketManage.vue'), meta: { title: '工单管理' } },
      { path: 'content', name: 'admin-content', component: () => import('@/views/admin/ContentManage.vue'), meta: { title: '内容管理' } },
      { path: 'statistics', name: 'admin-statistics', component: () => import('@/views/admin/Statistics.vue'), meta: { title: '数据统计' } },
      { path: 'system', name: 'admin-system', component: () => import('@/views/admin/SystemManage.vue'), meta: { title: '系统管理' } }
    ]
  },
  {
    path: '/landlord',
    component: () => import('@/layouts/LandlordLayout.vue'),
    redirect: '/landlord/dashboard',
    meta: { requiresAuth: true, roles: ['landlord'] },
    children: [
      { path: 'dashboard', name: 'landlord-dashboard', component: () => import('@/views/landlord/Dashboard.vue'), meta: { title: '工作台' } },
      { path: 'my-houses', name: 'landlord-houses', component: () => import('@/views/landlord/MyHouses.vue'), meta: { title: '我的房源' } },
      { path: 'publish', name: 'landlord-publish', component: () => import('@/views/landlord/PublishHouse.vue'), meta: { title: '发布房源' } },
      { path: 'bookings', name: 'landlord-bookings', component: () => import('@/views/landlord/Bookings.vue'), meta: { title: '看房预约' } },
      { path: 'orders', name: 'landlord-orders', component: () => import('@/views/landlord/Orders.vue'), meta: { title: '订单合同' } },
      { path: 'bills', name: 'landlord-bills', component: () => import('@/views/landlord/Bills.vue'), meta: { title: '账单' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 全局前置守卫：未登录拦截、角色越权拦截
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录但角色不在允许列表（如租客访问后台）
  if (to.meta.roles && auth.isLoggedIn && auth.user && !to.meta.roles.includes(auth.user.role)) {
    return ROLE_HOME[auth.user.role] || '/'
  }

  return true
})

export default router
