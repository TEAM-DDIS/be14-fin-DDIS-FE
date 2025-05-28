import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/pages/MainPage.vue')
        },
        {
            path: '/org/structure',
            component: () => import('@/components/org/Structure.vue')
        },
        {
            path: '/org/introduction',
            component: () => import('@/components/org/Introduction.vue')
        },
        {
            path: '/org/appointment',
            component: () => import('@/components/org/Appointment.vue')
        },
        {
            path: '/org/evaluation',
            component: () => import('@/components/Evaluation/EvaluationPage.vue')
        },
        {
            path: '/org/goals',
            component: () => import('@/components/Goals/GoalListPage.vue')
        },
        {
            path: '/org/login',
            component: () => import('@/components/login/LoginPage.vue'),
            meta: { hideLayout : true}
        }

    ]
})

export default router