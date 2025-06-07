<template>
    <h1 class="page-title">공지사항</h1>
    <p class="desc">공지사항 목록</p>

    <!-- 2) AG Grid 영역 -->
    <div class="card">
      <div class="search-bar-in-card">
        <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
        <input
          type="text"
          v-model="searchText"
          placeholder="제목을 입력하세요."
          @input="onSearch"
          class="search-input"
        />
      </div>

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
          @cell-clicked="onCellClick"
        />
      </div>
    </div>

    <!-- 3) 페이징 + 버튼 -->
    <div class="pagination-control">
      <div class="button-group">
        <!-- 삭제 버튼 -->
        <button class="btn-delete" @click="onDeleteClick">삭제</button>
        <!-- 등록 버튼: 클릭 시 onRegister 호출 -->
        <button class="btn-save" @click="onRegister">등록</button>
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

// AG Grid 모듈 등록
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

const router = useRouter()  // ← 라우터 인스턴스 가져오기

let gridApi = null
const defaultRowHeight = 60

// 컬럼 정의
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

// 그리드 준비 시
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

// rowHeight 동적 결정
function getRowHeight(params) {
  return params.data && params.data.title.length > 20
    ? 80
    : defaultRowHeight
}


// “등록” 버튼 클릭 시 호출되는 함수
function onRegister() {
  router.push('/post/postEnroll')
}

// AG Grid 셀 클릭 시 상세 페이지로 이동
function onCellClick(e) {
  // ‘title’ 컬럼을 클릭했을 때만 상세 페이지로 이동
  if (e.colDef.field === 'title') {
    const id = e.data.id
    router.push(`/post/postDetail/${id}`)
  }
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

/* 카드 스타일 */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  height: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 20px 0 0 10px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
  margin-bottom: 30px;
}

/* 카드 내부 검색창 */
.search-bar-in-card {
  display: flex;
  width: 300px;
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

/* 그리드 컨테이너 (높이 고정) */
.ag-grid-box {
  height: 500px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

/* 페이징 + 버튼 영역 */
.pagination-control {
  display: flex;
  justify-content: flex-end;
  margin: 0 20px 20px;
}
.button-group {
  display: flex;
  gap: 10px;
}

/* btn-save, btn-delete 스타일 */
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
</style>
