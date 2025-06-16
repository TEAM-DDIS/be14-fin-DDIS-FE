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
        <AllCommuteCard @row-click="handleRowClick"
        :commuteList="commuteList"
        :dateRange="dateRange"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DateFilter from '@/components/leave/DateFilter.vue'
import AllCommuteCard from '@/components/commute/AllCommuteCard.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const commuteList = ref([])
const router = useRouter()
const dateRange = ref({ start: '', end: '' })

async function handleSearch(range) {
  dateRange.value = range

  const token = userStore.accessToken
  if (!token) {
    console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
    return
  }

  try {
    const query = new URLSearchParams({
      startDate: range.start,
      endDate: range.end
    })
    const res = await fetch(`http://localhost:8000/attendance/commute/summary/all?${query}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText)
    }

    const json = await res.json()
    commuteList.value = json
  } catch (err) {
    console.error('출퇴근 내역 조회 실패:', err)
    alert('조회 중 오류가 발생했습니다.')
  }
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
</style>
