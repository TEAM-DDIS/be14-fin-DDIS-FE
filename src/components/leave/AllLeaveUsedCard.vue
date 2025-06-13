<template>
    <div class="all-leave-used-card">
        <div class="section">
            <!-- 검색 + 필터 -->
            <div class="filters-row">
                <div class="search-bar">
                    <img src="@/assets/icons/search.svg" class="search" />
                    <input v-model="searchKeyword" placeholder="사번 또는 성명 검색" />
                </div>
                <div class="filters">
                    <div>
                        <label>본부 </label>
                        <select v-model="filters.headName" class="fixed-select">
                            <option value="">전체 본부</option>
                            <option v-for="h in uniqueHeads" :key="h">{{ h }}</option>
                        </select>
                    </div>
                    <div>
                        <label>부서 </label>
                        <select v-model="filters.departmentName" class="fixed-select">
                            <option value="">전체 부서</option>
                            <option v-for="d in filteredDepartments" :key="d">{{ d }}</option>
                        </select>
                    </div>
                    <div>
                        <label>팀 </label>
                        <select v-model="filters.teamName" class="fixed-select">
                            <option value="">전체 팀</option>
                            <option v-for="t in filteredTeams" :key="t">{{ t }}</option>
                        </select>
                    </div>
                    <div>
                        <label>직급 </label>
                        <select v-model="filters.rankName" class="fixed-select">
                            <option value="">전체 직급</option>
                            <option v-for="r in uniqueRanks" :key="r">{{ r }}</option>
                        </select>
                    </div>
                </div>
            </div>
            <!-- 표 -->
            <AgGrid
                class="ag-theme-alpine custom-theme"
                :gridOptions="{ theme: 'legacy' }"
                :columnDefs="columnDefs"
                :rowData="filteredEmployees"
                height="600px"
                :pagination="true"
                :paginationPageSize="10"
                :style="{ width: '100%' }"
            />
        </div>
    </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import AgGrid from '@/components/grid/BaseGrid.vue'

  const employees = ref([])
  const searchKeyword = ref('')
  const filters = reactive({
    headName: '',
    departmentName: '',
    teamName: '',
    rankName: ''
  })

  const props = defineProps({
    dateRange: {
      type: Object,
      default: () => ({ start: '', end: '' })
    }
  })

  const columnDefs = [
    { headerName: '번호', valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false },
    { headerName: '사번', field: 'employeeCode' },
    { headerName: '성명', field: 'employeeName' },
    { headerName: '구분', field: 'leaveType' },
    { headerName: '처리상태', field: 'approvalStatus' },
    { headerName: '신청일', field: 'requestDate' },
    { headerName: '시작일', field: 'startDate' },
    { headerName: '종료일', field: 'endDate' },
    { headerName: '사용일수', field: 'leaveDays' },
    { headerName: '사유', field: 'reason' },
    { headerName: '반려사유', field: 'rejectReason' }
  ]

  onMounted(async () => {
    try {
      const res = await fetch('http://localhost:8000/attendance/leave/history/used/all')
      const json = await res.json()
      employees.value = json
    } catch (err) {
      console.error('연차 사용 내역 조회 실패:', err)
    }
  })

  const uniqueHeads = computed(() =>
    [...new Set(employees.value.map(e => e.headName).filter(Boolean))]
  )
  const uniqueRanks = computed(() =>
    [...new Set(employees.value.map(e => e.rankName).filter(Boolean))]
  )
  const filteredDepartments = computed(() =>
    [...new Set(employees.value.filter(e => !filters.headName || e.headName === filters.headName).map(e => e.departmentName).filter(Boolean))]
  )
  const filteredTeams = computed(() =>
    [...new Set(employees.value.filter(e => !filters.departmentName || e.departmentName === filters.departmentName).map(e => e.teamName).filter(Boolean))]
  )

  const filteredEmployees = computed(() => {
    const keyword = searchKeyword.value.toLowerCase()

    return employees.value.filter(e => {
      const inKeyword =
        !keyword ||
        e.employeeCode.includes(keyword) ||
        e.employeeName.toLowerCase().includes(keyword)

      const inOrgFilter =
        (!filters.headName || e.headName === filters.headName) &&
        (!filters.departmentName || e.departmentName === filters.departmentName) &&
        (!filters.teamName || e.teamName === filters.teamName) &&
        (!filters.rankName || e.rankName === filters.rankName)

      const requestMonth = e.requestDate?.slice(0, 7)
      const inDateRange =
        (!props.dateRange.start || requestMonth >= props.dateRange.start) &&
        (!props.dateRange.end || requestMonth <= props.dateRange.end)
      return inKeyword && inOrgFilter && inDateRange
    })
  })
</script>


<style scoped>
  .all-leave-used-card {
    background: #fff;
    padding: 30px;
    border-radius: 0px 12px 12px 12px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    flex-wrap: wrap;
  }

  .filters-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
  }

  .search-bar {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .search-bar input {
    width: 150px;
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .search {
    width: 20px;
  }

  .filters {
    display: flex;
    gap: 30px;
    flex-wrap: wrap;
  }

  .filters select {
    padding: 6px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .fixed-select {
    width: 150px;
  }
</style>
