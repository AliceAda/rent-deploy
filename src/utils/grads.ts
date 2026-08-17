// 封面 / 画廊占位渐变（第一版配色，照片就位后移除）
// 唯一来源：HouseCard / HouseDetail 等共用，避免逐处复制漂移
export const HOUSE_GRADS = [
  'linear-gradient(135deg,#2F6FED,#5a86ff)',
  'linear-gradient(135deg,#FF7D3C,#ff9a6b)',
  'linear-gradient(135deg,#1aa86a,#5fd6a0)',
  'linear-gradient(135deg,#7a5af0,#a98bff)'
]

/** 按房源 id 确定性取色，保证同一房源每次展示一致 */
export function houseGrad(id: number): string {
  return HOUSE_GRADS[Math.abs(id) % HOUSE_GRADS.length]
}
