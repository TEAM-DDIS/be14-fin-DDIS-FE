<template>
  <h1 class="page-title">용어사전</h1>

  <header class="header">
    <p class="desc">용어사전 목록</p>
  </header>

  <div class="card">
    <div class="search-bar-in-card">
      <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
      <input
        type="text"
        v-model="searchText"
        placeholder="용어를 입력하세요."
        class="search-input"
      />
    </div>

    <div class="ag-grid-container">
      <div class="ag-wrapper">
        <BaseGrid
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          style="width: 100%; height: 500px;"
          :columnDefs="columnDefs"
          :rowData="filteredData"
          rowSelection="multiple"
          :pagination="true"
          :paginationPageSize="pageSize"
          @ready="onGridReady"
          @cell-click="onCellClick"
        />
      </div>

      <div class="initials-sidebar">
        <ul>
          <li
            v-for="cho in initials"
            :key="cho"
            :class="{
              active: selectedInitial === cho,
              disabled: !typeInitials.includes(cho)
            }"
            @click="onInitialClick(cho)"
          >
            {{ cho }}
          </li>
        </ul>
      </div>
    </div>
        <div class="button-group">
      <button
        v-if="isHR"
        class="btn-delete"
        @click="onDeleteClick"
      >
        삭제
      </button>
            <button
        v-if="isHR"
        class="btn-modify"
        @click="onModifyClick"
      >
        수정
      </button>
      <button
        v-if="isHR"
        class="btn-modify"
        @click="onRegisterClick"
      >
      등록
      </button>
    </div>
  </div>

  <div class="pagination-control"></div>

  <div v-if="showDeleteModal" class="modal-overlay">
    <div class="modal-content entry-modal">
      <h3>용어 삭제</h3>
      <p>정말로 선택된 항목을 삭제하시겠습니까?</p>
      <div class="modal-buttons entry-buttons">
        <button class="btn-delete cancel" @click="cancelDelete">취소</button>
        <button class="btn-save confirm" @click="confirmDelete">확인</button>
      </div>
    </div>
  </div>

  <div v-if="showEntryModal" class="modal-overlay">
    <div class="modal-content entry-modal">
      <h3>{{ isEditMode ? '용어 수정' : '용어 등록' }}</h3>
      <div class="form-group">
        <label for="term-name">용어명</label>
        <input
          id="term-name"
          type="text"
          v-model="entryTitle"
          placeholder="용어명을 입력하세요."
          class="modal-input"
        />
      </div>
      <div class="form-group">
        <label for="term-definition">내용</label>
        <textarea
          id="term-definition"
          v-model="entryDefinition"
          placeholder="내용을 입력하세요."
          class="modal-textarea"
        ></textarea>
      </div>
      <div class="modal-buttons entry-buttons">
        <button class="btn-delete cancel" @click="cancelEntry">취소</button>
        <button class="btn-save confirm" @click="confirmEntry">완료</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
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

const router      = useRouter()
const userStore   = useUserStore()
const API_BASE    = 'http://localhost:5000/dictionary'

let gridApi       = null
const columnDefs  = ref([
  { headerName: '', field: 'checkbox', checkboxSelection: true, headerCheckboxSelection: true, width: 50, pinned: 'left' },
  { headerName: '번호', field: 'id', width: 100, cellClass: 'center-align' },
  { headerName: '용어', field: 'title', flex: 0.5, autoHeight: true, cellStyle: { whiteSpace: 'normal' } },
  { headerName: '설명', field: 'definition', flex: 2, cellClass: 'center-align' }
])
const rowData         = ref([])
const searchText      = ref('')
const pageSize        = ref(10)
const initials        = ref([
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ',
  'ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
  'Q','R','S','T','U','V','W','X','Y','Z'
])
const selectedInitial = ref('')
const showDeleteModal = ref(false)
const showEntryModal  = ref(false)
const isEditMode      = ref(false)
const entryTitle      = ref('')
const entryDefinition= ref('')
const editingId       = ref(null)

// JWT 페이로드 파싱
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

// HR 여부 계산
const isHR = computed(() => {
  const raw = userStore.accessToken?.replace(/^Bearer\s/, '') || ''
  const { auth } = parseJwtPayload(raw)
  if (Array.isArray(auth))    return auth.includes('ROLE_HR')
  if (typeof auth === 'string') return auth.includes('ROLE_HR')
  return false
})

// 인증 헤더 생성
function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// 초성·영문 이니셜 계산
function getInitialChar(str) {
  if (!str) return ''
  const c    = str.charAt(0)
  const code = c.charCodeAt(0)
  const cho  = [
    'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ',
    'ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
  ]
  if (cho.includes(c)) return c
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
    return c.toUpperCase()
  }
  const uni = code - 0xAC00
  if (uni < 0 || uni > 11171) return ''
  return cho[Math.floor(uni / 588)]
}

// 활성화된 이니셜만
const typeInitials = computed(() => {
  const s = new Set()
  rowData.value.forEach(d => {
    const init = getInitialChar(d.type)
    if (init) s.add(init)
  })
  return [...s]
})

// 검색 + 이니셜 필터링
const filteredData = computed(() => {
  return rowData.value.filter(item => {
    const okSearch = !searchText.value ||
      item.title.toLowerCase().includes(searchText.value.toLowerCase())
    const okInit = !selectedInitial.value ||
      getInitialChar(item.type) === selectedInitial.value
    return okSearch && okInit
  })
})

// AG Grid 준비 콜백
function onGridReady(params) {
  gridApi = params.api
}

// 이니셜 클릭 핸들러
function onInitialClick(cho) {
  selectedInitial.value = selectedInitial.value === cho ? '' : cho
}

// 전체 목록 조회
async function fetchDictionary() {
  try {
    const res = await axios.get(API_BASE, { headers: authHeaders() })
    rowData.value = res.data.map(d => ({
      id: d.dictionaryId,
      title: d.dictionaryName,
      definition: d.dictionaryContent,
      type: d.dictionaryType
    }))
  } catch (e) {
    console.error(e)
    alert('용어사전 로드에 실패했습니다.')
  }
}

// 삭제 모달 오픈
function onDeleteClick() {
  if (!gridApi.getSelectedRows().length) {
    return alert('삭제할 항목을 선택하세요.')
  }
  showDeleteModal.value = true
}
function cancelDelete() {
  showDeleteModal.value = false
}
async function confirmDelete() {
  try {
    const rows = gridApi.getSelectedRows()
    await Promise.all(rows.map(r =>
      axios.delete(`${API_BASE}/${r.id}`, { headers: authHeaders() })
    ))
    await fetchDictionary()
  } catch (e) {
    console.error(e)
    alert('삭제에 실패했습니다.')
  } finally {
    showDeleteModal.value = false
  }
}

// 등록 모달 오픈
function onRegisterClick() {
  isEditMode.value = false
  entryTitle.value = ''
  entryDefinition.value = ''
  showEntryModal.value = true
}

// 수정 모달 오픈
function onModifyClick() {
  const rows = gridApi.getSelectedRows()
  if (rows.length !== 1) {
    return alert('하나만 선택하세요.')
  }
  isEditMode.value      = true
  editingId.value       = rows[0].id
  entryTitle.value      = rows[0].title
  entryDefinition.value = rows[0].definition
  showEntryModal.value  = true
}

// 등록/수정 취소
function cancelEntry() {
  showEntryModal.value = false
}

// 등록/수정 완료
async function confirmEntry() {
  const title = entryTitle.value.trim()
  const def   = entryDefinition.value.trim()
  if (!title || !def) {
    return alert('용어명과 내용을 모두 입력하세요.')
  }
  try {
    if (isEditMode.value) {
      await axios.put(
        `${API_BASE}/${editingId.value}`,
        { dictionaryName: title, dictionaryContent: def },
        { headers: authHeaders() }
      )
    } else {
      await axios.post(
        API_BASE,
        { dictionaryName: title, dictionaryContent: def },
        { headers: authHeaders() }
      )
    }
    await fetchDictionary()
    showEntryModal.value = false
  } catch (e) {
    console.error(e)
    alert('저장에 실패했습니다.')
  }
}

onMounted(fetchDictionary)
</script>


<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

/* 헤더: desc와 수정 버튼을 같은 높이에 배치 */

/* desc 위치는 그대로 유지 */
.desc {
    display: block;
    margin-left: 20px;
    margin-bottom: 10px;
    font-size: 18px;
}

.card > .btn-modify {
  position: absolute;
  top: 20px;   /* 카드 padding-top 과 동일하게 */
  right: 40px; /* 카드 padding-right 과 동일하게 */
}

/* 수정 버튼 */
.btn-modify {
  display: flex;
  justify-content: flex-end;
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
.btn-modify:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 카드 영역 */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-left: 20px;
  max-width: 100%;
  overflow-x: auto;
}

/* 검색창 */
.search-bar-in-card {
  display: flex;
  width: 300px;
  height: 30px;
  align-items: center;
  margin-bottom: 10px;
  padding: 6px 8px;
  font-size: 14px;
  color: #1f2937;
}
.search-bar-in-card .search-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  pointer-events: none;
}
.search-bar-in-card .search-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 14px;
  color: #1f2937;
}
.search-bar-in-card .search-input:focus {
  outline: none;
  border-color: #1f2937;
}

/* AG Grid + 사이드바 컨테이너 */
.ag-grid-container {
  display: flex;           /* 내부를 flex로 바꿔야 사이드바가 보입니다 */
  align-items: center;     /* 사이드바를 세로 중앙에 위치시킵니다 */
  position: relative;
  gap: 20px;               /* 그리드와 사이드바 사이 여백 */
}

/* 실제 AG Grid만 감싸는 래퍼: border, border-radius, overflow를 이곳으로 */
.ag-wrapper {
  flex: 1;                 /* flex-grow 해서 가로공간 모두 차지 */
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
  height: 500px;           /* 그리드 높이와 동일 */
}

/* AG Grid 본체: 테두리/overflow는 ag-wrapper가 담당하므로 깨끗하게 */
.ag-theme-alpine.custom-theme {
  width: 100%;
  height: 100%;
}

/* 초성/영문 이니셜 사이드바 */
.initials-sidebar {
  width: 60px;
  height: 500px;              /* 그리드 높이(500px)의 중앙에 오도록 절반 이하로 설정 */
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 25px;
  overflow-y: auto;
}

/* 스크롤바 스타일 */
.initials-sidebar::-webkit-scrollbar {
  width: 4px;
}
.initials-sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 20px;
}
.initials-sidebar::-webkit-scrollbar-track {
  background: transparent;
  margin: 12px 0;            /* 테두리 곡선 부분과 간섭 없도록 위/아래 여백 */
  border-radius: 3px;
}

.initials-sidebar ul {
  list-style: none;
  padding: 4px 0;
  margin: 0;
}

.initials-sidebar li:hover {
  background: #d7d7d7;
  border: transparent;
  border-radius: 4px;
}
.initials-sidebar li.active {
  background: #00a8e8;
  color: #fff;
  font-weight: bold;
  border: transparent;
  border-radius: 4px;
}

.initials-sidebar li {
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  padding: 6px 0;
  color: #555;
  user-select: none;
  transition: background 0.2s, color 0.2s;
}

.initials-sidebar li.disabled {
  color: #ccc;
  cursor: default;
}
.initials-sidebar li.disabled:hover {
  background: transparent;
}



/* 하단 버튼 영역 */
.pagination-control {
  display: flex;
  justify-content: flex-end;
  margin: 0 20px 20px;
}
.button-group {
  justify-content: flex-end;
  margin-top: 20px;   
  display: flex;
  gap: 10px;
  z-index: 10;
}

.btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
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
.btn-delete:hover {
  background-color: #000;
  color: #fff;
}

/* 모달 오버레이 */
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

/* 등록/수정/삭제 모달 (공통 디자인) */
.entry-modal {
  background: #fff;
  width: 500px;
  border-radius: 12px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
}
.entry-modal h3 {
  margin: 0 0 16px;
  text-align: center;
}
.entry-modal .form-group {
  margin-bottom: 16px;
}
.entry-modal label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}
.entry-modal .modal-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-sizing: border-box;
}
.entry-modal .modal-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  height: 100px;
  resize: vertical;
  box-sizing: border-box;
}

/* 모달 버튼 배치 */
.entry-buttons {
  display: flex;
  justify-content: center;
  gap:10px
}

.entry-buttons .btn-save {
  font-size: 14px;
  font-weight: bold;
  background-color: #00a8e8;
  color: white;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.entry-buttons .btn-save:hover{
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.entry-buttons.btn-delete {
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
.entry-buttons.btn-delete:hover{
  background-color: #000;
  color: #fff;
}


</style>
