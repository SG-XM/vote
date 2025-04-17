import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/display'
  },
  {
    path: '/display',
    name: 'Display',
    component: () => import('../views/DisplayView.vue'),
    meta: {
      title: '选手得分展示'
    }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      title: '选手得分管理'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由标题设置
router.beforeEach((to, from, next) => {
  document.title = to.meta.title as string || '选手打分展示系统'
  next()
})

export default router 