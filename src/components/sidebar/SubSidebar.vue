<template>
  <aside class="sub-sidebar" v-if="menu && subSections" @mouseleave="handleLeave">
    <div class="main-title">{{ menu }}</div>

    <div
        v-for="(sectionData, section, index) in subSections"
        :key="index"
        class="submenu-section"
    >
        <div
            class="submenu-title"
            @click="goTo(sectionData.path)"
        >
            {{ section }}
        </div>

        <!-- ✅ items가 있을 때만 렌더링 -->
        <ul class="submenu-list" v-if="sectionData.items">
            <template v-for="(item, i) in filteredItems(sectionData.items)" :key="i">
                <li>
                <RouterLink
                    v-if="item.path"
                    :to="item.path"
                    class="submenu-link"
                >
                    {{ item.name }}
                </RouterLink>
                <span v-else>{{ item.name }}</span>
                </li>
            </template>
        </ul>
    </div>
   </aside>
</template>


<script setup>
    import { computed } from 'vue'
    import { RouterLink, useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/user'

    const userStore  = useUserStore()
    const isHrTeam   = computed(() => {
    // 액세스 토큰이 'deptName' 혹은 'roles'에 HR이 있으면 true
    try {
        const payload = JSON.parse(
        atob(userStore.accessToken.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))
        )
        return (
        payload.deptName === '인사부서' ||            // 부서명으로 체크
        payload.auth?.includes('ROLE_HR')                // 롤로 체크
        )
    } catch { return false }
    })
    function filteredItems(items) {
        return items.filter(it => !(it.hrOnly && !isHrTeam.value))
    }


    const props = defineProps({
        menu: String
    })
    const router = useRouter()

    function goTo(path) {
        if (path) router.push(path)
    }

    const emit = defineEmits(['clear-menu'])

    function handleLeave() {
        emit('clear-menu') // 부모에게 사라지라고 알림
    }
    const subMenuMap = {
        '인사 정보': {
            '사원 조회': {
                items: [
                    {
                        name: '내 인사 정보',
                        path: '/employeeInfo/myInfo'
                    },
                    {
                        name: '사원 목록 조회',
                        path: '/employeeInfo/employeeList'
                    },
                    {
                        name: '계약서/법정서류 관리',
                        path: '/employeeInfo/Contract'
                    },
                    {
                        name: '징계 관리',
                        path: '/employeeInfo/disciplinary'
                    },
                        
                ]
            }
        },

        '근태 관리': {
            '근태 현황': {
                items: [
                    { 
                        name: '내 근태 현황', 
                        path: '/attendance/myAttendance',
                    },
                    { 
                        name: '팀 근태 현황',
                        path: '/attendance/teamAttendance',
                    },
                    { 
                        name: '내 출근 정정 관리',
                        path: '/attendance/myCorrection',
                    },
                    { 
                        name: '전체 출근 정정 관리',
                        path: '/attendance/allCorrection',
                        hrOnly: true 
                    },
                ]
            },
            '출퇴근 관리': {
                items: [
                    { 
                        name: '내 출퇴근 관리',
                        path: '/attendance/myCommute',
                    },
                    { 
                        name: '전체 출퇴근 관리',
                        path: '/attendance/allCommute',
                        hrOnly: true 
                    },
                ]
            },
            '휴가 관리': {
                items: [
                    { 
                        name: '내 연차 관리',
                        path: '/attendance/myLeave',
                    },
                    { 
                        name: '전체 연차 관리',
                        path: '/attendance/allLeave',
                        hrOnly: true
                    },
                ]
            }
        },
        
        '조직 및 직무': {
            '조직 구성': {
                items: [
                    { 
                        name: '조직 구성 조회',
                        path: '/org/structure',
                    },
                ]
            },
            '조직 및 직무 소개': {
                items: [
                    { 
                        name: '조직 및 직무 소개',
                        path: '/org/introduction',
                    },
                ]
            },
            '인사발령': {
                items: [
                    { 
                        name: '인사발령 이력',
                        path: '/org/appointment',
                    },
                    { 
                        name: '인사발령 등록',
                        path: '/org/appointment/register',
                        hrOnly: true
                    },
                ]
            },
        },

        '전자 결재': {
            '기안 작성': {
                items: [
                    {
                        name: '기안양식함', 
                        path: '/eapproval/temp'
                    },
                    {
                        name: '임시저장함', 
                        path: '/eapproval/temporarydoc'
                    },
                ]
            },
            '문서함': {
                items: [
                    {
                        name: '기안함', 
                        path: '/eapproval/mydraft'
                    },
                    {
                        name: '결재함', 
                        path: '/eapproval/approve'
                    },
                    {
                        name: '수신함', 
                        path: '/eapproval/receiver'
                    },
                    {
                        name: '참조함', 
                        path: '/eapproval/reference'
                    },
                ]
            },
        },

        '급여': {
            '급여 관리': {
                items: [
                    { 
                        name: '내 급여명세서 조회',
                        path: '/salary/payroll/slip'
                    },
                    { 
                        name: '급여명세서 발급', 
                        path: '/salary/payroll/issue',
                        hrOnly: true 
                    },
                ]
            },
            '퇴직 관리': {
                items: [
                    { 
                        name: '예상 퇴직금 계산', 
                        path: '/salary/retirement/estimate' 
                    },
                    { 
                        name: '퇴직금 지급 현황', 
                        path: '/salary/retirement/status',
                        hrOnly: true 
                    },
                ]
            }
        },

        '평가 및 성과': {
            '평가 관리': {
                items: [
                    { 
                        name: '평가', 
                        path: '/org/evaluation'
                    },
                    {
                        name: '내가 쓴 평가',
                        path: '/org/myevaluation'
                    }
                ]
            },
            '성과 관리': {
                items: [
                    { 
                        name: '목표', 
                        path: '/org/goals'
                    },
                    { 
                        name: '성과 이력',
                        path: '/org/achievment',
                        hrOnly: true
                    },
                ]
            }
        },
    }
    const subSections = computed(() => subMenuMap[props.menu] || null)
</script>

<style scoped>
    .sub-sidebar {
        margin-top: -6px;
        box-shadow: 2px 0 5px rgba(0,0,0,0.05);

        width: 180px;
        padding: 20px 12px;
        background-color: #f5f5f5;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 30px;
      


    }

    .main-title {
        border: 3px solid #00a8e8;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        height: 50px;
        font-size: 17px;
        font-weight: bold;
        text-align: center;
        padding: 10.5px 0;
        width: calc(100% + 12px); /* ✅ 사이드바 오른쪽 padding 무시 */
        margin-left: -12px;       /* ✅ 사이드바 padding 보정 */
        margin-right: auto; 

        box-sizing: border-box;
        transition: background-color 0.3s ease;
    }

    .submenu-section {
        display: flex;
        flex-direction: column;
    }

    .submenu-title {
        font-weight: bold;
        font-size: 14px;
        padding-bottom: 4px;
        margin-bottom: 6px;
        border-bottom: 1px solid #ccc;
        color: #222;
        margin-top: 15px;
        transition: color 0.2s ease;
    }

    /* — 기존 .submenu-list 스타일 — */
    .submenu-list {
        list-style: none;
        padding: 0;
        margin: 0;
        
    }

    /* — 링크만 스타일 초기화 — */
    .submenu-link,
    .submenu-link:link,
    .submenu-link:visited {
        color: inherit;        /* 부모 li의 색(#333)을 물려받음 */
        text-decoration: none; /* 밑줄 제거 */
    }

    .submenu-list li {
        font-size: 14px;
        padding: 2px 0;
        padding-left: 6px;
        color: #333;
        cursor: pointer;
        text-decoration: none;
    }

    .submenu-list li:hover {
        text-decoration: underline;
        color: #00a8e8;
    }
</style>
