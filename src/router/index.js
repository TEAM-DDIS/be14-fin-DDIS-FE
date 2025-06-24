import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const publicPaths = [
  '/org/login',
  '/org/findpassword',
  '/error403',
  '/error404',
]

const router = createRouter({
    history: createWebHistory(),
    routes: [

        // =============== 메인 ===============
        {
            path: '/',
            component: () => import('@/pages/MainPage.vue'),
            meta: { requiresAuth: true }

        },


        // =============== 로그인 ===============
        {
            name :'Login',
            path: '/org/login',
            component: () => import('@/components/login/LoginPage.vue'),
            meta: { hideLayout : true}
        },

        {
            path: '/org/findpassword',
            component: () => import('@/components/login/PasswordFindPage.vue'),
            meta: { hideLayout : true}
        },


        // =============== 인사 정보 ===============

        // 내 인사 정보
        {
            path: '/employeeInfo/myInfo',
            component: () => import('@/components/employeeInfo/MyEmployeePage.vue'),
            meta: { requiresAuth: true }
        },

        // 사원 목록 조회
        {
            path: '/employeeInfo/employeeList',
            component: () => import('@/components/employeeInfo/EmployeeList.vue'),
            meta: { requiresAuth: true }
        },

        // 사원 상세 조회
        {
            path: '/employeeInfo/:id',
            name: 'EmployeeDetail',
            component: () => import('@/components/employeeInfo/EmployeeDetailPage.vue'),
            meta: { requiresAuth: true }
        },

        // 사원 등록 
        {
            path: '/employeeInfo/employeeEnroll',
            component: () => import('@/components/employeeInfo/EmployeeEnroll.vue'),
            meta: { requiresAuth: true }
        },

        // 계약서/법정서류 관리
        {
            path: '/employeeInfo/Contract',
            component: () => import('@/components/employeeInfo/ContractList.vue'),
            meta: { requiresAuth: true }
        },
        // 계약서/법정서류 등록
        {
            path: '/employeeInfo/Contract/ContractEnroll',
            component: () => import('@/components/employeeInfo/ContractEnroll.vue'),
            meta: { requiresAuth: true }
        },

        // 징계 관리
        {
            path: '/employeeInfo/disciplinary',
            component: () => import('@/components/employeeInfo/disciplinaryList.vue'),
            meta: { requiresAuth: true }
        },

        // 징계 등록
        {
            path: '/employeeInfo/disciplinary/disciplinaryEnroll',
            component: () => import('@/components/employeeInfo/disciplinaryEnroll.vue'),
            meta: { requiresAuth: true }
        },


        // =============== 근태 관리 ===============

        // 내 근태 현황
        {
            path: '/attendance/myAttendance',
            component: () => import('@/pages/attendance/MyAttendancePage.vue'),
            meta: { requiresAuth: true }
        },

        // 팀 근태 현황
        {
            path: '/attendance/teamAttendance',
            component: () => import('@/pages/attendance/TeamAttendancePage.vue'),
            meta: { requiresAuth: true }
        },

        // 내 출근 정정 관리
        {
            path: '/attendance/myCorrection',
            component: () => import('@/pages/attendance/MyCorrectionPage.vue'),
            meta: { requiresAuth: true }
        },

        // 전체 출근 정정 관리
        {
            path: '/attendance/allCorrection',
            component: () => import('@/pages/attendance/AllCorrectionPage.vue'),
            meta: { requiresAuth: true }
        },

        // 내 출퇴근 관리
        {
            path: '/attendance/myCommute',
            component: () => import('@/pages/attendance/MyCommutePage.vue'),
            meta: { requiresAuth: true }
        },

        // 전체 출퇴근 관리
        {
            path: '/attendance/allCommute',
            component: () => import('@/pages/attendance/AllCommutePage.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/attendance/allCommute/:employeeId',
            name: 'OtherCommutePage',
            component: () => import('@/pages/attendance/OtherCommutePage.vue'),
            props: true,
            meta: { requiresAuth: true }
        },

        // 내 연차 관리
        {
            path: '/attendance/myLeave',
            component: () => import('@/pages/attendance/MyLeavePage.vue'),
            meta: { requiresAuth: true }
        },

        // 전체 연차 관리
        {
            path: '/attendance/allLeave',
            component: () => import('@/pages/attendance/AllLeavePage.vue'),
            meta: { requiresAuth: true }
        },


        // =============== 조직 및 직무 ===============

        // 조직 구성 조회
        {
            path: '/org/structure',
            component: () => import('@/pages/org/StructurePage.vue'),
            meta: { requiresAuth: true }
        },

        // 조직 및 직무 소개
        {
            path: '/org/structure/edit',
            component: () => import('@/pages/org/EditStructurePage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/org/introduction',
            component: () => import('@/pages/org/IntroductionPage.vue'),
            meta: { requiresAuth: true }
        },

        {
            path: '/jobdetail/:teamId',
            component: () => import('@/pages/org/JobDetailPage.vue'),
            meta: { requiresAuth: true }
        },

        // 인사발령
        {
            path: '/org/appointment',
            component: () => import('@/pages/org/AppointmentPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/org/appointment/register',
            component: () => import('@/pages/org/RegisterAppointmentPage.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/org/appointment/:appointmentHistoryId',
            component: () => import('@/pages/org/AppointmentDetailPage.vue'),
            meta: { requiresAuth: true }
        },


        // =============== 전자결재 ===============

        // 기안 양식
        {
            path: '/eapproval/temp',
            name: 'DraftTempList',
            component: () => import('@/pages/eapproval/DraftTempListPage.vue'),
            meta: { requiresAuth: true }
        },
        // 상세페이지
        {
            path: '/eapproval/:docId',
            name: 'DraftDetail',
            component: () => import('@/pages/eapproval/DraftDetailPage.vue'),
            props: true,
            meta: { requiresAuth: true }   
        },
        // 임시저장함
        {
            path: '/eapproval/temporarydoc',
            component: () => import('@/pages/eapproval/TemporaryDoc.vue'),
            meta: { requiresAuth: true }
        },
        // 기안함
        {
            path: '/eapproval/mydraft',
            name: 'MyDraftBox',
            component: () => import('@/pages/eapproval/MyDraftBoxPage.vue'),
            meta: { requiresAuth: true }
        },

        // 결재함
        {
            path: '/eapproval/approve',
            name: 'ApprovalBox',
            component: () => import('@/pages/eapproval/ApprovalBoxPage.vue'),
            meta: { requiresAuth: true }
        },
        // 수신함 
        {
            path: '/eapproval/receiver',
            name: 'ReceiverBox',
            component: () => import('@/pages/eapproval/ReceiverBoxPage.vue'),
            meta: { requiresAuth: true }
        },
        // 참조함
        {
            path: '/eapproval/reference',
            name: 'ReferenceBox',
            component: () => import('@/pages/eapproval/ReferenceBoxPage.vue'),
            meta: { requiresAuth: true }
        },

        // 기안양식 (일반기안문서)
        {
            path: '/eapproval/formA',
            component: () => import('@/pages/eapproval/DraftFormA.vue'),
            meta: { requiresAuth: true }
        },
        // 기안양식 (연차신청서)
        // {
        //     path: '/eapproval/formB',
        //     component: () => import('@/pages/eapproval/DraftFormB.vue')
        // },        
        // {
        //     path: '/eapproval/formC',
        //     component: () => import('@/pages/eapproval/DraftFormC.vue')
        // },  
         // 상세페이지
        // {
        //     path: '/drafts/:docId', // ← 기안 문서 ID에 따라 상세 조회
        //     name: 'DraftDetail',
        //     component: () => import('@/pages/eapproval/DetailTest.vue')        
        // },
        // =============== 급여 관리 ===============

        // 내  급여 명세서 조회
        {
            path: '/salary/payroll/slip',
            component: () => import('@/pages/salary/PayrollSlip.vue'),
            meta: { requiresAuth: true }
        },

        // 급여명세서 발급
        {
            path: '/salary/payroll/issue',
            component: () => import('@/pages/salary/PayrollSlipIssue.vue'),
            meta: { requiresAuth: true }
        },

        // 예상 퇴직금 계산
        {
            path: '/salary/retirement/estimate',
            component: () => import('@/pages/salary/RetirementEstimate.vue'),
            meta: { requiresAuth: true }
        },

        // 퇴직금 지급 현황
        {
            path: '/salary/retirement/status',
            component: () => import('@/pages/salary/RetirementPaymentStatus.vue'),
            meta: { requiresAuth: true }
        },

        // =============== 평가 및 성과 ===============

        // 평가
        {
            path: '/org/evaluation',
            component: () => import('@/components/Evaluation/EvaluationPage.vue'),
            meta: { requiresAuth: true }
        },

         // 내가 쓴 평가
        {
            path: '/org/myevaluation',
            name: 'MyEvaluations',
            component: () => import('@/components/Evaluation/MyEvalsPage.vue'),
            meta: { requiresAuth: true }
        },

        // 목표 설정
        {
            path: '/org/goals',
            component: () => import('@/components/Goals/GoalListPage.vue'),
            meta: { requiresAuth: true }
        },

        //성과 이력
        {
            path: '/org/achievment',
            component: () => import('@/pages/achievment/AchievmentPage.vue'),
            meta: { requiresAuth: true }
        },


       
        

        // =============== 공지사항 ===============

        // 공지사항 목록 조회
        {
            path: '/post',
            component: () => import('@/components/post/PostListPage.vue'),
            meta: { requiresAuth: true }
        },


        // 공지사항 등록 
        {
            path: '/post/postEnroll',
            component: () => import('@/components/post/PostEnroll.vue'),
            meta: { requiresAuth: true }
        },
        
        // 공지사항 상세 조회
        {
            path: '/post/postDetail/:id',
            name : 'PostDetail',
            component: () => import('@/components/post/PostDetailPage.vue'),
            meta: { requiresAuth: true }
        },

        // =============== 용어사전 ===============

        {
            path: '/dictionary',
            component: () => import('@/pages/dictionary/DictionaryPage.vue'),
            meta: { requiresAuth: true }
        },

        // =============== 에러 페이지 ===============

        // 403 페이지
        {
            path: '/error403',
            component: () => import('@/pages/error/Error403.vue'),
            meta: {
            hideLayout: true,
            
            }
        },
    
        // 404 페이지
        {
            path: '/error404',
            component: () => import('@/pages/error/Error404.vue'),
            meta: {
            hideLayout: true
            }
        },
        { path: '/:pathMatch(.*)*', redirect: '/error404', meta: {
            hideLayout: true
            } }
    ]
})
router.beforeEach((to, from, next) => {

  const { accessToken: token } = useUserStore()

  // 1) publicPaths는 무조건 통과
  if (publicPaths.includes(to.path)) {
    return next()
  }

  // 2) 토큰 없으면 로그인 페이지로
  if (to.meta.requiresAuth && !token) {
    return next({ path: '/org/login' })
  }

  // 4) 그 외는 정상 접근
  next()
})


export default router