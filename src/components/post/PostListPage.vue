<template>
  <h1 class="page-title">공지사항</h1>
  <p class="desc">공지사항 목록</p>

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

    <div class="ag-theme-alpine ag-grid-box custom-theme">
      <BaseGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        style="width: 100%; height: 500px;"
        :columnDefs="columnDefs"
        :rowData="rowData"
        rowSelection="multiple"
        :pagination="true"
        :paginationPageSize="pageSize"
        :paginationPageSizeSelector="[5,10,20,50]"
        @ready="onGridReady"
        @cell-click="onCellClick"
      />
    </div>

    <div class="pagination-control">
      <div class="button-group">
      <button v-if="isHR" class="btn-delete" @click="onDeleteClick">삭제</button>
      <button v-if="isHR" class="btn-save"   @click="onRegister">등록</button>
      </div>
    </div>
  </div>


  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말로 선택된 항목을 삭제하시겠습니까?</p>
      <div class="modal-buttons">
        <button class="btn-delete cancel" @click="cancelDelete">취소</button>
        <button class="btn-save confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div>
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import BaseToast from '@/components/toast/BaseToast.vue'
import { useUserStore } from '@/stores/user'
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
import BaseGrid from '@/components/grid/BaseGrid.vue'

// — register modules once
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// — vue-router / pinia
const router    = useRouter()
const userStore = useUserStore()
const toastRef = ref(null)

function showToast(msg) {
    toastRef.value?.show(msg)
}

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

// — grid column 정의
const columnDefs = ref([
  { headerName: '',       field: 'checkbox', checkboxSelection: true, headerCheckboxSelection: true, width:50, pinned:'left' },
  { headerName: '번호', valueGetter: params => params.api.getDisplayedRowCount() - params.node.rowIndex, sortable: false, flex: 0.3, cellClass:'center-align' },
  { headerName: '제목',     field: 'boardTitle',   flex:2 },
  { headerName: '작성자',   field: 'employeeName', flex:1, cellClass:'center-align' },
  { headerName: '작성일자',
    field: 'boardCreateAt',
    flex:1, 
    cellClass:'center-align',
      valueFormatter: params => {
      const v = params.value
      return v ? v.substring(0, 10) : '' 
    }
  }  
])

// — 상태
const fullData        = ref([])   // 원본 전체 목록
const rowData         = ref([])   // 그리드에 바인딩될 데이터
const searchText      = ref('')
const pageSize        = ref(10)
const showDeleteModal = ref(false)

// — JWT 토큰 헤더
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// — 1) 초기 데이터 로드
onMounted(async () => {
  try {
    const res = await axios.get('https://api.isddishr.site/boards/lists', {
      headers: authHeaders()
    })
    fullData.value = res.data
    rowData.value  = res.data
  } catch (e) {
    console.error('공지사항 목록 조회 실패:', e)
    showToast('공지사항을 불러오는 중 오류가 발생했습니다.')
  }
})

// — 2) 검색어 변경 시 자체 필터링
function onSearch() {
  const kw = searchText.value.trim().toLowerCase()
  if (!kw) {
    rowData.value = fullData.value
  } else {
    rowData.value = fullData.value.filter(item =>
      item.boardTitle.toLowerCase().includes(kw)
    )
  }
}

// — 3) AG Grid 준비 (gridApi 불필요하면 주석 처리 가능)
let gridApi = null
function onGridReady(params) {
  gridApi = params.api
}

// — 4) 삭제 모달 & 삭제 처리
function onDeleteClick() {
  const sel = gridApi?.getSelectedRows() || []
  if (!sel.length) return showToast('삭제할 항목을 선택하세요.')
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
}
async function confirmDelete() {
  const sel = gridApi.getSelectedRows()
  const ids = sel.map(r => r.boardId)
  try {
    await Promise.all(ids.map(id =>
      axios.delete(`https://api.isddishr.site/boards/${id}`, {
        headers: authHeaders()
      })
    ))
    // 로컬에서도 제거
    fullData.value = fullData.value.filter(r => !ids.includes(r.boardId))
    rowData.value  = rowData.value.filter(r => !ids.includes(r.boardId))
    gridApi.deselectAll()
    showDeleteModal.value = false
    showToast('선택 항목이 삭제되었습니다.')
  } catch (err) {
    console.error('삭제 실패:', err)
    showToast('삭제 중 오류가 발생했습니다.')
  }
}

// — 5) 등록 / 상세 이동
function onRegister() {
  router.push('/post/postEnroll')
}
function onCellClick(e) {
  if (e.colDef.field === 'boardTitle') {
    router.push(`/post/postDetail/${e.data.boardId}`)
  }
}
</script>



<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);
}

.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

/* 카드 스타일 */
.card {
  background: var(--bg-box);
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  max-width: 100%;
  overflow-x: auto;
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
  /* color: #1F2937; */
}
.search-bar-in-card .search-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
  pointer-events: none;
}
.search-bar-in-card .search-input {
  background-color: var(--ag-background-color);
  color: var(--text-main);
  width: 150px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 7px 8px;
  font-size: 14px;
}
/* .search-bar-in-card .search-input:focus {
  outline: none;
  border-color: #1F2937;
} */

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
}
.button-group {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

/* btn-save, btn-delete 스타일 */
.btn-save {
  background-color: var(--primary);
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
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
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
  background: var(--bg-box);
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
  justify-content: center;
  gap:10px
}
.modal-buttons .btn-delete {
  font-size: 14px;
  font-weight: bold;
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
.modal-buttons .btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: var(--primary);
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.modal-buttons .btn-delete:hover{
  background-color: #000;
  color: #fff;
}

.modal-buttons .btn-save:hover{
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

</style>
