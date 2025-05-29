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
            <li
            v-for="(item, i) in sectionData.items"
            :key="i"
            >
            <RouterLink
                v-if="item.path"
                :to="item.path"
                class="submenu-link"
            >
                {{ item.name }}
            </RouterLink>
            <span v-else>{{ item.name }}</span> <!-- 경로 없으면 그냥 텍스트로 표시 -->
            </li>
        </ul>
    </div>
  </aside>
</template>


<script setup>
    import { computed } from 'vue'
    import { RouterLink, useRouter } from 'vue-router'


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
            '사원조회':{

            },
            '내 인사정보':{

            }
        },
        '근태 관리': {
            '근태 현황': {
            items: [
                { name: '내 근태 현황', },
                { name: '팀 근태 현황', },
                { name: '내 출근 정정 관리', },
                { name: '전체 출근 정정 관리', }
            ]
            },
            '출퇴근 관리': {
                items: [
                    { name: '내 출퇴근 관리', },
                    { name: '전체 출퇴근 관리', }
                ]
            },
            '휴가 관리': {
                items: [
                    { name: '내 연차 관리', },
                    { name: '전체 연차 관리', }
                ]
            }
        },
        '조직 및 직무': {
            '조직 구성': {
                path: '/org/structure',
            },
            '조직 및 직무 소개': {
                path: '/org/introduction',
            },
            '인사발령': {
                path: '/org/appointment',
            }
        },
        '전자 결재': {
            '기안 작성': {

            },
            '기안함': {

            },
            '결재함': {

            },
            '수신함': {

            },
            '참조함': {

            },
        },
        '급여': {
            '급여 관리': {
                items: [
                    { name: '내 급여명세서 조회', },
                    { name: '급여명세서 발급', }
                ]
            },
            '퇴직 관리': {
                items: [
                    { name: '예상 퇴직금 조회', },
                    { name: '퇴직금 지급 현황', }
                ]
            }
        },
        '평가 및 성과': {
            '평가 관리': {
                items: [
                    { name: '평가', path: '/org/evaluation'}
                ]
            },
            '성과 관리': {
                items: [
                    { name: '목표', path: '/org/goals'},
                    { name: '성과 이력', }
                ]
            }
        },
    }

    const subSections = computed(() => subMenuMap[props.menu] || null)
</script>

<style scoped>
    .sub-sidebar {
        width: 180px;
        padding: 20px 12px;
        background-color: #f5f5f5;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 30px;
        margin-top: 30px
    }

    .main-title {
        border: 5px solid #00a8e8;
        border-top-right-radius: 20px;
        border-bottom-right-radius: 20px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;

        font-size: 16px;
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
        margin-top: 20px;

        cursor: pointer; /* ✅ 추가: 제목에도 손가락 커서 */
        transition: color 0.2s ease;
    }

    .submenu-list {
        list-style: none;
        padding: 0;
        margin: 0;
        text-decoration: none;
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
    }
</style>
