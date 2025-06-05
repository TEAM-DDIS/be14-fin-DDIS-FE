<!-- EmployeeList.vue -->
<template>
  <h1 class="page-title">사원조회</h1>
  <p class="desc">사원 목록 조회</p>

  <div class="card">
    <!-- 1) 검색창 -->
    <div class="search-bar-in-card">
      <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
      <input
        type="text"
        v-model="searchText"
        placeholder="사원명을 입력하세요."
        class="search-input"
      />
    </div>

    <!-- 2) AG Grid -->
    <div class="ag-theme-alpine ag-grid-box">
      <AgGridVue
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :style="`width: 100%; height: 500px;`"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        :defaultColDef="defaultColDef"
        rowSelection="multiple"
        :pagination="true"
        :paginationPageSize="pageSize"
        :paginationPageSizeSelector="[5,10,20,50]"
        @grid-ready="onGridReady"
        @cell-clicked="onCellClick"
      />
    </div>
  </div>

  <!-- 3) 하단 버튼 -->
  <div class="pagination-control">
    <div class="button-group">
      <button class="btn-delete" @click="onDeleteClick">삭제</button>
      <button class="btn-save"   @click="onRegister">등록</button>
    </div>
  </div>

  <!-- 4) 삭제 확인 모달 -->
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말로 선택된 사원을 삭제하시겠습니까?</p>
      <div class="modal-buttons">
        <button class="btn-delete cancel" @click="cancelDelete">취소</button>
        <button class="btn-save confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { AgGridVue } from 'ag-grid-vue3'
import {
  ModuleRegistry,
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
} from 'ag-grid-community'

// AG Grid 모듈 등록 (한 번만)
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

const router = useRouter()
let gridApi = null

// 1) 컬럼 정의
const columnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left',
    cellClass: 'checkbox-cell',
    headerClass: 'checkbox-header-cell'
  },
  {
    headerName: '번호',
    field: 'id',
    width: 80,
    cellClass: 'center-align',
    headerClass: 'header-number'
  },
  {
    headerName: '사원명',
    field: 'name',
    flex: 1,
    // cellRenderer로 <span>을 감싸서 렌더링
    cellRenderer: (params) => {
      return `<span class="clickable-name">${params.value}</span>`
    },
    headerClass: 'header-name'
  },
  {
    headerName: '사원번호',
    field: 'employeeNumber',
    width: 120,
    cellClass: 'center-align',
    headerClass: 'header-employeeNumber'
  },
  {
    headerName: '본부',
    field: 'division',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['경영지원본부', '개발본부', '영업본부', '서비스본부']
    },
    cellClass: 'center-align',
    headerClass: 'header-division'
  },
  {
    headerName: '부서',
    field: 'department',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['인사팀', '회계팀', '개발팀', '영업팀', '고객지원팀']
    },
    cellClass: 'center-align',
    headerClass: 'header-department'
  },
  {
    headerName: '팀',
    field: 'team',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['웹개발팀', '앱개발팀', '인프라팀', '영업1팀', '영업2팀']
    },
    cellClass: 'center-align',
    headerClass: 'header-team'
  },
  {
    headerName: '직무',
    field: 'position',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['개발자', '디자이너', '기획자', '영업사원', '고객지원']
    },
    cellClass: 'center-align',
    headerClass: 'header-position'
  },
  {
    headerName: '직책',
    field: 'role',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['팀장', '과장', '대리', '사원']
    },
    cellClass: 'center-align',
    headerClass: 'header-role'
  },
  {
    headerName: '직급',
    field: 'grade',
    flex: 1,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ['사원', '대리', '과장', '차장', '부장']
    },
    cellClass: 'center-align',
    headerClass: 'header-grade'
  }
])

// 2) 예시 더미 데이터
const rowData = ref([
  { id: 1,  name: '홍길동', employeeNumber: 'EMP001', division: '개발본부', department: '개발팀', team: '웹개발팀', position: '개발자', role: '사원', grade: '사원' },
  { id: 2,  name: '김철수', employeeNumber: 'EMP002', division: '영업본부', department: '영업팀', team: '영업1팀', position: '영업사원', role: '대리', grade: '대리' },
  { id: 3,  name: '이영희', employeeNumber: 'EMP003', division: '경영지원본부', department: '회계팀', team: '회계팀', position: '회계사', role: '과장', grade: '과장' },
  { id: 4,  name: '박민준', employeeNumber: 'EMP004', division: '서비스본부', department: '고객지원팀', team: '고객지원팀', position: '고객지원', role: '차장', grade: '차장' },
  { id: 5,  name: '최수진', employeeNumber: 'EMP005', division: '개발본부', department: '디자인팀', team: '웹개발팀', position: '디자이너', role: '사원', grade: '사원' },
  { id: 6,  name: '강민호', employeeNumber: 'EMP006', division: '개발본부', department: '개발팀', team: '앱개발팀', position: '개발자', role: '사원', grade: '사원' },
  { id: 7,  name: '윤지혜', employeeNumber: 'EMP007', division: '경영지원본부', department: '인사팀', team: '인사팀', position: '인사담당', role: '사원', grade: '사원' },
  { id: 8,  name: '이준호', employeeNumber: 'EMP008', division: '영업본부', department: '영업팀', team: '영업2팀', position: '영업사원', role: '사원', grade: '사원' },
  { id: 9,  name: '정예진', employeeNumber: 'EMP009', division: '서비스본부', department: '고객지원팀', team: '고객지원팀', position: '고객지원', role: '사원', grade: '사원' },
  { id: 10, name: '한승우', employeeNumber: 'EMP010', division: '영업본부', department: '영업팀', team: '영업1팀', position: '영업사원', role: '대리', grade: '대리' },
  { id: 11, name: '송다은', employeeNumber: 'EMP011', division: '개발본부', department: '개발팀', team: '인프라팀', position: '서버엔지니어', role: '과장', grade: '과장' },
  { id: 12, name: '박하늘', employeeNumber: 'EMP012', division: '경영지원본부', department: '회계팀', team: '회계팀', position: '회계사', role: '사원', grade: '사원' },
  { id: 13, name: '최민성', employeeNumber: 'EMP013', division: '서비스본부', department: '고객지원팀', team: '고객지원팀', position: '고객지원', role: '대리', grade: '대리' },
  { id: 14, name: '오승아', employeeNumber: 'EMP014', division: '개발본부', department: '디자인팀', team: '웹개발팀', position: '디자이너', role: '사원', grade: '사원' },
  { id: 15, name: '허준혁', employeeNumber: 'EMP015', division: '영업본부', department: '영업팀', team: '영업2팀', position: '영업사원', role: '과장', grade: '과장' },
  { id: 16, name: '이태훈', employeeNumber: 'EMP016', division: '개발본부', department: '개발팀', team: '앱개발팀', position: '개발자', role: '대리', grade: '대리' },
  { id: 17, name: '김소연', employeeNumber: 'EMP017', division: '경영지원본부', department: '인사팀', team: '인사팀', position: '인사담당', role: '과장', grade: '과장' },
  { id: 18, name: '박준서', employeeNumber: 'EMP018', division: '서비스본부', department: '고객지원팀', team: '고객지원팀', position: '고객지원', role: '사원', grade: '사원' },
  { id: 19, name: '장하늘', employeeNumber: 'EMP019', division: '개발본부', department: '개발팀', team: '인프라팀', position: '서버엔지니어', role: '사원', grade: '사원' },
  { id: 20, name: '이수빈',employeeNumber: 'EMP020', division: '영업본부', department: '영업팀', team: '영업1팀', position: '영업사원', role: '사원', grade: '사원' }
])

const searchText = ref('')
const pageSize = ref(20)
const showDeleteModal = ref(false)

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true
}

// 3) 검색 필터링 로직
const filteredData = computed(() => {
  if (!searchText.value) return rowData.value
  const lower = searchText.value.toLowerCase()
  return rowData.value.filter(r =>
    r.name.toLowerCase().includes(lower)
  )
})

// 4) 그리드 준비
function onGridReady(params) {
  gridApi = params.api
}

// 5) 사원명 클릭 시 상세 페이지 이동
function onCellClick(e) {
  if (e.colDef.field === 'name') {
    router.push(`/employeeInfo/employeeEnroll`)
  }
}

// 6) 삭제 로직
function onDeleteClick() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length === 0) {
    alert('삭제할 사원을 선택하세요.')
    return
  }
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
}
function confirmDelete() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length > 0) {
    rowData.value = rowData.value.filter(r =>
      !selectedRows.includes(r)
    )
    gridApi.deselectAll()
  }
  showDeleteModal.value = false
  alert('삭제가 완료되었습니다.')
}

// 7) 등록 버튼 클릭 → “사원 등록” 화면으로 이동
function onRegister() {
  router.push('/employeeInfo/employeeEnroll')
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
/* 카드 영역 */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
}
/* 검색창 */
.search-bar-in-card {
  display: flex;
  width: 350px;
  height: 30px;
  align-items: center;
  margin-bottom: 10px;
  padding: 6px 8px;
  font-size: 14px;
  color: #1F2937;
}
.search-bar-in-card .search-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  pointer-events: none;
}
.search-bar-in-card .search-input {
  width: 100%;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  color: #1F2937;
}
.search-bar-in-card .search-input:focus {
  outline: none;
  border-color: #1F2937;
}
/* 그리드 컨테이너 */
.ag-grid-box {
  height: 500px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}
/* 하단 버튼 */
.pagination-control {
  display: flex;
  justify-content: flex-end;
  margin: 0 20px 20px;
}
.button-group {
  display: flex;
  gap: 10px;
}
.btn-save {
  background-color: #00a8e8;
  color: white;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-save:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn-delete {
  background-color: #d3d3d3;
  color: #000;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.btn-delete:hover {
  background-color: #000;
  color: #fff;
}
/* 삭제 확인 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px 24px;
  width: 320px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.modal-content p {
  margin-bottom: 20px;
  font-size: 16px;
}
.modal-buttons {
  display: flex;
  justify-content: space-between;
}
.modal-buttons .btn-delete {
  width: 48%;
}
.modal-buttons .btn-save {
  width: 48%;
}
/* 셀 중앙 정렬 */
.center-align {
  display: flex;
  justify-content: center;
  align-items: center;
}
/* ★ 클릭 가능한 사원명 스타일 */
.clickable-name {
  cursor: pointer;
  color: #1F2937; /* 기본 텍스트 색 */
  transition: color 0.2s;
}
.clickable-name:hover {
  color: #00a8e8;
  text-decoration: underline;
}
/* AG Grid 커스텀 테마 */
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
