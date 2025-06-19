<template>
    <div>
        <h1 class="page-title">전체 연차 관리</h1>
        <div class="all-leave-page">
            <!-- 날짜 필터 -->
            <div class="date-filter">
                <span class="desc">기간 설정</span>
                <DateFilter @search="handleSearch" />
            </div>
            <!-- 겹치는 탭 -->
            <div class="tab-wrapper">
                <div class="tab-menu">
                    <button
                    :class="{ active: activeTab === 'used' }"
                    @click="activeTab = 'used'"
                    >
                    사용내역
                    </button>
                    <button
                    :class="{ active: activeTab === 'regist' }"
                    @click="activeTab = 'regist'"
                    >
                    신청내역
                    </button>
                </div>
            </div>
            <!-- 탭 내용 -->
            <div class="tab-content">
                <AllLeaveUsedCard v-if="activeTab === 'used'"
                :dateRange="dateRange"/>
                <AllLeaveRegistCard v-if="activeTab === 'regist'"
                :dateRange="dateRange"/>
            </div>
        </div>
    </div>
    <BaseToast ref="toastRef" />
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import DateFilter from '@/components/leave/DateFilter.vue'
    import AllLeaveUsedCard from '@/components/leave/AllLeaveUsedCard.vue'
    import AllLeaveRegistCard from '@/components/leave/AllLeaveRegistCard.vue'
    import { useRouter } from 'vue-router'
    import { useUserStore } from '@/stores/user'
    import BaseToast from '@/components/toast/BaseToast.vue'

    const toastRef = ref(null)

    function showToast(msg) {
        toastRef.value?.show(msg)
    }

    const router = useRouter()
    const userStore = useUserStore()

    const activeTab = ref('used')
    const dateRange = ref({ start: '', end: '' })

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
            )
            return JSON.parse(jsonPayload)
        } catch (e) {
            return null
        }
    }

    const decoded = parseJwt(userStore.accessToken)

    // 접근 권한 확인
    onMounted(() => {
        if (!decoded?.auth?.includes('ROLE_HR')) {
            showToast('접근 권한이 없습니다.')
            router.push('/error403')
        }
    })

    function handleSearch(range) {
        dateRange.value = range
        console.log('조회기간:', range)
    }
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 30px;
        color: #00a8e8;
    }

    .desc {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
    }

    .all-leave-page {
        padding: 20px;
    }

    .date-filter {
        margin-bottom: 50px;
    }

    /* 🔷 겹쳐지는 탭 스타일 */
    .tab-wrapper {
        position: relative;
        z-index: 2;
    }

    .tab-menu {
        display: flex;
        align-items: flex-end;
        gap: 0;
        position: relative;
    }

    /* 기본 탭 버튼 */
    .tab-menu button {
        font-size: 18px;
        padding: 10px 30px;
        border: none;
        border-bottom: none;
        background-color: #C8C8C8;
        color: white;
        cursor: pointer;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        position: relative;
        z-index: 1;
        margin-right: -20px; /* ✅ 가로 겹치기 */
        transition: all 0.2s ease;
    }

    /* 선택된 탭 위로 */
    .tab-menu button.active {
        background-color: #fff;
        color: #000;
        z-index: 3;
    }
</style>
