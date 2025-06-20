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

        {
            path: '/org/findpassword',
            component: () => import('@/components/login/PasswordFindPage.vue')
        },


        // =============== 인사 정보 ===============

        // 내 인사 정보
        {
            path: '/employeeInfo/myInfo',
            component: () => import('@/components/employeeInfo/MyEmployeePage.vue')
        },

        // 사원 목록 조회
        {
            path: '/employeeInfo/employeeList',
            component: () => import('@/components/employeeInfo/EmployeeList.vue')
        },

        // 사원 상세 조회
        {
            path: '/employeeInfo/:id',
            name: 'EmployeeDetail',
            component: () => import('@/components/employeeInfo/EmployeeDetailPage.vue')
        },

        // 사원 등록 
        {
            path: '/employeeInfo/employeeEnroll',
            component: () => import('@/components/employeeInfo/EmployeeEnroll.vue')
        },

        // 계약서/법정서류 관리
        {
            path: '/employeeInfo/Contract',
            component: () => import('@/components/employeeInfo/ContractList.vue')
        },
        // 계약서/법정서류 등록
        {
            path: '/employeeInfo/Contract/ContractEnroll',
            component: () => import('@/components/employeeInfo/ContractEnroll.vue')
        },

        // 징계 관리
        {
            path: '/employeeInfo/disciplinary',
            component: () => import('@/components/employeeInfo/disciplinaryList.vue')
        },

        // 징계 등록
        {
            path: '/employeeInfo/disciplinary/disciplinaryEnroll',
            component: () => import('@/components/employeeInfo/disciplinaryEnroll.vue')
        },


        // =============== 근태 관리 ===============

        // 내 근태 현황
        {
            path: '/attendance/myAttendance',
            component: () => import('@/pages/attendance/MyAttendancePage.vue')
        },

        // 팀 근태 현황
        {
            path: '/attendance/teamAttendance',
            component: () => import('@/pages/attendance/TeamAttendancePage.vue')
        },

        // 내 출근 정정 관리
        {
            path: '/attendance/myCorrection',
            component: () => import('@/pages/attendance/MyCorrectionPage.vue')
        },

        // 전체 출근 정정 관리
        {
            path: '/attendance/allCorrection',
            component: () => import('@/pages/attendance/AllCorrectionPage.vue')
        },

        // 내 출퇴근 관리
        {
            path: '/attendance/myCommute',
            component: () => import('@/pages/attendance/MyCommutePage.vue')
        },

        // 전체 출퇴근 관리
        {
            path: '/attendance/allCommute',
            component: () => import('@/pages/attendance/AllCommutePage.vue')
        },

        {
            path: '/attendance/allCommute/:employeeId',
            name: 'OtherCommutePage',
            component: () => import('@/pages/attendance/OtherCommutePage.vue'),
            props: true
        },

        // 내 연차 관리
        {
            path: '/attendance/myLeave',
            component: () => import('@/pages/attendance/MyLeavePage.vue')
        },

        // 전체 연차 관리
        {
            path: '/attendance/allLeave',
            component: () => import('@/pages/attendance/AllLeavePage.vue')
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
            path: '/org/appointment/:appointmentHistoryId',
            component: () => import('@/pages/org/AppointmentDetailPage.vue')
        },


        // =============== 전자결재 ===============

        // 기안 양식
        {
            path: '/eapproval/temp',
            name: 'DraftTempList',
            component: () => import('@/pages/eapproval/DraftTempListPage.vue')
        },
        // 상세페이지
        {
            path: '/eapproval/:docId',
            name: 'DraftDetail',
            component: () => import('@/pages/eapproval/DraftDetailPage.vue'),
            props: true   
        },
        // 임시저장함
        {
            path: '/eapproval/temporarydoc',
            component: () => import('@/pages/eapproval/TemporaryDoc.vue')
        },
        // 기안함
        {
            path: '/eapproval/mydraft',
            name: 'MyDraftBox',
            component: () => import('@/pages/eapproval/MyDraftBoxPage.vue')
        },

        // 결재함
        {
            path: '/eapproval/approve',
            name: 'ApprovalBox',
            component: () => import('@/pages/eapproval/ApprovalBoxPage.vue')
        },
        // 수신함 
        {
            path: '/eapproval/receiver',
            name: 'ReceiverBox',
            component: () => import('@/pages/eapproval/ReceiverBoxPage.vue')
        },
        // 참조함
        {
            path: '/eapproval/reference',
            name: 'ReferenceBox',
            component: () => import('@/pages/eapproval/ReferenceBoxPage.vue')
        },

        // 기안양식 (일반기안문서)
        {
            path: '/eapproval/formA',
            component: () => import('@/pages/eapproval/DraftFormA.vue')
        },
        // 기안양식 (외근신청서)
        {
            path: '/eapproval/formB',
            component: () => import('@/pages/eapproval/DraftFormB.vue')
        },        
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
            component: () => import('@/pages/salary/PayrollSlip.vue')
        },

        // 급여명세서 발급
        {
            path: '/salary/payroll/issue',
            component: () => import('@/pages/salary/PayrollSlipIssue.vue')
        },

        // 예상 퇴직금 계산
        {
            path: '/salary/retirement/estimate',
            component: () => import('@/pages/salary/RetirementEstimate.vue')
        },

        // 퇴직금 지급 현황
        {
            path: '/salary/retirement/status',
            component: () => import('@/pages/salary/RetirementPaymentStatus.vue')
        },

        // =============== 평가 및 성과 ===============

        // 평가
        {
            path: '/org/evaluation',
            component: () => import('@/components/Evaluation/EvaluationPage.vue')
        },

         // 내가 쓴 평가
        {
            path: '/org/myevaluation',
            name: 'MyEvaluations',
            component: () => import('@/components/Evaluation/MyEvalsPage.vue')
        },

        // 목표 설정
        {
            path: '/org/goals',
            component: () => import('@/components/Goals/GoalListPage.vue')
        },

        //성과 이력
        {
            path: '/org/achievment',
            component: () => import('@/pages/achievment/AchievmentPage.vue')
        },


       
        

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
            component: () => import('@/pages/dictionary/DictionaryPage.vue')
        },

        // =============== 에러 페이지 ===============

        // 403 페이지
        {
            path: '/error403',
            component: () => import('@/pages/error/Error403.vue'),
            meta: {
            hideLayout: true
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
    ]
})

export default router