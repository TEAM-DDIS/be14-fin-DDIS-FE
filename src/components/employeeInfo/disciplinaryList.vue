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

        <!-- 3) 하단 버튼 -->
    <div class="pagination-control">
      <div class="button-group">
        <button class="btn-delete" @click="onDeleteClick">삭제</button>
        <button class="btn-save" @click="onRegister">등록</button>
      </div>
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

// — Axios 기본 URL 설정
axios.defaults.baseURL = 'http://localhost:8000'

// — AG Grid 필요한 모듈 등록 (한 번만)
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// — Pinia 스토어와 라우터
const router    = useRouter()
const userStore = useUserStore()

// JWT 토큰 디코딩 유틸
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return {}
  }
}

// HR 권한 여부 계산 (role 클레임명은 실제 JWT 에 맞춰 조정)
const isHR = computed(() => {
  const raw = userStore.accessToken?.startsWith('Bearer ')
    ? userStore.accessToken.slice(7)
    : userStore.accessToken
  if (!raw) return false

  const { auth } = parseJwtPayload(raw)
  if (Array.isArray(auth))    return auth.includes('ROLE_HR')
  if (typeof auth === 'string') return auth.includes('ROLE_HR')
  return false
})

// — 그리드 API 레퍼런스
let gridApi = null
function onGridReady(params) {
  gridApi = params.api
}

// — JWT 토큰 헤더 반환
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// — 컬럼 정의
const columnDefs = ref([
  {
    headerName: '',
    field: 'checkbox',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left'
  },
  { headerName: '번호',            field: 'disciplinaryId',          width: 80, cellClass: 'center-align' },
  { headerName: '사원명',          field: 'employeeName',            flex: 1.2 },
  {
    headerName: '징계 서류',
    field: 'fileList',
    flex: 2,
    cellRenderer: params => {
      const files = Array.isArray(params.value) 
        ? params.value.filter(f => f && f.fileName) 
        : []
      if (!files.length) return '-'
      return `<div class="file-list-cell">${
        files.map((f,i) =>
          `<a href="#" data-idx="${i}">${f.fileName}</a>`
        ).join('')
      }</div>`
    }
  },
  { headerName: '징계 내용',      field: 'disciplinaryDescription', flex: 2 },
  {
    headerName: '징계일자',
    field: 'disciplinaryDate',
    flex: 1,
    cellClass: 'center-align',
    valueFormatter: ({ value }) => {
      const d = new Date(value)
      return d.toISOString().slice(0,10)
    }
  }
])

// — 상태 변수
const fullData        = ref([])
const rowData         = ref([])
const searchText      = ref('')
const pageSize        = ref(20)
const showDeleteModal = ref(false)

// — 데이터 로드 (인사팀 전용 API)
onMounted(async () => {
    if (!isHR.value) {
    return router.push('/error403')
  }
  try {
    const res = await axios.get('/disciplinary', {
      headers: authHeaders()
    })
    fullData.value = res.data
    rowData.value  = res.data
  } catch (e) {
    console.error('징계 목록 조회 실패:', e)
    alert('징계 목록을 불러오는 중 오류가 발생했습니다.')
  }
})

// — 검색 필터링
const filteredData = computed(() => {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) return rowData.value
  return fullData.value.filter(item =>
    item.employeeName.toLowerCase().includes(kw)
  )
})

// — 삭제 버튼 클릭 → 모달 열기
function onDeleteClick() {
  const sel = gridApi?.getSelectedRows() || []
  if (!sel.length) {
    alert('삭제할 항목을 선택하세요.')
    return
  }
  showDeleteModal.value = true
}

// — 모달 닫기
function cancelDelete() {
  showDeleteModal.value = false
}

// — 확인 클릭 → 실제 삭제
async function confirmDelete() {
  const selected = gridApi.getSelectedRows()
  if (!selected.length) {
    showDeleteModal.value = false
    return
  }
  try {
    // 1) 백엔드 삭제 API 호출
    await Promise.all(
      selected.map(row =>
        axios.delete(`/disciplinary/${row.disciplinaryId}`, {
          headers: authHeaders()
        })
      )
    )
    // 2) 로컬 데이터 제거
    const deleteIds = selected.map(r => r.disciplinaryId)
    fullData.value = fullData.value.filter(r => !deleteIds.includes(r.disciplinaryId))
    rowData.value  = rowData.value.filter(r => !deleteIds.includes(r.disciplinaryId))
    gridApi.deselectAll()
    alert('선택 항목이 삭제되었습니다.')
  } catch (err) {
    console.error('삭제 실패:', err)
    alert('삭제 중 오류가 발생했습니다.')
  } finally {
    showDeleteModal.value = false
  }
}

// — 등록 화면 이동
function onRegister() {
  router.push('/employeeInfo/disciplinary/disciplinaryEnroll')
}

// — 셀 클릭: 파일 다운로드 / 사원명 클릭 이동
async function onCellClick(e) {
  // (1) 징계 서류 링크 클릭
  if (
    e.colDef.field === 'fileList' &&
    e.event.target.matches('a') &&
    e.event.target.dataset.idx != null
  ) {
    e.event.preventDefault()
    const idx  = Number(e.event.target.dataset.idx)
    const file = (e.data.fileList || [])[idx]
    if (!file) return

    try {
      // presigned URL 요청
      const { data: presignedUrl } = await axios.get(
        '/s3/download-url',
        {
          params: { filename: file.fileUrl, contentType: '' },
          headers: authHeaders()
        }
      )
      // Blob으로 받아 강제 다운로드
      const res  = await fetch(presignedUrl)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = file.fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('파일 다운로드 실패:', err)
      alert('파일 다운로드에 실패했습니다.')
    }
    return
  }

  // (2) 사원명 클릭 → 상세 페이지 이동
  if (e.colDef.field === 'employeeName') {
    const empId = e.data.employeeId
    if (!empId) {
      console.warn('employeeId가 없습니다:', e.data)
      return
    }
    router.push(`/employeeInfo/${empId}`)
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
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
}
/* 하단 버튼 */
.pagination-control {
  display: flex;
  justify-content: flex-end;
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

:deep(.file-list-cell) {
  display: flex;
  flex-wrap: nowrap;
  /* 링크들 사이 간격을 8px로 설정 */
  gap: 8px;
  max-height: 36px;
  padding-right: 8px;
}
/* a 태그는 줄바꿈 없이 */
.file-list-cell a {
  white-space: nowrap;
  text-decoration: underline;
  cursor: pointer;
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
