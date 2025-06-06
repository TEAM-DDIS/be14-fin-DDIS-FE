<!-- EmployeeList.vue -->
<template>
  <h1 class="page-title">징계 관리</h1>
  <p class="desc">징계 목록</p>

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
      <button class="btn-save" @click="onRegister">등록</button>
    </div>
  </div>

  <!-- 4) 삭제 확인 모달 -->
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말로 선택된 항목을 삭제하시겠습니까?</p>
      <div class="modal-buttons">
        <button class="btn-delete cancel" @click="cancelDelete">취소</button>
        <button class="btn-save confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div>

  <!-- 5) 징계서류 이미지 미리보기 모달 (▼ 추가된 부분) -->
  <div v-if="showImageModal" class="modal-overlay">
    <div class="modal-content image-modal">
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="closeImageModal">✕</button>
      <!-- 실제 이미지 -->
      <img :src="selectedImageUrl" alt="징계서류 이미지" class="preview-image" />
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
    width: 150,
    // cellRenderer로 <span>을 감싸서 렌더링
    cellRenderer: (params) => {
      return `<span class="clickable-name">${params.value}</span>`
    },
    headerClass: 'header-name'
  },
  {
    headerName: '사원번호',
    field: 'employeeNumber',
    flex: 1.5,
    cellClass: 'center-align',
    headerClass: 'header-employeeNumber'
  },
  {
    headerName: '징계 서류',
    field: 'disciplinary',
    flex: 1.7,
    // ▼ 텍스트만 렌더링하고 클릭 시 onCellClick에서 처리
    cellRenderer: (params) => {
      return `<span class="clickable-contract">${params.value}</span>`
    },
    cellClass: 'center-align',
    headerClass: 'disciplinarydescrip'
  },
  {
    headerName: '징계 내용',
    field: 'disciplinarydescrip',
    flex: 1.5,
    cellClass: 'center-align',
    headerClass: 'header-disciplinarydescrip'
  },
  {
    headerName: '징계일자',
    field: 'disciplinarydate',
    flex: 1,
    cellClass: 'center-align',
    headerClass: 'header-disciplinarydate'
  }
])

// 2) 예시 더미 데이터
const rowData = ref([
  {
    id: 1,
    name: '김철수',
    employeeNumber: 'EMP001',
    disciplinary: '경고장',
    disciplinarydescrip: '근태 불량',
    disciplinarydate: '2025-06-01'
  },
  {
    id: 2,
    name: '이영희',
    employeeNumber: 'EMP002',
    disciplinary: '근신명령서',
    disciplinarydescrip: '무단 결근',
    disciplinarydate: '2025-05-20'
  },
  {
    id: 3,
    name: '박민수',
    employeeNumber: 'EMP003',
    disciplinary: '정직처분서',
    disciplinarydescrip: '업무 태만',
    disciplinarydate: '2025-04-15'
  },
  {
    id: 4,
    name: '최수진',
    employeeNumber: 'EMP004',
    disciplinary: '감봉 통지서',
    disciplinarydescrip: '보고 누락',
    disciplinarydate: '2025-03-30'
  },
  {
    id: 5,
    name: '정다은',
    employeeNumber: 'EMP005',
    disciplinary: '경고장',
    disciplinarydescrip: '지각 지속',
    disciplinarydate: '2025-02-10'
  },
  {
    id: 6,
    name: '오준호',
    employeeNumber: 'EMP006',
    disciplinary: '근신명령서',
    disciplinarydescrip: '업무 지연',
    disciplinarydate: '2025-01-25'
  },
  {
    id: 7,
    name: '한지혜',
    employeeNumber: 'EMP007',
    disciplinary: '정직처분서',
    disciplinarydescrip: '보안 위반',
    disciplinarydate: '2024-12-05'
  },
  {
    id: 8,
    name: '유민호',
    employeeNumber: 'EMP008',
    disciplinary: '감봉 통지서',
    disciplinarydescrip: '비용 부당 청구',
    disciplinarydate: '2024-11-18'
  },
  {
    id: 9,
    name: '강예린',
    employeeNumber: 'EMP009',
    disciplinary: '경고장',
    disciplinarydescrip: '불성실 근무',
    disciplinarydate: '2024-10-02'
  },
  {
    id: 10,
    name: '서동혁',
    employeeNumber: 'EMP010',
    disciplinary: '근신명령서',
    disciplinarydescrip: '회의 불참',
    disciplinarydate: '2024-09-14'
  }
])


const searchText = ref('')
const pageSize = ref(20)
const showDeleteModal = ref(false)

// ▼ 이미지 미리보기 모달 상태 변수 (추가)
const showImageModal = ref(false)
const selectedImageUrl = ref('')

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

// 5) 셀 클릭 이벤트
function onCellClick(e) {
  // 사원명 클릭 → 상세 페이지
  if (e.colDef.field === 'name') {
    router.push(`/employeeInfo/employeeEnroll`)
    return
  }
  // 징계서류 클릭 → 이미지 모달 띄우기
  if (e.colDef.field === 'disciplinary') {
    selectedImageUrl.value = e.data.documentUrl
    showImageModal.value = true
  }
}

// ▼ 이미지 모달 닫기 함수 (추가)
function closeImageModal() {
  showImageModal.value = false
  selectedImageUrl.value = ''
}

// 6) 삭제 로직
function onDeleteClick() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length === 0) {
    alert('삭제할 문서를 선택하세요.')
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

// 7) 등록 버튼 클릭 → “징계 등록” 화면으로 이동
function onRegister() {
  router.push('/employeeInfo/disciplinary/disciplinaryEnroll')
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
/* ★ 클릭 가능한 계약서 텍스트 스타일 (추가) */
.clickable-contract {
  cursor: pointer;
  color: #2563EB;
  transition: color 0.2s;
}
.clickable-contract:hover {
  color: #1D4ED8;
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

/* ▼ 이미지 미리보기 모달 전용 스타일 추가 */
.image-modal {
  width: auto;
  max-width: 90%;
  max-height: 90%;
  padding: 0;
}
.image-modal .close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
}
.image-modal .preview-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}
</style>
