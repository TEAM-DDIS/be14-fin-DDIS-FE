<template>
  <div class="performance-page">
    <h1 class="page-title">전체 성과 이력</h1>

    <!-- 인사팀인 경우에만 전체/나의 조회 토글 버튼 노출 -->
    <div v-if="isHR" class="toggle-btn-wrapper" style="text-align: right; margin-bottom: 10px;">
      <button @click="toggleView" class="toggle-btn">
        {{ viewingAll ? '나의 성과 조회' : '전체 성과 조회' }}
      </button>
    </div>

    <div class="ag-grid-wrapper">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :pagination="true"
        style="height: 500px; width: 100%; margin: 0 auto;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import AgGrid from '@/components/grid/BaseGrid.vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// JWT 페이로드 디코딩
function getPayload() {
  try {
    const base64 = userStore.accessToken.split('.')[1]
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalized))
  } catch {
    return {}
  }
}

// 인사팀 여부
const isHR = computed(() => {
  const payload = getPayload()
  return Array.isArray(payload.auth) && payload.auth.includes('ROLE_HR')
})

// “전체 모드”인지 여부 (인사팀만 토글 가능)
const viewingAll = ref(isHR.value)

// 호출할 엔드포인트 결정
const endpoint = computed(() => {
  if (!isHR.value) {
    return '/review/history/employee'
  }
  return viewingAll.value
    ? '/review/history/all'
    : '/review/history/employee'
})

// 컬럼 정의 (기존 그대로)
const columnDefs = ref([
  { headerName: '사번', field: 'employeeId', width: 180 },
  { headerName: '이름', field: 'employeeName', width: 180 },
  { headerName: '직급', field: 'rankName', width: 140 },
  { headerName: '부서', field: 'departmentName', width: 180 },
  { headerName: '팀', field: 'teamName', width: 180 },
  { headerName: '평가 기간', field: 'yearMonth', width: 160 },
  { headerName: '성과 내용', field: 'performanceContent', width: 230 },
  { headerName: '성과 수치', field: 'performanceValue', width: 140 },
  {
    headerName: '평가 점수',
    field: 'reviewScore',
    flex: 1,
    valueFormatter: ({ value }) => (value != null ? `${value} 점` : '-')
  }
])

const rowData = ref([])

// 데이터 로드 함수
async function loadData() {
  const url = `http://localhost:8000${endpoint.value}`
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    })
    rowData.value = res.ok ? await res.json() : []
  } catch (e) {
    console.error('로드 오류:', e)
    rowData.value = []
  }
}

// 토글 버튼 클릭 핸들러
function toggleView() {
  viewingAll.value = !viewingAll.value
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.performance-page {
  padding: 24px;
}

.page-title {
  margin-bottom: 20px;
  font-size: 24px;
  color: #00a8e8;
  font-weight: bold;
}

/* 토글 버튼 스타일 (예시) */
.toggle-btn-wrapper .toggle-btn {
    margin-left: auto;
    font-size: 14px;
    font-weight: bold;
    background-color: #00a8e8;
    color: white;
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 30px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}

.toggle-btn-wrapper .toggle-btn:hover {
  background: #0088c8;
}

.ag-grid-wrapper {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>