<template>
  <div class="page-max">
    <el-row :gutter="18">
      <el-col :md="6">
        <el-card shadow="never" class="mine-nav">
          <div class="profile">
            <div class="av">
              <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="" />
              <template v-else>{{ auth.user?.name?.[0] }}</template>
            </div>
            <div class="who">
              <b>{{ auth.user?.name }}</b>
              <div class="text-sub">{{ auth.roleName }}</div>
            </div>
          </div>
          <el-menu :default-active="$route.path" @select="go">
            <el-menu-item index="/mine">📊 概览</el-menu-item>
            <el-menu-item index="/profile">✏️ 编辑资料</el-menu-item>
            <el-menu-item index="/messages">
              💬 消息中心
              <span v-if="unread" class="cnt">{{ unread }}</span>
            </el-menu-item>
            <el-menu-item index="/bookings">📅 我的预约</el-menu-item>
            <el-menu-item index="/orders">📄 我的订单</el-menu-item>
            <el-menu-item index="/contracts">📑 我的合同</el-menu-item>
            <el-menu-item index="/repair">🔧 报修投诉</el-menu-item>
            <el-menu-item index="/address">📍 地址管理</el-menu-item>
            <el-menu-item index="/realname">🪪 实名认证</el-menu-item>
            <el-menu-item index="/points">🎁 积分优惠券</el-menu-item>
            <el-menu-item index="/review">📝 写评价</el-menu-item>
            <el-menu-item index="/notify">🔔 通知设置</el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <el-col :md="18">
        <div v-if="certStatus === 'verified'" class="cert-banner verified">
          <div class="cert-icon">✓</div>
          <div class="cert-text">
            <b>已实名认证</b>
            <span>{{ certText }}</span>
          </div>
        </div>
        <div v-else-if="certStatus === 'pending'" class="cert-banner pending">
          <div class="cert-icon">⏳</div>
          <div class="cert-text">
            <b>实名认证审核中</b>
            <span>认证信息已提交，等待平台审核，请耐心等待</span>
          </div>
        </div>
        <div v-else class="cert-banner todo">
          <div class="cert-icon">🪪</div>
          <div class="cert-text">
            <b>完成实名认证，解锁签约 / 发布房源</b>
            <span>实名认证后即可在线签约、发布房源，交易更安心</span>
          </div>
          <el-button type="primary" round @click="go('/realname')">去认证</el-button>
        </div>

        <el-card shadow="never">
          <h3>数据概览</h3>
          <el-row :gutter="12" class="stats">
            <el-col :span="6" v-for="s in stats" :key="s.k">
              <div class="stat"><b>{{ s.v }}</b><small>{{ s.k }}</small></div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useUserCenterStore } from '@/store/userCenter'

const auth = useAuthStore()
const center = useUserCenterStore()
const router = useRouter()
const route = useRoute()

const certStatus = computed(() => center.realname?.status || 'none')
const certText = computed(() => {
  const rn = center.realname
  return [rn?.realName, rn?.idCardMask].filter(Boolean).join(' · ')
})
const unread = computed(() => center.messages.filter((m) => !m.read).length)
const unpaid = computed(() => center.orders.filter((x) => x.status === '待支付').length)
const stats = computed(() => [
  { k: '收藏', v: center.collectList.length },
  { k: '预约', v: center.bookings.length },
  { k: '合同', v: center.contracts.length },
  { k: '待缴费', v: unpaid.value }
])

function go(path: string) {
  if (path !== route.path) router.push(path)
}

onMounted(() => center.loadAll())
</script>

<style scoped>
.profile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 4px 16px;
}
.profile .av {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 18px;
  overflow: hidden;
}
.profile .av img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile .who {
  line-height: 1.3;
}
.stats .stat {
  background: var(--bg);
  border-radius: 12px;
  padding: 14px;
  text-align: center;
}
.stats .stat b {
  font-size: 22px;
  color: var(--brand);
  display: block;
}
.stats .stat small {
  color: var(--sub);
}
.text-sub {
  color: var(--sub);
}
.cnt {
  margin-left: 6px;
  background: #f56c6c;
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
  line-height: 18px;
}
.cert-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.cert-banner .cert-icon {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: #fff;
}
.cert-banner .cert-text {
  flex: 1;
  line-height: 1.4;
}
.cert-banner .cert-text b {
  display: block;
  font-size: 15px;
}
.cert-banner .cert-text span {
  font-size: 13px;
  opacity: 0.85;
}
.cert-banner.todo {
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  color: #fff;
}
.cert-banner.todo .cert-icon {
  background: rgba(255, 255, 255, 0.25);
}
.cert-banner.verified {
  background: #f0f9eb;
  color: #529b2e;
}
.cert-banner.verified .cert-icon {
  background: #67c23a;
}
.cert-banner.pending {
  background: #fdf6ec;
  color: #b88230;
}
.cert-banner.pending .cert-icon {
  background: #e6a23c;
}
</style>
