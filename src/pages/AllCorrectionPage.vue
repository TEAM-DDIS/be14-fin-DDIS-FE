<template>
    <div>
        <h1 class="page-title">전체 출근정정 관리</h1>
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
                <AllCorrectionUsedCard v-if="activeTab === 'used'" />
                <AllCorrectionRegistCard v-if="activeTab === 'regist'" />
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import DateFilter from '@/components/leave/DateFilter.vue'
    import AllCorrectionUsedCard from '@/components/correction/AllCorrectionUsedCard.vue'
    import AllCorrectionRegistCard from '@/components/correction/AllCorrectionRegistCard.vue'

    const activeTab = ref('used')

    function handleSearch(range) {
        console.log('조회기간:', range)
    }
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 50px;
        color: #00a8e8;
    }

    .desc {
        display: block;
        margin-left: 20px;
        margin-bottom: 10px;
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
