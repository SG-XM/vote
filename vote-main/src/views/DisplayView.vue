<template>
  <div class="display-container">
    <div class="left-section">
      <div class="contestant-info">
        <div class="contestant-number">No.{{ currentContestant?.id }}</div>
        <div class="contestant-name">{{ currentContestant?.name }}</div>
      </div>
      <div class="contestant-photo">
        <img :src="currentContestant?.image" :alt="currentContestant?.name">
      </div>
    </div>

    <div class="right-section">
      <transition name="fade" mode="out-in">
        <div v-if="showScore" key="score" class="display-content">
          <div class="score-breakdown">
            <div class="score-item">
              <div class="score-value">{{ animatedProfessionalScore.toFixed(2) }}</div>
              <div class="score-label">专业评审</div>
            </div>
            <div class="score-item">
              <div class="score-value">{{ animatedPublicScore.toFixed(2) }}</div>
              <div class="score-label">大众评审</div>
            </div>
          </div>
          <div class="final-score">
            <div class="display-value">{{ animatedFinalScore.toFixed(2) }}</div>
            <div class="display-label">最终得分</div>
          </div>
        </div>
        <div v-else-if="isCalculating" key="calculating" class="display-content">
          <div class="display-value calculating">
            得分统计中<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
          </div>
        </div>
        <div v-else key="countdown" class="display-content">
          <div class="display-value">{{ formattedTime }}</div>
          <div class="display-label">倒计时</div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useContestantsStore } from '../stores/contestants'

// 获取状态
const store = useContestantsStore()
const currentContestant = computed(() => store.currentContestant)
const showScore = computed(() => store.showScore)
const countdownTime = computed(() => store.countdownTime)
const isCalculating = computed(() => store.isCalculating)

// 分数动画相关
const animatedProfessionalScore = ref(0)
const animatedPublicScore = ref(0)
const animatedFinalScore = ref(0)
const animationDuration = 15000 // 动画持续时间(毫秒)

// 用于分数动画的缓动函数
const easeOutQuart = (t: number): number => {
  return 1 - Math.pow(1 - t, 4)
}

// 开始分数动画
const startScoreAnimation = () => {
  const professionalTarget = currentContestant.value?.professionalScore || 0
  const publicTarget = currentContestant.value?.publicScore || 0
  const finalTarget = currentContestant.value?.score || 0
  
  // 重置动画初始值
  animatedProfessionalScore.value = 0
  animatedPublicScore.value = 0
  animatedFinalScore.value = 0
  
  const startTime = Date.now()
  
  const updateAnimation = () => {
    const currentTime = Date.now()
    const elapsed = Math.min(currentTime - startTime, animationDuration)
    const progress = elapsed / animationDuration
    
    // 使用缓动函数，使增长速度逐渐减慢
    const easedProgress = easeOutQuart(progress)
    
    // 更新动画值
    animatedProfessionalScore.value = professionalTarget * easedProgress
    animatedPublicScore.value = publicTarget * easedProgress
    animatedFinalScore.value = finalTarget * easedProgress
    
    // 继续动画直到完成
    if (elapsed < animationDuration) {
      requestAnimationFrame(updateAnimation)
    } else {
      // 确保最终值是精确的目标值
      animatedProfessionalScore.value = professionalTarget
      animatedPublicScore.value = publicTarget
      animatedFinalScore.value = finalTarget
    }
  }
  
  // 开始动画
  requestAnimationFrame(updateAnimation)
}

// 倒计时相关
const remainingTime = ref(countdownTime.value)
let timer: number | null = null

// 格式化时间
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60)
  const seconds = remainingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 开始倒计时
const startCountdown = () => {
  if (timer) {
    clearInterval(timer)
  }
  
  remainingTime.value = countdownTime.value
  
  timer = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      // 倒计时结束
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }, 1000)
}

// 当倒计时时间或当前选手变化时，重新开始倒计时
watch([countdownTime, () => store.currentContestantId], () => {
  if (!showScore.value) {
    startCountdown()
  }
})

// 当显示模式变化时
watch(showScore, (newVal) => {
  if (newVal) {
    // 切换到得分模式
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    // 启动分数动画
    startScoreAnimation()
  } else {
    // 切换到倒计时模式
    startCountdown()
  }
})

// 当选手或分数变化时，如果处于得分显示模式，更新分数动画
watch([
  () => currentContestant.value?.professionalScore,
  () => currentContestant.value?.publicScore,
  () => currentContestant.value?.score
], () => {
  if (showScore.value) {
    startScoreAnimation()
  }
})

/**
 * 监听localStorage变化的处理函数
 * 只响应"立即同步数据"按钮触发的sync_command事件
 */
const handleStorageChange = (event: StorageEvent) => {
  // 只响应sync_command事件，忽略其他localStorage变化
  if (event.key === 'sync_command') {
    console.log('收到同步命令，正在更新数据...')
    // 使用store的刷新方法更新数据
    store.refreshData()
  }
}

// 组件挂载时
onMounted(() => {
  if (showScore.value) {
    // 如果初始状态是显示得分，启动分数动画
    startScoreAnimation()
  } else {
    startCountdown()
  }
  
  // 添加storage事件监听器
  window.addEventListener('storage', handleStorageChange)
})

// 组件卸载时清除计时器和事件监听器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  // 移除storage事件监听器
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
/* 确保页面完全填满浏览器窗口的基础设置 */
:root, html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.display-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-image: url('../assets/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
  overflow: hidden;
}

.left-section {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.contestant-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  margin-top: 3rem;
}

.contestant-number {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 1rem;
  margin-top: 0;
}

.contestant-name {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin-top: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.contestant-photo {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 1rem;
  margin-top: 0rem;
}

.contestant-photo img {
  max-width: 70%;
  max-height: 55vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.right-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.display-content {
  text-align: center;
  width: 100%;
}

.score-breakdown {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  width: 100%;
}

.score-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  min-width: 140px;
}

.score-value {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
  font-family: 'Consolas', 'Courier New', monospace;
}

.final-score {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.display-value {
  font-size: 6rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  line-height: 1.2;
  font-family: 'Consolas', 'Courier New', monospace;
}

.display-label {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
}

.calculating {
  font-size: 3rem;
}

.dot {
  display: inline-block;
  animation: dots 1.4s infinite;
  animation-fill-mode: both;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dots {
  0%, 80%, 100% {
    opacity: 0;
  }
  40% {
    opacity: 1;
  }
}

/* 转场动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .display-value {
    font-size: 5rem;
  }
  
  .score-value {
    font-size: 2.5rem;
  }
  
  .calculating {
    font-size: 2.5rem;
  }
  
  .display-label {
    font-size: 1.3rem;
  }
  
  .contestant-name {
    font-size: 1.8rem;
  }
}

@media (max-width: 768px) {
  .display-container {
    grid-template-columns: 1fr;
    grid-template-rows: 60vh 40vh;
  }
  
  .display-value {
    font-size: 4rem;
  }
  
  .score-value {
    font-size: 2rem;
  }
  
  .score-breakdown {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .calculating {
    font-size: 2rem;
  }
  
  .contestant-photo img {
    max-height: 40vh;
  }
}

/* 添加字体抗锯齿 */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 