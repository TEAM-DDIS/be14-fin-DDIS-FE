<template>
    <div>
        <h1 class="page-title">내 출퇴근 관리</h1>
        <div class="all-leave-page">
            <!-- 날짜 필터 -->
            <div class="date-filter">
                <span class="desc">기간 설정</span>
                <DateFilter @search="handleSearch" />
            </div>
            <div>
                <MyCommuteSummary :commuteList="commuteList"/>
            </div>
            <div>
                <span class="desc">출퇴근 내역</span>
                <MyCommuteCard/>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue'
    import DateFilter from '@/components/leave/DateFilter.vue'
import MyCommuteCard from '@/components/commute/MyCommuteCard.vue'
import MyCommuteSummary from '@/components/commute/MyCommuteSummary.vue'

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
