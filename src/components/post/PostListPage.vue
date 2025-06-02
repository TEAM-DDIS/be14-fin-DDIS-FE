<template>
  <div class="notice-wrapper">
    <h1 class="page-title">공지사항</h1>

    <!-- 1) 검색창 -->
    <div class="search-bar">
      <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
      <input
        type="text"
        v-model="searchText"
        placeholder="제목을 입력하세요."
        @input="onSearch"
      />
    </div>

    <!-- 2) AG Grid 영역 -->
    <div class="card">
      <div class="ag-theme-alpine ag-grid-box">
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          style="width: 100%; height: 500px;"
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

    <!-- 3) 페이징 + 버튼 -->
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
        <!-- 삭제 버튼에 .btn-delete 클래스 적용 -->
        <button class="btn-delete" @click="onDeleteClick">삭제</button>
        <!-- 등록 버튼에 .btn-save 클래스 적용 -->
        <button class="btn-save">등록</button>
      </div>
    </div>

    <!-- 4) 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <p>정말로 선택된 항목을 삭제하시겠습니까?</p>
        <div class="modal-buttons">
          <button class="btn-delete cancel" @click="cancelDelete">
            취소
          </button>
          <button class="btn-save confirm" @click="confirmDelete">
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/*--------------------------------------------------
  1) AG Grid CSS import (가장 먼저)
--------------------------------------------------*/


import { ref, computed } from 'vue'
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

/*--------------------------------------------------
  2) AG Grid 모듈 등록
--------------------------------------------------*/
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

/*--------------------------------------------------
  3) 데이터 및 상태 선언
--------------------------------------------------*/
let gridApi = null
const defaultRowHeight = 60

// 컬럼 정의 (체크박스, 번호, 제목, 작성자, 작성일자)
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
    width: 100,
    cellClass: 'center-align',
    headerClass: 'header-number'
  },
  {
    headerName: '제목',
    field: 'title',
    flex: 2,
    autoHeight: true,
    cellStyle: { whiteSpace: 'normal' },
    headerClass: 'header-title'
  },
  {
    headerName: '작성자',
    field: 'writer',
    flex: 1,
    cellClass: 'center-align',
    headerClass: 'header-writer'
  },
  {
    headerName: '작성일자',
    field: 'date',
    flex: 1,
    cellClass: 'center-align',
    headerClass: 'header-date'
  }
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
const pageSize = ref(10)
const showDeleteModal = ref(false)

// 필터링된 데이터
const filteredData = computed(() => {
  if (!searchText.value) return rowData.value
  return rowData.value.filter((r) =>
    r.title.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

/*--------------------------------------------------
  4) 그리드 이벤트 핸들러
--------------------------------------------------*/
function onGridReady(params) {
  gridApi = params.api
}

function onDeleteClick() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length === 0) {
    alert('삭제할 항목을 선택하세요.')
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
    const remaining = rowData.value.filter(
      (row) => !selectedRows.includes(row)
    )
    rowData.value = remaining
    gridApi.deselectAll()
  }
  showDeleteModal.value = false
}

// 제목 길이에 따라 rowHeight 조정
function getRowHeight(params) {
  return params.data && params.data.title.length > 20
    ? 80
    : defaultRowHeight
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

/* 검색창 */
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
  padding: 8px 12px 8px 36px; /* 아이콘 공간 확보 */
  border: 1px solid #ccc;
  border-radius: 8px;
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

/* 그리드 컨테이너 (높이 고정) */
.ag-grid-box {
  height: 500px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

/* AG Grid 알파인 테마 변수 */

.button-group {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-right: 20px;
}

/* . btn-save, btn-delete 스타일 추가 */
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
  background-color: #D3D3D3;
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

/* 삭제 확인 모달 스타일 */
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

/* 필요하다면 .register/.delete .cancel/.confirm 등 기존 클래스 제거 가능 */
</style>
