<template>
  <h1 class="page-title">인사발령</h1>

  <div class="content-box">
    <div class="personnel-grid-container">
      <!-- 상단 필터 및 액션 바 -->
      <div class="filter-box">
        <div class="filters">
          <label for="type-select">발령유형</label>
          <select id="type-select" v-model="selectedType">
            <option value="">전체</option>
            <option value="승진">승진</option>
            <option value="전보">전보</option>
            <option value="전직">전직</option>
            <option value="직급조정">직급조정</option>
            <option value="직무">직무</option>
          </select>
          <input
            type="text"
            placeholder="사원번호"
            v-model="filterEmployee"
          />
          <button class="action-btn primary" @click="onSearch">
            <i class="fa fa-search"></i> 조회
          </button>
        </div>
        <div class="actions">
          <button class="action-btn secondary" @click="onDelete">
            <i class="fa fa-trash"></i> 삭제
          </button>
          <button class="action-btn primary" @click="goToRegister">
            <i class="fa fa-plus"></i> 등록
          </button>
        </div>
      </div>

      <!-- AG Grid 테이블 -->
      <ag-grid-vue
        class="ag-theme-alpine custom-theme"
        style="width: 100%; height: 600px"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        rowSelection="multiple"
        :pagination="true"
        :paginationPageSize="10"
        @grid-ready="onGridReady"
      />
    </div>
  </div>
</template>

<script setup>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

const router = useRouter()
// 상태
const selectedType = ref('')
const filterEmployee = ref('')
const rowData = ref([])
let gridApi = null

// 등록 페이지로 이동
function goToRegister() {
  router.push('/org/appointment/register')
}

// 컬럼 정의
const columnDefs = [
  { headerName: '번호', field: 'appointment_id', width: 90, checkboxSelection: true },
  { headerName: '사원번호', field: 'employee_id', flex: 1 },
  { headerName: '발령유형', field: 'appointment_type', flex: 1 },
  { headerName: '발령일자', field: 'appointment_effective_date', flex: 1 },
  { headerName: '상태', field: 'appointment_status', flex: 1 },
  { headerName: '적용', field: 'is_applied', width: 80 },
  { headerName: '상세', field: 'detail', width: 80, cellRenderer: () => '<i class="fa fa-file detail-icon"></i>' }
]

// 필터링된 데이터
const filteredData = computed(() =>
  rowData.value.filter(item => {
    return (!selectedType.value || item.appointment_type === selectedType.value)
        && (!filterEmployee.value || item.employee_id.toString().includes(filterEmployee.value))
  })
)

// 그리드 API
function onGridReady(params) {
  gridApi = params.api
}
// 삭제
function onDelete() {
  const selected = gridApi.getSelectedRows()
  alert(`${selected.length}건 삭제 예정`)
}

// 데이터 로드
async function loadData() {
  try {
    const res   = await fetch('/org.json')
    const oData = await res.json()
    rowData.value = oData.appointment || []
  } catch (err) {
    console.error('데이터 로딩 실패', err)
  }
}

onMounted(loadData)
</script>

<style scoped>
.content-box {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 24px;
}
.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
}
.personnel-grid-container {
  padding: 20px;
  background: #fff;
}
.filter-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px 24px;
}
.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}
.actions {
  display: flex;
  gap: 8px;
  align-self: flex-end;
  margin-top: 8px;
}
.filters label {
  font-weight: 500;
  color: #513737;
}
.filters select,
.filters input {
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  color: #1F2937;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.action-btn.primary {
  background-color: #00a8e8;
  color: #fff;
  padding: 8px 30px;
  border: none;
}
.action-btn.primary:hover {
  background-color: #07749f;
}
.action-btn.secondary {
  background-color: #eeeeee;
  color: #374151;
  padding: 8px 30px;
  border: none;
}
.action-btn.secondary:hover {
  background-color: #cecece;
}
.detail-icon {
  font-size: 16px;
  color: #806b6b;
  cursor: pointer;
}
/* AG Grid 커스터마이징 */
.custom-theme {
  --ag-background-color: #ffffff;
  --ag-foreground-color: #1F2937;
  --ag-header-background-color: #F9FAFB;
  --ag-header-foreground-color: #374151;
  --ag-row-hover-color: #F3F4F6;
  --ag-row-border-color: #E5E7EB;
}
.custom-theme .ag-header-cell-label {
  justify-content: center;
}
.custom-theme .ag-row-hover .ag-cell {
  background-color: var(--ag-row-hover-color) !important;
}
.custom-theme .ag-body-viewport::-webkit-scrollbar {
  height: 6px;
}
.custom-theme .ag-body-viewport::-webkit-scrollbar-thumb {
  background-color: #CBD5E1;
  border-radius: 3px;
}
.custom-theme .ag-body-viewport::-webkit-scrollbar-track {
  background: transparent;
}
</style>
