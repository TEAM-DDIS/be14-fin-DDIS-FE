<template>
  <div class="performance-page">
    <h1 class="page-title">전체 성과 이력</h1>


    <div class="ag-grid-wrapper">
      <div class="filters-container">
      <!-- 왼쪽: 이름 검색 -->
      <div class="filters-left">
        <div class="filter-item">
          <label for="searchName">이름</label>
          <input
            id="searchName"
            v-model="searchName"
            placeholder="이름 검색"
          />
        </div>
      </div>

      <!-- 오른쪽: 연도·부서·팀 필터 -->
      <div class="filters-right">
        <div class="filter-item">
          <label for="yearFilter">연도</label>
          <select id="yearFilter" v-model="filters.year">
            <option value="">전체</option>
            <option v-for="y in uniqueYears" :key="y">{{ y }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="deptFilter">부서</label>
          <select id="deptFilter" v-model="filters.departmentName">
            <option value="">전체</option>
            <option v-for="d in uniqueDepartments" :key="d">{{ d }}</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="teamFilter">팀</label>
          <select id="teamFilter" v-model="filters.teamName">
            <option value="">전체</option>
            <option v-for="t in uniqueTeams" :key="t">{{ t }}</option>
          </select>
        </div>
      </div>
    </div>
    
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        :pagination="true"
        style="height: 500px; width: 100%; margin: 0 auto;"
      />
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted,reactive, computed  } from 'vue'
import AgGrid from '@/components/grid/BaseGrid.vue'
import { useUserStore } from '@/stores/user'

// 컬럼 정의

const searchName = ref('')
const filters = reactive({
  year: '',
  departmentName: '',
  teamName: ''
})
const token = useUserStore().accessToken

// 행 데이터
const rowData = ref([])

// 전체 성과 이력 조회
async function loadData() {
  const url = 'http://localhost:5000/review/history/all'
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
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

// 고유 연도·부서·팀 리스트
const uniqueYears = computed(() =>
  Array.from(new Set(rowData.value.map(r => r.yearMonth.slice(0,4)))).sort((a,b)=>b-a)
)
const uniqueDepartments = computed(() =>
  Array.from(new Set(rowData.value.map(r => r.departmentName))).filter(Boolean)
)
const uniqueTeams = computed(() =>
  Array.from(new Set(
    rowData.value
      .filter(r => !filters.departmentName || r.departmentName === filters.departmentName)
      .map(r => r.teamName)
  )).filter(Boolean)
)

// 필터 적용된 데이터
const filteredData = computed(() =>
  rowData.value.filter(r => {
    // 연도 필터
    const yearMatch = !filters.year || r.yearMonth.slice(0,4) === filters.year
    // 이름 검색 (case-insensitive)
    const nameMatch = !searchName.value ||
      r.employeeName.toLowerCase().includes(searchName.value.toLowerCase())
    // 부서 필터
    const deptMatch = !filters.departmentName || r.departmentName === filters.departmentName
    // 팀 필터
    const teamMatch = !filters.teamName || r.teamName === filters.teamName

    return yearMatch && nameMatch && deptMatch && teamMatch
  })
)
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
.filters-container {
 
  padding: 16px;
  display: flex;
  justify-content: space-between;  /* 왼쪽·오른쪽 분리 */
  align-items: flex-end;
  margin-bottom: 16px;
}

.filters-left {
  flex: 0 0 auto;
}

/* 오른쪽: 나머지 필터들 */
.filters-right {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 공통 filter-item */

.filter-item label {
  font-size: 14px;
  margin-bottom: 4px;
  font-weight: 600;
  margin-right: 13px;
}
.filter-item input,
.filter-item select {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  min-width: 100px;
}
</style>
