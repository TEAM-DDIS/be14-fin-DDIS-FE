<template>
  <div>
    <h1 class="page-title">전체 출퇴근 관리</h1>
    <div class="all-leave-page">
      <!-- 날짜 필터 -->
      <div class="date-filter">
        <span class="desc">기간 설정</span>
        <DateFilter @search="handleSearch" />
      </div>

      <!-- 출퇴근 테이블 -->
      <div>
        <span class="desc">출퇴근 내역</span>
        <AllCommuteCard @row-click="handleRowClick" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DateFilter from '@/components/leave/DateFilter.vue'
import AllCommuteCard from '@/components/commute/AllCommuteCard.vue'

const router = useRouter()

function handleSearch(range) {
  console.log('조회기간:', range)
  // 추후 range.start, range.end로 필터 적용 가능
}

function handleRowClick(row) {
  router.push({
    name: 'OtherCommutePage',
    params: { employeeId: row.employeeId }
  })
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
</style>
