<!-- 조직 및 직무 > 인사발령 -->
<template>
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
        <input type="text" placeholder="사원번호" v-model="filterEmployee" />
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

    <!-- Registration Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeRegisterModal">
      <div class="modal">
        <h3>발령 등록</h3>
        <div class="modal-content">
          <label>사원번호</label>
          <input v-model="newAppointment.employee_id" type="number" />
          <label>발령유형</label>
          <select v-model="newAppointment.appointment_type">
            <option value="승진">승진</option>
            <option value="전보">전보</option>
            <option value="전직">전직</option>
            <option value="직급조정">직급조정</option>
            <option value="직무">직무</option>
          </select>
          <label>발령일자</label>
          <input v-model="newAppointment.appointment_effective_date" type="date" />
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="saveRegister">저장</button>
          <button class="btn-cancel" @click="closeRegisterModal">취소</button>
        </div>
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
</template>

<script setup>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
const router = useRouter()

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule])

// 상태 관리
const selectedType = ref('')
const filterEmployee = ref('')
const rowData = ref([])
const showRegisterModal = ref(false)
const newAppointment = ref({
  employee_id: null,
  appointment_type: '승진',
  appointment_effective_date: ''
})
let gridApi = null

// 등록 페이지로 이동
const goToRegister = () => {
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
    const matchType = !selectedType.value || item.appointment_type === selectedType.value
    const matchEmp = !filterEmployee.value || item.employee_id.toString().includes(filterEmployee.value)
    return matchType && matchEmp
  })
)

// 이벤트 핸들러
const onGridReady = params => { gridApi = params.api; }
const onSearch = () => {}
const onDelete = () => {
  const selected = gridApi.getSelectedRows()
  alert(`${selected.length}건 삭제 예정`)
}
// const openRegisterModal = () => { showRegisterModal.value = true }
const closeRegisterModal = () => { showRegisterModal.value = false }
const saveRegister = async () => {
  try {
    await axios.post('http://localhost:3000/appointment', newAppointment.value)
    closeRegisterModal()
    loadData()
  } catch (err) {
    console.error('등록 실패', err)
  }
}

// 데이터 로드
async function loadData() {
  try {
    const res = await axios.get('http://localhost:3000/appointment')
    rowData.value = res.data
  } catch (err) {
    console.error('데이터 로딩 실패', err)
  }
}

onMounted(loadData)
</script>

<style scoped>
.personnel-grid-container {
  padding: 20px;
  background: #FFFFFF;
}
.filter-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.filters {
  display: flex;
  align-items: center;
  gap: 12px;
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
.actions {
  display: flex;
  gap: 8px;
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
  color: #FFFFFF;
  padding: 8px 30px;
  border: none;
}
.action-btn.primary:hover {
  background-color: #07749f;
}
.action-btn.secondary {
  background-color: #F3F4F6;
  color: #374151;
  padding: 8px 30px;
  border: none;
}
.action-btn.secondary:hover {
  background-color: #E5E7EB;
}
.detail-icon {
  font-size: 16px;
  color: #806b6b;
  cursor: pointer;
}
/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 380px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
.modal h3 {
  margin-top: 0;
  font-size: 18px;
  color: #333;
}
.modal-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}
.modal-content label {
  font-size: 14px;
  color: #555;
}
.modal-content input,
.modal-content select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.modal-actions .btn-save {
  background-color: #00a8e8;
  color: #fff;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-actions .btn-cancel {
  background-color: #ccc;
  color: #333;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
/* AG Grid 커스터마이징 */
.custom-theme {
  --ag-background-color: #FFFFFF;
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