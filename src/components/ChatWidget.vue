<template>
  <!-- 右下角客服浮窗：市面租房网站标配在线咨询 -->
  <div class="chat-root">
    <div v-if="open" class="chat-panel">
      <div class="chat-head">
        <div class="chat-agent">
          <span class="dot"></span>
          <div>
            <div class="chat-name">安居小助</div>
            <div class="chat-state">在线 · 平均 30 秒响应</div>
          </div>
        </div>
        <button class="chat-close" @click="open = false">✕</button>
      </div>

      <div class="chat-body" ref="bodyEl">
        <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.from">
          <div class="bubble" v-html="m.text"></div>
        </div>
        <div v-if="typing" class="msg agent">
          <div class="bubble typing"><span></span><span></span><span></span></div>
        </div>
      </div>

      <div class="chat-quick">
        <button v-for="q in QUICK" :key="q" @click="ask(q)">{{ q }}</button>
      </div>

      <div class="chat-input">
        <el-input v-model="draft" placeholder="输入问题，如：怎么预约看房？" @keyup.enter="send" clearable />
        <el-button type="primary" :disabled="!draft.trim()" @click="send">发送</el-button>
      </div>
    </div>

    <!-- 悬浮气泡 -->
    <button class="chat-fab" :class="{ on: open }" @click="toggle">
      <span v-if="!open && unread" class="chat-badge">{{ unread }}</span>
      <span v-if="!open" class="fab-ico">💬</span>
      <span v-else class="fab-ico">✕</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { House } from '@/mock/data'

interface Msg {
  from: 'agent' | 'me'
  text: string
}

// 快捷问题（市面客服常见入口）
const QUICK = ['怎么预约看房？', '签约流程是怎样的？', '押金和租金怎么付？', '可以短租吗？']

// 关键词自动回复（演示用，人工客服接入后替换为真实消息服务）
function autoReply(text: string, ctx?: House | null): string {
  const s = text
  if (/预约|看房/.test(s)) {
    return '在房源详情页点击「📅 预约看房」，选择期望时间提交即可，房东会尽快确认。<br/>也可以直接告诉我房源名称，我帮你登记预约。'
  }
  if (/签约|合同|签/.test(s)) {
    return '在线签约流程：确认房源与租期 → 填写租客信息 → 确认费用明细 → 电子签章并支付。<br/>签约后合同与首期账单会同步生成，可在「我的-合同」查看。'
  }
  if (/押金|租金|费用|付|价格|优惠/.test(s)) {
    return '租金按合同约定按月支付，押金方式见房源「押一付一/押一付三」标注，退租无损坏原路退回。<br/>首单可使用优惠券，在「我的-积分优惠券」中查看。'
  }
  if (/短租|月付|分期/.test(s)) {
    return '部分房源支持短租，可在找房页筛选「可短租」标签；月付/分期方案可联系人工客服确认资质。'
  }
  if (/退|退款|取消/.test(s)) {
    return '预约/订单取消与退款申请：在我的-订单/预约中操作，退款需平台审核，一般 1-3 个工作日到账。'
  }
  if (/维修|报修|坏了|漏水|故障/.test(s)) {
    return '入住期间设施故障可在「我的-报修投诉」提交工单，平台会在 24 小时内响应处理。'
  }
  if (/地址|入住|搬|钥匙/.test(s)) {
    return '签约支付完成后，可联系房东确认入住时间与钥匙交接；我的-地址管理可维护常用地址。'
  }
  if (/人|客服|电话|人工/.test(s)) {
    return '当前为演示自动回复，接入真实后端后由人工客服接管。<br/>紧急事项可致电平台热线 400-000-0000（演示号码）。'
  }
  if (ctx) {
    return `关于《${ctx.title}》的咨询已收到。该房源 ${ctx.price} 元/月 · ${ctx.layout} · ${ctx.district}。<br/>建议先在详情页预约看房或直接在线签约，如有其他问题请继续留言。`
  }
  return '收到！我会尽快为您解答。也可以点击下方快捷问题快速获取答案。'
}

const open = ref(false)
const unread = ref(1)
const draft = ref('')
const typing = ref(false)
const ctxHouse = ref<House | null>(null)
const bodyEl = ref<HTMLElement>()
const messages = ref<Msg[]>([
  { from: 'agent', text: '您好，我是<b>安居小助</b> 👋 租房找房、签约缴费、报修投诉都可以问我。' }
])

// 详情页「在线咨询」按钮 → 打开浮窗并携带房源上下文
function onOpenChat(e: Event) {
  const detail = (e as CustomEvent).detail as { house?: House | null }
  ctxHouse.value = detail?.house ?? null
  if (detail?.house && !open.value) {
    messages.value.push({ from: 'agent', text: `您正在咨询：<b>${detail.house.title}</b>（${detail.house.district} · ${detail.house.price}元/月）` })
  }
  open.value = true
  unread.value = 0
  scrollDown()
}
watch(open, (v) => {
  if (v) unread.value = 0
})

function toggle() {
  open.value = !open.value
  if (open.value) unread.value = 0
}

function ask(q: string) {
  send(q)
}

function scrollDown() {
  nextTick(() => bodyEl.value?.scrollTo({ top: bodyEl.value.scrollHeight }))
}

function send(text?: string) {
  const content = (text ?? draft.value).trim()
  if (!content) return
  messages.value.push({ from: 'me', text: content.replace(/</g, '&lt;') })
  draft.value = ''
  scrollDown()
  typing.value = true
  setTimeout(() => {
    typing.value = false
    messages.value.push({ from: 'agent', text: autoReply(content, ctxHouse.value) })
    scrollDown()
  }, 650 + Math.random() * 500)
}

// 全局事件：详情页「在线咨询」
if (typeof window !== 'undefined') {
  window.addEventListener('open-chat', onOpenChat as EventListener)
}

function greet() {
  setTimeout(() => {
    if (unread.value === 1) {
      ElMessage({ message: '安居小助：有什么可以帮您？', type: 'success', duration: 3200 })
    }
  }, 1800)
}
greet()
</script>

<style scoped>
.chat-root {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2200;
  font-size: 13px;
}
.chat-fab {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(47, 111, 237, 0.4);
  display: grid;
  place-items: center;
  transition: transform 0.15s;
}
.chat-fab:hover {
  transform: scale(1.06);
}
.chat-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--warn);
  color: #fff;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  padding: 0 4px;
  border: 2px solid #fff;
}
.chat-panel {
  position: absolute;
  right: 0;
  bottom: 64px;
  width: 340px;
  max-width: calc(100vw - 24px);
  height: 480px;
  max-height: calc(100vh - 90px);
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--line);
  box-shadow: 0 16px 44px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: linear-gradient(135deg, var(--brand), #5a86ff);
  color: #fff;
}
.chat-agent {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-agent .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #7be09a;
  box-shadow: 0 0 0 3px rgba(123, 224, 154, 0.25);
}
.chat-name {
  font-weight: 700;
}
.chat-state {
  font-size: 11px;
  opacity: 0.85;
}
.chat-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  opacity: 0.9;
}
.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f6f8fb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.msg {
  display: flex;
}
.msg.me {
  justify-content: flex-end;
}
.bubble {
  max-width: 82%;
  padding: 8px 12px;
  border-radius: 12px;
  line-height: 1.55;
  word-break: break-word;
}
.msg.agent .bubble {
  background: #fff;
  border: 1px solid var(--line);
  border-bottom-left-radius: 4px;
}
.msg.me .bubble {
  background: var(--brand);
  color: #fff;
  border-bottom-right-radius: 4px;
}
.typing {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
}
.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9aa6b8;
  animation: blink 1.2s infinite;
}
.typing span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing span:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes blink {
  0%,
  70%,
  100% {
    opacity: 0.3;
  }
  35% {
    opacity: 1;
  }
}
.chat-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid var(--line);
  background: #fff;
}
.chat-quick button {
  border: 1px solid var(--line);
  background: #f6f8fb;
  color: var(--ink);
  border-radius: 14px;
  padding: 3px 10px;
  font-size: 12px;
  cursor: pointer;
}
.chat-quick button:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--line);
  background: #fff;
}
.chat-input :deep(.el-input__wrapper) {
  border-radius: 18px;
}
</style>
