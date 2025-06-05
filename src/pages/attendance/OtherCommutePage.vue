<template>
    <div>
        <h1 class="page-title">
            <img src="@/assets/icons/back_btn.svg" alt="back" class="back-btn" @click="goBack"/>
            상세 출퇴근 조회</h1>
        <div class="all-leave-page">
            <div class="employee-info">
                <span class="desc">사원 정보</span>
                <EmployeeInfo :employee-id="employeeId"/>
            </div>
            
            <!-- 날짜 필터 -->
            <div class="date-filter">
                <span class="desc">기간 설정</span>
                <DateFilter @search="handleSearch" />
            </div>
            <div>
                <OtherCommuteSummary :commuteList="commuteList"/>
            </div>
            <div>
                <span class="desc">출퇴근 내역</span>
                <OtherCommuteCard :employee-id="employeeId"/>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DateFilter from '@/components/leave/DateFilter.vue'
import EmployeeInfo from '@/components/commute/EmployeeInfo.vue'
import OtherCommuteSummary from '@/components/commute/OtherCommuteSummary.vue'
import OtherCommuteCard from '@/components/commute/OtherCommuteCard.vue'

const route = useRoute()
const router = useRouter()
const employeeId = route.params.employeeId

const commuteList = ref([])

function goBack() {
  router.back()
}

function handleSearch(range) {
  console.log('조회기간:', range)
}
</script>

<style scoped>
    .page-title {
        margin-left: 20px;
        margin-bottom: 30px;
        color: #00a8e8;
    }

    .back-btn {
        width: 24px;
        margin-right: -10px;
        cursor: pointer;

    }

    .desc {
        display: block;
        margin-bottom: 10px;
        font-size: 18px;
    }

    .all-leave-page {
        padding: 20px;
    }

    .employee-info {
        margin-bottom: 50px;
    }

    .date-filter {
        margin-bottom: 50px;
    }

</style>
