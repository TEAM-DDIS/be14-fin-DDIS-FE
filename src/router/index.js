import { createRouter, createWebHistory } from 'vue-router'

import GoalListPage  from '@/component/GoalListPage.vue'
import GoalDetailPage from '@/component/GoalDetailPage.vue'
import EvaluationPage from '@/component/EvaluationPage.vue'

const routes = [
  { path: '/goals',       name: 'GoalsList',  component: GoalListPage },
  { path: '/goals/:id',   name: 'GoalDetail', component: GoalDetailPage, props: true },
  // 404 처리
  { path: '/eval', name: 'Evaluation', component: EvaluationPage},
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),  // 해시(#) 없이 깔끔하게
  routes,
})

export default router
