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
            component: () => import('@/components/org/introduction/Introduction.vue')
        },
        {
            path: '/org/appointment',
            component: () => import('@/components/org/Appointment.vue')
        },

    ]
})

export default router