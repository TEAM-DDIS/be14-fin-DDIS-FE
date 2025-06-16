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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
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

// 라우터, Pinia 스토어
const router    = useRouter()
const userStore = useUserStore()

// 그리드 API 참조
let gridApi = null
function onGridReady(params) {
  gridApi = params.api
}

// JWT 토큰 헤더
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// 컬럼 정의
const columnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: '번호',          field: 'disciplinaryId',         width: 80,  cellClass: 'center-align' },
  { headerName: '사원명',        field: 'employeeName',           flex: 1.5 },
  { headerName: '징계 서류',     field: 'disciplinaryFileName',   flex: 2 },
  { headerName: '징계 내용',     field: 'disciplinaryDescription',flex: 2 },
  { headerName: '징계일자',      field: 'disciplinaryDate',       flex: 1,   cellClass: 'center-align' }
])

// 데이터 저장소
const fullData        = ref([])   // 전체 원본
const rowData         = ref([])   // AG Grid 바인딩
const searchText      = ref('')   // 검색어
const pageSize        = ref(20)   // 페이지당 행 수
const showDeleteModal = ref(false)
const showImageModal  = ref(false)
const selectedImageUrl= ref('')

// 초기 목록 조회
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8000/disciplinary', {
      headers: authHeaders()
    })
    fullData.value = res.data
    rowData.value  = res.data
  } catch (e) {
    console.error('징계 목록 조회 실패:', e)
    alert('징계 목록을 불러오는 중 오류가 발생했습니다.')
  }
})

// 검색 필터링
const filteredData = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return rowData.value
  return fullData.value.filter(item =>
    item.employeeName.toLowerCase().includes(kw)
  )
})

// 삭제 모달 띄우기
function onDeleteClick() {
  const sel = gridApi?.getSelectedRows() || []
  if (!sel.length) return alert('삭제할 항목을 선택하세요.')
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
}
async function confirmDelete() {
  const sel = gridApi.getSelectedRows()
  const ids = sel.map(r => r.disciplinaryId)
  try {
    await Promise.all(ids.map(id =>
      axios.delete(`http://localhost:8000/disciplinary/${id}`, {
        headers: authHeaders()
      })
    ))
    fullData.value = fullData.value.filter(r => !ids.includes(r.disciplinaryId))
    rowData.value  = rowData.value.filter(r => !ids.includes(r.disciplinaryId))
    gridApi.deselectAll()
    showDeleteModal.value = false
    alert('선택 항목이 삭제되었습니다.')
  } catch (err) {
    console.error('삭제 실패:', err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 등록 화면 이동
function onRegister() {
  router.push('/employeeInfo/disciplinary/disciplinaryEnroll')
}

// 셀 클릭 이벤트
function onCellClick(e) {
  // 사원명 클릭 → 상세 페이지 이동
  if (e.colDef.field === 'employeeName') {
    router.push(`/employeeInfo/disciplinary/${e.data.disciplinaryId}`)
    return
  }
  // 징계 서류 클릭 → 이미지 모달 오픈
  if (e.colDef.field === 'disciplinaryFileName') {
    selectedImageUrl.value = e.data.disciplinaryFilePath
    showImageModal.value = true
  }
}

// 이미지 모달 닫기
function closeImageModal() {
  showImageModal.value = false
  selectedImageUrl.value = ''
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
