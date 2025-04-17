<template>
  <div class="admin-container">
    <h1>选手得分管理系统</h1>
    
    <div class="control-panel">
      <div class="current-contestant-section">
        <h2>当前展示选手</h2>
        <select v-model="selectedContestantId" @change="changeContestant" class="contestant-select">
          <option v-for="contestant in contestants" :key="contestant.id" :value="contestant.id">
            {{ contestant.id }}. {{ contestant.name }}
          </option>
        </select>
      </div>
      
      <div class="score-control-section">
        <h2>得分管理</h2>
        <div class="score-controls">
          <div class="score-input-group">
            <div class="score-label">专业评审</div>
            <input 
              type="number" 
              v-model.number="professionalScore" 
              @input="updateProfessionalScore" 
              min="0"
              max="100"
              step="0.01"
              class="score-input"
            >
            <span class="input-addon">分</span>
          </div>
          
          <div class="score-input-group">
            <div class="score-label">大众评审</div>
            <input 
              type="number" 
              v-model.number="publicScore" 
              @input="updatePublicScore" 
              min="0"
              max="100"
              step="0.01"
              class="score-input"
            >
            <span class="input-addon">分</span>
          </div>
          
          <div class="final-score">
            <div class="score-label">最终得分</div>
            <div class="final-score-value">{{ currentScore }}</div>
          </div>
        </div>
      </div>
      
      <div class="display-mode-section">
        <h2>显示控制</h2>
        <div class="display-controls">
          <div class="control-item">
            <div class="control-label">显示模式：</div>
            <div class="toggle-group">
              <span class="mode-label">倒计时</span>
              <label class="switch">
                <input type="checkbox" v-model="displayScore" @change="toggleDisplayMode">
                <span class="slider round"></span>
              </label>
              <span class="mode-label">显示得分</span>
            </div>
          </div>
          
          <div class="control-item">
            <div class="control-label">得分统计：</div>
            <div class="toggle-group">
              <span class="mode-label">关闭</span>
              <label class="switch">
                <input type="checkbox" v-model="isCalculating" @change="toggleCalculating">
                <span class="slider round"></span>
              </label>
              <span class="mode-label">开启</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="countdown-control-section">
        <h2>倒计时控制</h2>
        <div class="countdown-input-group">
          <input 
            type="number" 
            v-model.number="countdown" 
            @input="setCountdown" 
            min="1"
            class="countdown-input"
          >
          <span class="input-addon">秒</span>
        </div>
      </div>
    </div>
    
    <div class="status-panel">
      <div class="display-status" :class="{ 'active': displayScore }">
        当前: {{ displayScore ? '显示得分' : '显示倒计时' }}
      </div>
      <div class="sync-status">
        <button @click="syncNow" class="sync-button">
          立即同步数据
        </button>
        <span v-if="syncSuccess" class="sync-success">同步成功!</span>
      </div>
    </div>
    
    <div class="contestants-list">
      <h2>所有选手</h2>
      <table>
        <thead>
          <tr>
            <th>序号</th>
            <th>姓名</th>
            <th>得分</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contestant in contestants" :key="contestant.id" :class="{ 'current': contestant.id === selectedContestantId }">
            <td>{{ contestant.id }}</td>
            <td>{{ contestant.name }}</td>
            <td>{{ contestant.score }}</td>
            <td>
              <button @click="setCurrentContestant(contestant.id)" class="action-button">
                选择
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="preview-link">
      <router-link to="/display" target="_blank" class="preview-button">
        预览展示页面
      </router-link>
    </div>

    <!-- 评分计算区域 -->
    <div class="score-calculator">
      <h2>评分计算</h2>
      
      <!-- 专业评委评分 -->
      <div class="judge-section">
        <h3>专业评委评分 (7位)</h3>
        <div class="score-input">
          <textarea 
            v-model="professionalScoresInput" 
            placeholder="请输入7位专业评委的分数，用逗号分隔，例如：90,85,88,92,87,89,91"
            @input="calculateScores"
          ></textarea>
        </div>
        <div class="result">
          <p>专业评委平均分: <span class="highlight">{{ professionalAverage }}</span></p>
        </div>
      </div>

      <!-- 大众评委评分 -->
      <div class="judge-section">
        <h3>大众评委评分 (50位)</h3>
        <div class="score-input">
          <textarea 
            v-model="publicScoresInput" 
            placeholder="请输入50位大众评委的分数，可用逗号或换行分隔，例如：
85
90
88
92
87
..."
            class="w-full h-40 p-2 border rounded"
            @input="calculateScores"
          ></textarea>
        </div>
        <div class="result">
          <p>大众评委平均分: <span class="highlight">{{ publicAverage }}</span></p>
          <p>最终得分: <span class="highlight">{{ finalScore }}</span></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useContestantsStore } from '../stores/contestants'

// 获取状态
const store = useContestantsStore()
const contestants = computed(() => store.contestants)
const selectedContestantId = ref(store.currentContestantId)
const displayScore = ref(store.showScore)
const countdown = ref(store.countdownTime)
const currentScore = ref(store.currentContestant?.score || 0)
const professionalScore = ref(store.currentContestant?.professionalScore || 0)
const publicScore = ref(store.currentContestant?.publicScore || 0)
const syncSuccess = ref(false)
const isCalculating = ref(store.isCalculating)

// 评分计算相关
const professionalScoresInput = ref('')
const publicScoresInput = ref('')
const professionalAverage = ref(0)
const publicAverage = ref(0)
const finalScore = ref(0)

// 当选择的选手变化时，更新当前分数
watch(() => selectedContestantId.value, (newVal) => {
  const contestant = contestants.value.find(c => c.id === newVal)
  if (contestant) {
    currentScore.value = contestant.score
    professionalScore.value = contestant.professionalScore
    publicScore.value = contestant.publicScore
  }
})

// 当当前选手ID在store中变化时同步更新
watch(() => store.currentContestantId, (newVal) => {
  selectedContestantId.value = newVal
  const contestant = contestants.value.find(c => c.id === newVal)
  if (contestant) {
    currentScore.value = contestant.score
    professionalScore.value = contestant.professionalScore
    publicScore.value = contestant.publicScore
  }
})

// 切换当前选手
const changeContestant = () => {
  store.setCurrentContestant(selectedContestantId.value)
}

// 更新选手得分
const updateScore = () => {
  store.updateScore(selectedContestantId.value, currentScore.value)
}

// 更新专业评审得分
const updateProfessionalScore = () => {
  store.updateProfessionalScore(selectedContestantId.value, professionalScore.value)
  const contestant = contestants.value.find(c => c.id === selectedContestantId.value)
  if (contestant) {
    currentScore.value = contestant.score
  }
}

// 更新大众评审得分
const updatePublicScore = () => {
  store.updatePublicScore(selectedContestantId.value, publicScore.value)
  const contestant = contestants.value.find(c => c.id === selectedContestantId.value)
  if (contestant) {
    currentScore.value = contestant.score
  }
}

// 设置当前选手
const setCurrentContestant = (id: number) => {
  selectedContestantId.value = id
  store.setCurrentContestant(id)
}

// 切换显示模式
const toggleDisplayMode = () => {
  store.toggleDisplayMode()
}

// 设置倒计时时间
const setCountdown = () => {
  store.setCountdownTime(countdown.value)
}

// 切换得分统计状态
const toggleCalculating = () => {
  store.toggleCalculating()
}

// 手动触发storage事件，用于跨页面通信
const triggerStorageEvent = (key: string, value: string) => {
  // 直接修改localStorage会自动触发其他窗口的storage事件
  localStorage.setItem(key, value)
}

// 立即同步数据到所有窗口
const syncNow = () => {
  // 更新所有状态到localStorage
  triggerStorageEvent('currentContestantId', selectedContestantId.value.toString())
  triggerStorageEvent('showScore', store.showScore.toString())
  triggerStorageEvent('countdownTime', countdown.value.toString())
  
  // 确保选手的专业评审和大众评审得分已更新
  const currentContestant = contestants.value.find(c => c.id === selectedContestantId.value)
  if (currentContestant) {
    currentContestant.professionalScore = professionalScore.value
    currentContestant.publicScore = publicScore.value
    currentContestant.score = Number((professionalScore.value * 0.8 + publicScore.value * 0.2).toFixed(2))
  }
  
  // 保存并同步选手数据
  triggerStorageEvent('contestants', JSON.stringify(store.contestants))
  
  // 触发同步命令
  triggerStorageEvent('sync_command', Date.now().toString())
  
  // 显示同步成功提示
  syncSuccess.value = true
  setTimeout(() => {
    syncSuccess.value = false
  }, 3000)
}

/**
 * 计算所有分数
 */
const calculateScores = () => {
  // 如果输入框为空，清空所有得分
  if (!professionalScoresInput.value.trim() && !publicScoresInput.value.trim()) {
    professionalAverage.value = 0
    publicAverage.value = 0
    finalScore.value = 0
    return
  }

  // 解析专业评委分数
  const proScores = professionalScoresInput.value
    .split(/[,，\n]/) // 支持逗号、中文逗号和换行符分割
    .map(score => parseFloat(score.trim()))
    .filter(score => !isNaN(score) && score > 0)
  
  // 计算专业评委平均分
  if (proScores.length > 0) {
    professionalAverage.value = Number((proScores.reduce((a, b) => a + b, 0) / proScores.length).toFixed(2))
  } else {
    professionalAverage.value = 0
  }

  // 解析大众评委分数
  const pubScores = publicScoresInput.value
    .split(/[,，\n]/) // 支持逗号、中文逗号和换行符分割
    .map(score => parseFloat(score.trim()))
    .filter(score => !isNaN(score) && score > 0)
  
  // 计算大众评委平均分（去掉最高10分和最低10分）
  if (pubScores.length > 20) { // 确保有足够的分数
    // 排序
    const sortedScores = [...pubScores].sort((a, b) => a - b)
    // 去掉最高10分和最低10分
    const trimmedScores = sortedScores.slice(10, -10)
    publicAverage.value = Number((trimmedScores.reduce((a, b) => a + b, 0) / trimmedScores.length).toFixed(2))
  } else {
    publicAverage.value = 0
  }

  // 计算最终得分（专业评委占80%，大众评委占20%）
  finalScore.value = Number((professionalAverage.value * 0.8 + publicAverage.value * 0.2).toFixed(2))
  
  // 将计算结果应用到当前选手
  if (selectedContestantId.value) {
    professionalScore.value = professionalAverage.value
    publicScore.value = publicAverage.value
    
    // 更新选手得分
    store.updateProfessionalScore(selectedContestantId.value, professionalAverage.value)
    store.updatePublicScore(selectedContestantId.value, publicAverage.value)
    
    // 更新UI显示
    currentScore.value = finalScore.value
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  overflow-y: auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

h2 {
  color: #495057;
  margin-bottom: 1rem;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 8px;
}

.display-status {
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  color: #495057;
}

.display-status.active {
  background-color: #d0ebff;
  color: #1971c2;
  font-weight: bold;
}

.sync-button {
  padding: 0.5rem 1rem;
  background-color: #fd7e14;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.sync-button:hover {
  background-color: #e8590c;
}

.sync-success {
  margin-left: 1rem;
  color: #2b8a3e;
  font-weight: bold;
}

.contestant-select, .score-input, .countdown-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
}

.score-input-group, .countdown-input-group {
  display: flex;
  align-items: center;
}

.input-addon {
  padding: 0 0.5rem;
  font-size: 1.2rem;
}

.display-mode-section {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.display-controls {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.control-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.control-label {
  font-size: 1.1rem;
  font-weight: 500;
  color: #495057;
  min-width: 100px;
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mode-label {
  font-size: 1rem;
  color: #6c757d;
  min-width: 60px;
}

/* 开关样式优化 */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  margin: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e9ecef;
  transition: .4s;
  border: 1px solid #ced4da;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

input:checked + .slider {
  background-color: #228be6;
}

input:focus + .slider {
  box-shadow: 0 0 1px #228be6;
}

input:checked + .slider:before {
  transform: translateX(30px);
}

.slider.round {
  border-radius: 30px;
}

.slider.round:before {
  border-radius: 50%;
}

/* 表格样式 */
.contestants-list {
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

tr.current {
  background-color: #e2f3ff;
}

.action-button {
  padding: 0.5rem 1rem;
  background-color: #4dabf7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: #339af0;
}

.preview-link {
  text-align: center;
  margin-top: 2rem;
}

.preview-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #37b24d;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.preview-button:hover {
  background-color: #2b9e3f;
}

/* 评分计算器样式 */
.score-calculator {
  margin-top: 2rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.judge-section {
  margin-bottom: 2rem;
}

.score-input {
  margin-bottom: 1rem;
}

.score-input textarea {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
}

.result {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.highlight {
  font-size: 1.2em;
  font-weight: bold;
  color: #dc3545;
}

.score-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  min-width: 80px;
  font-size: 1rem;
  color: #495057;
}

.score-input {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: white;
}

.final-score {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background-color: #f1f3f5;
  border-radius: 4px;
}

.final-score-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1971c2;
}
</style> 