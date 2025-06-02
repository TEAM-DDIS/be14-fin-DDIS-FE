<template>
  <div class="notice-wrapper">
    <h1 class="page-title">공지사항</h1>

    <!-- 검색창 -->
    <div class="search-bar">
      <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
      <input
        type="text"
        v-model="searchText"
        placeholder="제목을 입력하세요."
        @input="onSearch"
      />
    </div>

    <!-- AG Grid -->
    <div class="card">
      <div class="ag-theme-alpine ag-grid-box">
        <AgGridVue
          class="ag-grid"
          style="width:100%; height:100%;"
          :columnDefs="columnDefs"
          :rowData="filteredData"
          rowSelection="multiple"
          :pagination="true"
          :paginationPageSize="pageSize"
          :paginationPageSizeSelector="[5,10,20,50]"
          :rowHeight="defaultRowHeight"
          :getRowHeight="getRowHeight"
          @grid-ready="onGridReady"
        />
      </div>
    </div>

    <!-- 페이징 + 버튼 -->
    <div class="pagination-control">
      <div>
        <label>행 개수 보기:</label>
        <select v-model.number="pageSize">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
      <div class="button-group">
        <button class="btn delete" @click="onDeleteClick">삭제</button>
        <button class="btn register">등록</button>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <p>정말로 선택된 항목을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="btn cancel" @click="cancelDelete">취소</button>
          <button class="btn confirm" @click="confirmDelete">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import {
  ModuleRegistry,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
} from 'ag-grid-community'

// AG Grid 모듈 등록
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// 그리드 API를 저장할 변수
let gridApi = null

// 기본 행 높이
const defaultRowHeight = 60

// 컬럼 정의 (첫 번째 열에 체크박스용 설정 추가)
const columnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,       // 각 행 체크박스 활성화
    headerCheckboxSelection: true, // 헤더 전체 선택 체크박스 활성화
    width: 50,
    pinned: 'left',                // 왼쪽 고정
    cellClass: 'checkbox-cell',    // 아래 CSS 클래스
    headerClass: 'checkbox-header-cell'
  },
  { headerName: '번호',     field: 'id',     width: 100, cellClass: 'center-align', headerClass: 'header-number' },
  { headerName: '제목',     field: 'title',  flex: 2,  autoHeight: true, cellStyle: { whiteSpace: 'normal' }, headerClass: 'header-title' },
  { headerName: '작성자',   field: 'writer', flex: 1,  cellClass: 'center-align', headerClass: 'header-writer' },
  { headerName: '작성일자', field: 'date',   flex: 1,  cellClass: 'center-align', headerClass: 'header-date' }
])

// 더미 데이터
const rowData = ref(
  Array.from({ length: 28 }, (_, i) => ({
    id: 28 - i,
    title:
      i % 2 === 0
        ? '[안내] 샘플 인사 기반 시스템 안내'
        : '[안내] 긴 제목 예시: 화면에 맞게 줄바꿈 및 autoHeight 적용 테스트',
    writer: '김기종',
    date: '2025-05-25'
  }))
)

const searchText = ref('')
const pageSize   = ref(10)
const showDeleteModal = ref(false)

const filteredData = computed(() => {
  if (!searchText.value) return rowData.value
  return rowData.value.filter(r =>
    r.title.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// Ag-Grid가 준비되면 호출되는 콜백
function onGridReady(params) {
  gridApi = params.api
}

// 삭제 버튼 클릭 시 모달 열기
function onDeleteClick() {
  // 선택된 항목이 없으면 모달을 띄우지 않음
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length === 0) {
    alert('삭제할 항목을 선택하세요.')
    return
  }
  showDeleteModal.value = true
}

// 모달 취소
function cancelDelete() {
  showDeleteModal.value = false
}

// 모달 확인 시 실제 삭제 수행
function confirmDelete() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length > 0) {
    // rowData에서 선택된 항목 제외
    const remaining = rowData.value.filter(
      (row) => !selectedRows.includes(row)
    )
    rowData.value = remaining
    // 그리드에서 선택 제거
    gridApi.deselectAll()
  }
  showDeleteModal.value = false
}

// 동적 행 높이 결정
function getRowHeight(params) {
  return params.data && params.data.title.length > 20 ? 80 : defaultRowHeight
}
</script>

<style scoped>
.notice-wrapper {
  padding: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0 0 20px 20px;
  color: #00a8e8;
}

/* 검색창 컨테이너 */
.search-bar {
  position: relative;
  width: 50%;
  max-width: 250px;
  height: 60px;
  display: flex;
  align-items: center;
  margin-left: 20px;
}
.search-bar .search-icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  pointer-events: none;
}
.search-bar input {
  width: 100%;
  padding: 8px 12px 8px 36px; /* 왼쪽에 아이콘 공간(36px) 확보 */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}
.search-bar input:focus {
  outline: none;
  border-color: #888;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin: 0 20px 20px;
}

.ag-grid-box {
  height: 500px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

/* AG Grid 테마 변수 */
:deep(.ag-theme-alpine) {
  --ag-background-color: #fff;
  --ag-header-background-color: #e0f7fa;
  --ag-header-foreground-color: #006064;
  --ag-border-color: transparent;
  --ag-row-hover-color: #f1f8e9;
}

/* ———————————————————————————————————————————— */
/* 1) 헤더 셀과 바디 셀 좌우 패딩 맞추기                       */
/* ———————————————————————————————————————————— */
:deep(.ag-theme-alpine .ag-header-cell) {
  padding: 0 12px !important;
  box-sizing: border-box;
  border-bottom: 1px solid #b2ebf2; /* 기존 border-bottom 유지 */
}

/* 짝수/홀수 행 색상 */
:deep(.ag-theme-alpine .ag-row:nth-child(odd) .ag-cell) {
  background-color: #fafafa;
}
:deep(.ag-theme-alpine .ag-row:nth-child(even) .ag-cell) {
  background-color: #fff;
}

/* 2) 바디 셀 기본 패딩 및 세로 정렬 */
:deep(.ag-theme-alpine .ag-cell) {
  border-bottom: 1px solid #e0e0e0;
  border-left: none;
  border-right: none;
  padding: 0 12px;
  line-height: 60px; /* 기본 rowHeight(60px) 기준 세로 중앙 */
}

.center-align {
  text-align: center;
}

:deep(.ag-theme-alpine .ag-paging-panel) {
  justify-content: center;
  padding: 8px 0;
}

/* ———————————————————————————————————————————— */
/* 3) 체크박스 전용 바디 셀 (flex 중앙 정렬, padding 제거)         */
/* ———————————————————————————————————————————— */
.checkbox-cell {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
}
:deep(.checkbox-cell .ag-checkbox-input) {
  position: relative !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
}

/* ———————————————————————————————————————————— */
/* 4) 체크박스 전용 헤더 셀 (flex 중앙 정렬, margin-left로 좌측 맞춤) */
/* ———————————————————————————————————————————— */
.checkbox-header-cell {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  padding: 0 !important;
  margin-left: 12px; /* 일반 헤더 텍스트와 시작 지점 맞춤 */
}
:deep(.checkbox-header-cell .ag-checkbox-input) {
  position: relative !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  margin: 0 !important;
}

/* ———————————————————————————————————————————— */
/* 5) 검색창, 페이징 + 버튼 등 하단 영역                       */
/* ———————————————————————————————————————————— */
.pagination-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 20px 20px;
}
.button-group {
  display: flex;
  gap: 10px;
}
.btn {
  background: #00a8e8;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

/* ———————————————————————————————————————————— */
/* 6) 삭제 확인 모달 스타일                                      */
/* ———————————————————————————————————————————— */
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
.modal-buttons .btn {
  width: 48%;
}
.modal-buttons .cancel {
  background: #ccc;
  color: #333;
}
.modal-buttons .confirm {
  background: #e74c3c;
}
</style>
