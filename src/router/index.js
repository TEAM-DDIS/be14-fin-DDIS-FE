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
            component: () => import('@/components/org/structure/Structure.vue')
        },
        {
            path: '/org/introduction',
            component: () => import('@/components/org/introduction/Introduction.vue')
        },
        {
            path: '/org/appointment',
            component: () => import('@/components/org/appointment/Appointment.vue')
        },
        {
            path: '/org/appointment/register',
            component: () => import('@/components/org/appointment/RegisterAppointment.vue')
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
        },
        {
            path: '/jobdetail/:teamId',
            component: () => import('@/components/org/introduction/JobDetail.vue')

        },
        {
            path: '/employeeInfo/employeeSearch',
            component: () => import('@/components/employeeInfo/employeeSearch/EmployeeSearchPage.vue')

        },
        
        // 급여 관리
        // {
        //     path: '/salary/payroll/slip',
        //     component: () => import('@/components/salary/payroll/PayrollSlip.vue')
        // },
        // {
        //     path: '/salary/payroll/issue',
        //     component: () => import('@/components/salary/payroll/PayrollSlipIssue.vue')
        // },

        // 퇴직 관리
        // {
        //     path: '/salary/retirement/estimate',
        //     component: () => import('@/components/salary/retirement/RetirementEstimate.vue')
        // },
        // {
        //     path: '/salary/retirement/status',
        //     component: () => import('@/components/salary/retirement/RetirementPaymentStatus.vue')
        // },

        // 근태 관리
        {
            path: '/attendance/myAttendance',
            component: () => import('@/pages/MyAttendancePage.vue')
        },

        // {
        //     path: '/attendance/teamAttendance',
        //     component: () => import('@/pages/TeamAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/myCorrection',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/allCorrection',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/myCommute',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/allCommute',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/myLeave',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

        // {
        //     path: '/attendance/allLeave',
        //     component: () => import('@/pages/MyAttendancePage.vue')
        // },

    ]
})

export default router