<template>
  <div class="performance-page">
    <h1 class="page-title">전체 성과 이력</h1>

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
import { ref, onMounted } from 'vue'
import AgGrid from '@/components/grid/BaseGrid.vue'

// 컬럼 정의
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

// 행 데이터
const rowData = ref([])

// 전체 성과 이력 조회
async function loadData() {
  const url = 'http://localhost:8000/review/history/all'
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

.ag-grid-wrapper {
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
