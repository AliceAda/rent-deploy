/**
 * 扩展功能模块 - 16个页面的完整实现
 * 包含：运营活动、广告管理、纠纷、发票、对账、税务、退租、转租、续租、入住、押金、日志、邀请、租期配置
 */

import {
  AdminActivities,
  AdminAds,
  AdminDisputes,
  AdminInvoices,
  AdminReconciliation,
  AdminTaxes,
  AdminTerminations,
  AdminSubleases,
  AdminRenewals,
  AdminCheckins,
  AdminDeposits,
  AdminAuditLogs,
  AdminStatusLogs,
  AdminCreditLogs,
  AdminInvites,
  AdminRentPeriods
} from './extensions-pages'

export {
  AdminActivities,
  AdminAds,
  AdminDisputes,
  AdminInvoices,
  AdminReconciliation,
  AdminTaxes,
  AdminTerminations,
  AdminSubleases,
  AdminRenewals,
  AdminCheckins,
  AdminDeposits,
  AdminAuditLogs,
  AdminStatusLogs,
  AdminCreditLogs,
  AdminInvites,
  AdminRentPeriods
}

// 路由配置
export const extensionRoutes = [
  { path: '/admin/activities', name: 'AdminActivities', component: AdminActivities, meta: { title: '活动管理' } },
  { path: '/admin/ads', name: 'AdminAds', component: AdminAds, meta: { title: '广告管理' } },
  { path: '/admin/disputes', name: 'AdminDisputes', component: AdminDisputes, meta: { title: '纠纷管理' } },
  { path: '/admin/invoices', name: 'AdminInvoices', component: AdminInvoices, meta: { title: '发票管理' } },
  { path: '/admin/reconciliation', name: 'AdminReconciliation', component: AdminReconciliation, meta: { title: '财务对账' } },
  { path: '/admin/taxes', name: 'AdminTaxes', component: AdminTaxes, meta: { title: '税务管理' } },
  { path: '/admin/terminations', name: 'AdminTerminations', component: AdminTerminations, meta: { title: '退租管理' } },
  { path: '/admin/subleases', name: 'AdminSubleases', component: AdminSubleases, meta: { title: '转租管理' } },
  { path: '/admin/renewals', name: 'AdminRenewals', component: AdminRenewals, meta: { title: '续租管理' } },
  { path: '/admin/checkins', name: 'AdminCheckins', component: AdminCheckins, meta: { title: '入住记录' } },
  { path: '/admin/deposits', name: 'AdminDeposits', component: AdminDeposits, meta: { title: '押金管理' } },
  { path: '/admin/audit-logs', name: 'AdminAuditLogs', component: AdminAuditLogs, meta: { title: '审核日志' } },
  { path: '/admin/status-logs', name: 'AdminStatusLogs', component: AdminStatusLogs, meta: { title: '状态日志' } },
  { path: '/admin/credit-logs', name: 'AdminCreditLogs', component: AdminCreditLogs, meta: { title: '信用日志' } },
  { path: '/admin/invite-records', name: 'AdminInvites', component: AdminInvites, meta: { title: '邀请记录' } },
  { path: '/admin/rent-periods', name: 'AdminRentPeriods', component: AdminRentPeriods, meta: { title: '租期配置' } }
]
