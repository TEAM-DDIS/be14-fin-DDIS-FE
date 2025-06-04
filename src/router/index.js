import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [

        // =============== 메인 ===============
        {
            path: '/',
            component: () => import('@/pages/MainPage.vue')
        },


        // =============== 로그인 ===============
        {
            path: '/org/login',
            component: () => import('@/components/login/LoginPage.vue'),
            meta: { hideLayout : true}
        },


        // =============== 인사 정보 ===============

        // 내 인사 정보
        {
            path: '/employeeInfo/myInfo',
            component: () => import('@/components/employeeInfo/EmployeeSearchPage.vue')
        },

        // 사원 목록 조회
        {
            path: '/employeeInfo/employeeList',
            component: () => import('@/components/employeeInfo/EmployeeList.vue')
        },

        // 계약서/법정서류 관리
        // {
        //     path: '/employeeInfo/Contract',
        //     component: () => import('@/')
        // },

        // 징계 관리
        // {
        //     path: '/employeeInfo/disciplinary',
        //     component: () => import('@/')
        // },


        // =============== 근태 관리 ===============

        // 내 근태 현황
        {
            path: '/attendance/myAttendance',
            component: () => import('@/pages/MyAttendancePage.vue')
        },

        // 팀 근태 현황
        {
            path: '/attendance/teamAttendance',
            component: () => import('@/pages/TeamAttendancePage.vue')
        },

        // 내 출근 정정 관리
        {
            path: '/attendance/myCorrection',
            component: () => import('@/pages/MyCorrectionPage.vue')
        },

        // 전체 출근 정정 관리
        {
            path: '/attendance/allCorrection',
            component: () => import('@/pages/AllCorrectionPage.vue')
        },

        // 내 출퇴근 관리
        {
            path: '/attendance/myCommute',
            component: () => import('@/pages/MyCommutePage.vue')
        },

        // 전체 출퇴근 관리
        {
            path: '/attendance/allCommute',
            component: () => import('@/pages/AllCommutePage.vue')
        },

        {
            path: '/attendance/allCommute/:employeeId',
            name: 'OtherCommutePage',
            component: () => import('@/pages/OtherCommutePage.vue'),
            props: true
        },

        // 내 연차 관리
        {
            path: '/attendance/myLeave',
            component: () => import('@/pages/MyLeavePage.vue')
        },

        // 전체 연차 관리
        {
            path: '/attendance/allLeave',
            component: () => import('@/pages/AllLeavePage.vue')
        },


        // =============== 조직 및 직무 ===============

        // 조직 구성 조회
        {
            path: '/org/structure',
            component: () => import('@/pages/org/StructurePage.vue')
        },

        // 조직 및 직무 소개
        {
            path: '/org/structure/edit',
            component: () => import('@/pages/org/EditStructurePage.vue')
        },
        {
            path: '/org/introduction',
            component: () => import('@/pages/org/IntroductionPage.vue')
        },

        {
            path: '/jobdetail/:teamId',
            component: () => import('@/pages/org/JobDetailPage.vue')
        },

        // 인사발령
        {
            path: '/org/appointment',
            component: () => import('@/pages/org/AppointmentPage.vue')
        },
        {
            path: '/org/appointment/register',
            component: () => import('@/pages/org/RegisterAppointmentPage.vue')
        },
        {
            path: '/org/appointment/:appointmentId',
            component: () => import('@/pages/org/AppointmentDetailPage.vue')
        },


        // =============== 전자결재 ===============

        // 기안 작성
        {
            path: '/draftdoc/draftcreate',
            component: () => import('@/components/draftdoc/draftcreate/DraftTemplateList.vue')
        },

        // 임시저장함
        // {
        //     path: '/draftdoc/temporarydoc',
        //     component: () => import('@/components/draftdoc/draftcreate/TemporaryDoc.vue')
        // },

        //기안함
        // {
        //     path: '/draftdoc/mydraft',
        //     component: () => import('@/')
        // },

        // 결재함
        // {
        //     path: '/draftdoc/approve',
        //     component: () => import('@/')
        // },

        // 수신함 
        // {
        //     path: '/draftdoc/inbox',
        //     component: () => import('@/')
        // },

        // 참조함
        // {
        //     path: '/draftdoc/reference',
        //     component: () => import('@/')
        // },

        {
            path: '/org/draftlis/formA',
            component: () => import('@/components/draftdoc/forms/DraftFormA.vue')
        },
        {
            path: '/org/draftlis/formB',
            component: () => import('@/components/draftdoc/forms/DraftFormB.vue')
        },
        // {
        //     path: '/draftdoc/mydraft/submitted',
        //     component: () => import('@/components/draftdoc/mydraft/Submitted.vue')
        // }
        


        // =============== 급여 관리 ===============

        // 내  급여 명세서 조회
        {
            path: '/salary/payroll/slip',
            component: () => import('@/components/salary/payroll/PayrollSlip.vue')
        },

        // 급여명세서 발급
        {
            path: '/salary/payroll/issue',
            component: () => import('@/components/salary/payroll/PayrollSlipIssue.vue')
        },

        // 예상 퇴직금 조회
        // {
        //     path: '/salary/retirement/estimate',
        //     component: () => import('@/components/salary/retirement/RetirementEstimate.vue')
        // },

        // 퇴직금 지급 현황
        // {
        //     path: '/salary/retirement/status',
        //     component: () => import('@/components/salary/retirement/RetirementPaymentStatus.vue')
        // },


        // =============== 평가 및 성과 ===============

        // 평가
        {
            path: '/org/evaluation',
            component: () => import('@/components/Evaluation/EvaluationPage.vue')
        },

        // 목표 설정
        {
            path: '/org/goals',
            component: () => import('@/components/Goals/GoalListPage.vue')
        },

        // 성과 이력
        // {
        //     path: '/org/achievment',
        //     component: () => import('@/')
        // },
        

        // =============== 공지사항 ===============


        // 공지사항 목록 조회
        {
            path: '/post',
            component: () => import('@/components/post/PostListPage.vue')
        },


        // 공지사항 등록 
        {
            path: '/post/postEnroll',
            component: () => import('@/components/post/PostEnroll.vue')
        },
        
        // 공지사항 상세 조회
        {
            path: '/post/postDetail/:id',
            name : 'PostDetail',
            component: () => import('@/components/post/PostDetailPage.vue')
        },


        // =============== 용어사전 ===============

        {
            path: '/dictionary',
            component: () => import('@/components/dictionary/DictionaryPage.vue')
        },
    ]
})

export default router