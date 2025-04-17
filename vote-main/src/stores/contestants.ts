import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 导入选手图片
import contestant0 from '../assets/images/1/刘博文（队长）.jpg'
import contestant1 from '../assets/images/1/温学鹏.jpg'
import contestant2 from '../assets/images/1/赵泽暄.jpg'
import contestant3 from '../assets/images/1/路丰玮.jpg'
import contestant4 from '../assets/images/1/郭钰琨.jpg'
import contestant5 from '../assets/images/2/梁岩松（队长）-不需要修图.jpg'
import contestant6 from '../assets/images/2/范晨阳-不需要修图.jpg'
import contestant7 from '../assets/images/2/张渤-不需要修图.jpg'
import contestant8 from '../assets/images/2/许明昊-不需要修图.jpg'
import contestant9 from '../assets/images/2/马佳一-不需要修图.jpg'
import contestant10 from '../assets/images/3/王一博（队长）-个人照.jpg'
import contestant11 from '../assets/images/3/唐周阳.jpg'
import contestant12 from '../assets/images/3/程启乐.jpg'
import contestant13 from '../assets/images/3/郭春江.jpg'
import contestant14 from '../assets/images/3/贺定坤.jpg'
import contestant15 from '../assets/images/4/刘昊阳（队长）.jpg'
import contestant16 from '../assets/images/4/任志明.jpg'
import contestant17 from '../assets/images/4/张惜惟.jpg'
import contestant18 from '../assets/images/4/杨承金.jpg'
import contestant19 from '../assets/images/4/夏扎提·玉山.jpg'
import contestant20 from '../assets/images/5/金洪庆（队长）.jpg'
import contestant21 from '../assets/images/5/衣保锦.jpg'
import contestant22 from '../assets/images/5/吴美惠.jpg'
import contestant23 from '../assets/images/5/何春霞.jpg'
import contestant24 from '../assets/images/5/李睿（修图后）.jpg'

/**
 * 选手信息接口
 */
export interface Contestant {
  id: number
  name: string
  image: string
  score: number
  professionalScore: number
  publicScore: number
}

/**
 * 选手状态管理
 */
export const useContestantsStore = defineStore('contestants', () => {
  // 初始化选手数据
  const defaultContestants: Contestant[] = [
    { id: 1, name: '刘博文', image: contestant0, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 2, name: '温学鹏', image: contestant1, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 3, name: '赵泽暄', image: contestant2, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 4, name: '路丰玮', image: contestant3, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 5, name: '郭钰琨', image: contestant4, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 6, name: '梁岩松', image: contestant5, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 7, name: '范晨阳', image: contestant6, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 8, name: '张渤', image: contestant7, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 9, name: '许明昊', image: contestant8, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 10, name: '马佳一', image: contestant9, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 11, name: '王一博', image: contestant10, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 12, name: '唐周阳', image: contestant11, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 13, name: '程启乐', image: contestant12, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 14, name: '郭春江', image: contestant13, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 15, name: '贺定坤', image: contestant14, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 16, name: '刘昊阳', image: contestant15, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 17, name: '任志明', image: contestant16, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 18, name: '张惜惟', image: contestant17, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 19, name: '杨承金', image: contestant18, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 20, name: '夏扎提·玉山', image: contestant19, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 21, name: '金洪庆', image: contestant20, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 22, name: '衣保锦', image: contestant21, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 23, name: '吴美惠', image: contestant22, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 24, name: '何春霞', image: contestant23, score: 0, professionalScore: 0, publicScore: 0 },
    { id: 25, name: '李睿', image: contestant24, score: 0, professionalScore: 0, publicScore: 0 },

  ]

  // 从localStorage加载数据
  const loadContestantsFromStorage = (): Contestant[] => {
    const stored = localStorage.getItem('contestants')
    return stored ? JSON.parse(stored) : defaultContestants
  }

  // 选手数据
  const contestants = ref<Contestant[]>(loadContestantsFromStorage())
  
  // 当前选手ID
  const currentContestantId = ref<number>(1)
  
  // 是否显示得分（false则显示倒计时）
  const showScore = ref<boolean>(false)
  
  // 倒计时时间（秒）
  const countdownTime = ref<number>(60)

  // 是否正在统计得分
  const isCalculating = ref<boolean>(false)
  
  // 保存数据到localStorage
  const saveContestantsToStorage = () => {
    localStorage.setItem('contestants', JSON.stringify(contestants.value))
  }
  
  // 当前选手
  const currentContestant = computed(() => {
    return contestants.value.find(c => c.id === currentContestantId.value) || contestants.value[0]
  })
  
  // 设置当前选手
  const setCurrentContestant = (id: number) => {
    currentContestantId.value = id
    localStorage.setItem('currentContestantId', id.toString())
  }
  
  // 更新选手得分
  const updateScore = (id: number, score: number) => {
    const contestant = contestants.value.find(c => c.id === id)
    if (contestant) {
      contestant.score = score
      saveContestantsToStorage()
    }
  }
  
  // 更新专业评审得分
  const updateProfessionalScore = (id: number, score: number) => {
    const contestant = contestants.value.find(c => c.id === id)
    if (contestant) {
      contestant.professionalScore = score
      calculateFinalScore(contestant)
      saveContestantsToStorage()
    }
  }
  
  // 更新大众评审得分
  const updatePublicScore = (id: number, score: number) => {
    const contestant = contestants.value.find(c => c.id === id)
    if (contestant) {
      contestant.publicScore = score
      calculateFinalScore(contestant)
      saveContestantsToStorage()
    }
  }
  
  // 计算最终得分（专业评委占80%，大众评委占20%）
  const calculateFinalScore = (contestant: Contestant) => {
    contestant.score = Number((contestant.professionalScore * 0.8 + contestant.publicScore * 0.2).toFixed(2))
  }
  
  // 切换显示模式
  const toggleDisplayMode = () => {
    showScore.value = !showScore.value
    localStorage.setItem('showScore', showScore.value.toString())
  }
  
  // 设置倒计时时间
  const setCountdownTime = (time: number) => {
    countdownTime.value = time
    localStorage.setItem('countdownTime', time.toString())
  }

  // 切换得分统计状态
  const toggleCalculating = () => {
    isCalculating.value = !isCalculating.value
    localStorage.setItem('isCalculating', isCalculating.value.toString())
  }
  
  // 手动强制刷新数据（从localStorage重新加载）
  const refreshData = () => {
    contestants.value = loadContestantsFromStorage()
    const storedCurrentId = localStorage.getItem('currentContestantId')
    if (storedCurrentId) {
      currentContestantId.value = parseInt(storedCurrentId)
    }
    const storedShowScore = localStorage.getItem('showScore')
    if (storedShowScore !== null) {
      showScore.value = storedShowScore === 'true'
    }
    const storedCountdownTime = localStorage.getItem('countdownTime')
    if (storedCountdownTime) {
      countdownTime.value = parseInt(storedCountdownTime)
    }
    const storedIsCalculating = localStorage.getItem('isCalculating')
    if (storedIsCalculating !== null) {
      isCalculating.value = storedIsCalculating === 'true'
    }
  }
  
  // 初始化从localStorage加载设置
  const initSettings = () => {
    const storedCurrentId = localStorage.getItem('currentContestantId')
    if (storedCurrentId) {
      currentContestantId.value = parseInt(storedCurrentId)
    }
    
    const storedShowScore = localStorage.getItem('showScore')
    if (storedShowScore !== null) {
      showScore.value = storedShowScore === 'true'
    }
    
    const storedCountdownTime = localStorage.getItem('countdownTime')
    if (storedCountdownTime) {
      countdownTime.value = parseInt(storedCountdownTime)
    }

    const storedIsCalculating = localStorage.getItem('isCalculating')
    if (storedIsCalculating !== null) {
      isCalculating.value = storedIsCalculating === 'true'
    }
  }
  
  // 初始化设置
  initSettings()
  
  return {
    contestants,
    currentContestantId,
    showScore,
    countdownTime,
    isCalculating,
    currentContestant,
    setCurrentContestant,
    updateScore,
    updateProfessionalScore,
    updatePublicScore,
    toggleDisplayMode,
    setCountdownTime,
    toggleCalculating,
    refreshData
  }
}) 