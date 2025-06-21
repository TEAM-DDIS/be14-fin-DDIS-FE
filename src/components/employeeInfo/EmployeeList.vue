<template>
  <h1 class="page-title">사원조회</h1>
  <p class="desc">사원 목록 조회</p>

  <div class="card">
      <div class="controls">
      <!-- 검색창 -->
        <div class="search-bar-in-card">
          <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
          <input
            type="text"
            v-model="searchText"
            placeholder="사원명을 입력하세요."
            class="search-input"
          />
        </div>
        <!-- 재직중만 보기 체크박스 -->
          <label class="active-filter">
            <input
              type="checkbox"
              v-model="showActiveOnly"
            />
            재직중만 보기
        </label>
      </div>

    

    <!-- AG Grid -->
    <div class="ag-theme-alpine ag-grid-box">
      <AgGridVue
        class="ag-theme-alpine custom-theme"
        :style="{ width: '100%', height: '500px' }"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        :defaultColDef="defaultColDef"
        rowSelection="multiple"               
        :gridOptions="gridOptions"
        @grid-ready="onGridReady"
        @cellClicked="onCellClick"
      />
    </div>
      <!-- 하단 버튼 -->
      <div class="pagination-control">
        <div class="button-group">
          <!-- <button class="btn-delete" @click="onDeleteClick">삭제</button> -->
          <button v-if="isHR" class="btn-save"   @click="onRegister">등록</button>
        </div>
      </div>
  </div>

  <!-- 삭제 모달
  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content">
      <p>정말로 선택된 사원을 삭제하시겠습니까?</p>
      <div class="modal-buttons">
        <button class="btn-delete cancel" @click="cancelDelete">취소</button>
        <button class="btn-save confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div> -->
  <BaseToast ref="toastRef" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter }            from 'vue-router'
import axios                     from 'axios'
import { AgGridVue }             from 'ag-grid-vue3'
import { useUserStore }          from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue'
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

// 1) AG Grid 모듈 등록
ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  RowSelectionModule,
  PaginationModule,
  RowAutoHeightModule,
  CellStyleModule,
  ValidationModule
])

// 2) Pinia & Router
const userStore       = useUserStore()
const router          = useRouter()
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


// 4) 그리드 기본 설정
const defaultColDef   = { sortable: true, filter: true, resizable: true }

// 5) 컬럼 정의: 체크박스는 첫 번째 컬럼에만!
const columnDefs = [
  {
    headerName: '',
    width: 50,
    pinned: 'left',
    checkboxSelection: true,        // 행 체크박스
    headerCheckboxSelection: true   // 헤더 체크박스
  },
  { headerName: '사원번호', field: 'employeeId',     flex: 1, cellClass: 'center-align' },
  {
    headerName: '사원명',
    field: 'employeeName',
    flex: 1,
    cellRenderer: params => `<span class="clickable-name">${params.value}</span>`
  },
  { headerName: '본부',        field: 'headName',       flex: 1, cellClass: 'center-align' },
  { headerName: '부서',        field: 'departmentName', flex: 1, cellClass: 'center-align' },
  { headerName: '팀',          field: 'teamName',       flex: 1, cellClass: 'center-align' },
  { headerName: '직무',        field: 'jobName',        flex: 1.7, cellClass: 'center-align' },
  { headerName: '직책',        field: 'positionName',   flex: 0.7, cellClass: 'center-align' },
  { headerName: '직급',        field: 'rankName',       flex: 0.7, cellClass: 'center-align' },
  {
    headerName: '재직 여부',
    // retirementDate 가 null 이면 재직, 아니면 퇴직
    valueGetter: params =>
      params.data.retirementDate == null ? '재직' : '퇴직',
    sortable: true,
    filter: true,
    flex: 0.7,
    cellClass: 'center-align'
  }
]

// 6) gridOptions: 페이징+테마만
const gridOptions = {
  theme: 'legacy',
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [5, 10, 20, 50]
}

// 7) 상태 변수들
const rowData         = ref([])
const searchText      = ref('')
const showActiveOnly = ref(false)
const showDeleteModal = ref(false)
let gridApi           = null

// 필터링된 데이터 계산
const filteredData = computed(() => {
  return rowData.value.filter(r => {
    // 1) 검색어 필터
    const matchesName = !searchText.value
      ? true
      : r.employeeName.toLowerCase().includes(searchText.value.toLowerCase())
    // 2) 재직중만 보기
    const isActive = showActiveOnly.value
      ? r.retirementDate == null
      : true

    return matchesName && isActive
  })
})

// 9) API 호출
onMounted(async () => {
  try {
    const res = await axios.get('https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/employees/list', {
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })
    rowData.value = Array.isArray(res.data)
      ? res.data
      : res.data.employees ?? res.data.data ?? []
  } catch (e) {
    console.error('사원 목록 조회 실패:', e)
    if (e.response?.status === 401) {
      showToast('로그인이 필요합니다.')
      router.push('/login')
    } else {
      showToast('사원 목록 조회 중 오류가 발생했습니다.')
    }
  }
})

// 10) 그리드 API 참조
function onGridReady(params) {
  gridApi = params.api
}

// 11) 셀 클릭(사원명) → 상세 이동
function onCellClick(event) {
  // event.data 가 해당 행의 전체 데이터 객체
  const id = event.data.employeeId   // ← 여기서 꼭 .employeeId 꺼내세요
  if (id != null) {
    router.push(`/employeeInfo/${id}`)
  } else {
    console.warn('employeeId 가 없습니다:', event.data)
  }
}

// 12) 삭제 모달
function onDeleteClick() {
  const sel = gridApi.getSelectedRows()
  if (!sel.length) {
    showToast('삭제할 사원을 선택하세요.')
    return
  }
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
}
function confirmDelete() {
  const selIds = gridApi.getSelectedRows().map(r => r.employeeId)
  rowData.value = rowData.value.filter(r => !selIds.includes(r.employeeId))
  gridApi.deselectAll()
  showDeleteModal.value = false
  showToast('삭제가 완료되었습니다.')
}

// 13) 등록 이동
function onRegister() {
  router.push('/employeeInfo/employeeEnroll')
}
</script>

<style scoped>
.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.active-filter {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #374151;
}
.active-filter input {
  margin-right: 6px;
}
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
/* 카드 */
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 1px 1px 20px rgba(0,0,0,0.05);
  margin: 20px 10px 30px;
  padding: 20px 40px 32px;
}
/* 검색창 */
.search-bar-in-card {
  display: flex;
  width: 350px;
  margin-bottom: 10px;
  padding: 6px 8px;
  align-items: center;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
}
.search-icon { width:20px;height:20px;margin-right:8px; }
.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size:14px;
  color:#1F2937;
}
/* 그리드 박스 */
.ag-grid-box {
  height:500px;
  border:1px solid #d9d9d9;
  border-radius:8px;
  overflow:hidden;
}
/* 버튼 그룹 */
.pagination-control {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;  /* 그리드와의 세로 간격 */
}
.button-group { 
  display:flex-end;  
 }
.btn-save, .btn-delete {
  padding:10px 30px;
  border-radius:10px;
  font-weight:bold;
  cursor:pointer;
  box-shadow:0 2px 8px rgba(0,0,0,0.08);
  transition:all .2s;
}
.btn-save {
  background:#00a8e8; color:#fff; border:1px solid transparent;
}
.btn-save:hover { background:#fff; color:#00a8e8; border:1px solid #00a8e8; }
.btn-delete {
  background:#d3d3d3; color:#000; border:none;
}
.btn-delete:hover { background:#000; color:#fff; }
/* 모달 */
.modal-overlay {
  position:fixed; top:0;left:0;
  width:100vw;height:100vh;
  background:rgba(0,0,0,0.4);
  display:flex;align-items:center;justify-content:center;
}
.modal-content {
  background:#fff;padding:20px 24px;
  border-radius:8px;width:320px;
  box-shadow:0 2px 10px rgba(0,0,0,0.2);
  text-align:center;
}
.modal-buttons { display:flex; gap:8px; margin-top:16px; }
.modal-buttons .btn-delete,
.modal-buttons .btn-save { flex:1; }
/* 정렬 및 클릭 스타일 */
.center-align { display:flex;justify-content:center;align-items:center; }
.clickable-name {
  cursor:pointer; color:#1F2937; transition:color .2s;
}
.clickable-name:hover { color:#00a8e8; text-decoration:underline; }
/* 커스텀 테마 */
.custom-theme {
  --ag-background-color:#fff;
  --ag-foreground-color:#1F2937;
  --ag-header-background-color:#F9FAFB;
  --ag-header-foreground-color:#374151;
  --ag-row-hover-color:#F3F4F6;
  --ag-row-border-color:#E5E7EB;
}
.custom-theme .ag-row-hover .ag-cell {
  background-color:var(--ag-row-hover-color) !important;
}
</style>
