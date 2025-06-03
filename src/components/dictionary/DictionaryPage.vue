<template>
  <h1 class="page-title">용어사전</h1>

  <!-- 헤더: desc와 수정 버튼을 같은 높이에 배치 -->
  <header class="header">
    <p class="desc">용어사전 목록</p>
    <button class="btn-modify" @click="onModifyClick">수정</button>
  </header>

  <div class="card">
    <!-- 검색창 -->
    <div class="search-bar-in-card">
      <img src="@/assets/icons/search.svg" alt="검색" class="search-icon" />
      <input
        type="text"
        v-model="searchText"
        placeholder="용어를 입력하세요."
        class="search-input"
      />
    </div>

    <!-- AG Grid + 초성 사이드바를 감싸는 컨테이너 -->
    <div class="ag-grid-container">
      <!-- 실제 AG Grid만 감싸는 래퍼 -->
      <div class="ag-wrapper">
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

      <!-- 초성/영문 이니셜 사이드바 -->
      <div class="initials-sidebar">
        <ul>
          <li
            v-for="(cho, idx) in initials"
            :key="idx"
            :class="{ active: selectedInitial === cho }"
            @click="onInitialClick(cho)"
          >
            {{ cho }}
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 하단 버튼 -->
  <div class="pagination-control">
    <div class="button-group">
      <button class="btn-delete" @click="onDeleteClick">삭제</button>
      <button class="btn-save" @click="onRegisterClick">등록</button>
    </div>
  </div>

  <!-- 삭제 확인 모달 (입력/수정 모달과 동일한 디자인) -->
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

  <!-- 등록/수정 모달 (공통 디자인) -->
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

const router = useRouter()
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
    headerName: '용어',
    field: 'title',
    flex: 0.5,
    autoHeight: true,
    cellStyle: { whiteSpace: 'normal' },
    headerClass: 'header-word'
  },
  {
    headerName: '정의',
    field: 'definition',
    flex: 2,
    cellClass: 'center-align',
    headerClass: 'header-definition'
  },
])

// 더미 데이터
const rowData = ref([
  { id: 1, title: 'ERP', definition: '전사적 자원 관리 시스템으로, 기업의 모든 경영 활동을 통합 관리하는 소프트웨어' },
  { id: 2, title: '회계관리', definition: '기업의 재무 상태를 기록·분석·보고하는 기능을 제공하는 모듈' },
  { id: 3, title: '인사관리', definition: '직원 채용, 급여, 평가, 교육 등 인사 업무 전반을 관리하는 기능' },
  { id: 4, title: '재무회계', definition: '기업의 회계 장부를 작성하고 재무제표를 생성하는 회계 모듈' },
  { id: 5, title: '생산관리', definition: '원자재 투입부터 제품 출하까지 생산 공정을 계획·통제하는 기능' },
  { id: 6, title: '재고관리', definition: '창고별, 품목별 재고 수량을 실시간으로 파악하고 조정하는 기능' },
  { id: 7, title: '구매관리', definition: '구매 요청부터 발주, 납품, 대금 결제까지 구매 프로세스를 관리하는 기능' },
  { id: 8, title: '영업관리', definition: '고객견적 작성, 수주, 출하, 매출정산 등의 영업 활동을 관리하는 기능' },
  { id: 9, title: '고객관계관리', definition: '고객 정보를 수집·분석하여 마케팅, 영업, 서비스 활동을 지원하는 기능' },
  { id: 10, title: '전자결재', definition: '전사 문서를 전자 서명 방식으로 결재·승인하는 워크플로우 기능' },
  { id: 11, title: 'API', definition: 'Application Programming Interface의 약자로, 소프트웨어 간 상호작용을 위한 인터페이스' },
  { id: 12, title: 'Authentication', definition: '사용자 신원을 확인하고 권한을 부여하기 위한 인증 과정' },
  { id: 13, title: 'Bandwidth', definition: '네트워크가 전송할 수 있는 데이터의 최대 용량' },
  { id: 14, title: 'Caching', definition: '데이터를 임시로 저장하여 접근 속도를 높이는 기술' },
  { id: 15, title: 'Debugging', definition: '코드의 오류를 찾아내고 수정하는 과정' },
  { id: 16, title: 'Encryption', definition: '데이터를 암호화하여 안전하게 전송하거나 저장하는 기술' },
  { id: 17, title: 'Framework', definition: '소프트웨어 개발을 위해 사전에 작성된 기본 구조나 라이브러리 집합' },
  { id: 18, title: 'Git', definition: '분산 버전 관리 시스템으로, 소스 코드 변경 이력을 효율적으로 관리' },
  { id: 19, title: 'HTTP', definition: 'HyperText Transfer Protocol의 약자로, 웹에서 데이터를 주고받기 위한 프로토콜' },
  { id: 20, title: 'Interface', definition: '클래스나 모듈 간의 통신을 정의하는 경계 또는 규격' }
])

const searchText = ref('')
const pageSize = ref(10)
const showDeleteModal = ref(false)

// 등록/수정 모달 상태
const showEntryModal = ref(false)
const isEditMode = ref(false)
const entryTitle = ref('')
const entryDefinition = ref('')
const editingId = ref(null)

// 초성 + 영어 이니셜 배열
const initials = ref([
  // 한국어 초성
  'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ',
  // 영어 대문자 A-Z
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'
])
const selectedInitial = ref('')

// 한글 초성 계산 + 영어 대문자 처리 함수
function getInitialChar(str) {
  if (!str) return ''

  const firstChar = str.charAt(0)
  const code = firstChar.charCodeAt(0)

  // 영어 알파벳 (A-Z / a-z) 처리
  if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
    return firstChar.toUpperCase()
  }

  // 한글 음절 범위 내 초성 계산
  const uni = firstChar.charCodeAt(0) - 0xac00
  if (uni < 0 || uni > 11171) {
    return ''
  }
  const choIndex = Math.floor(uni / 588)
  const choList = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
  return choList[choIndex]
}

// 검색어 + 초성/영어 이니셜 필터링
const filteredData = computed(() => {
  return rowData.value.filter(item => {
    const matchesSearch = !searchText.value
      ? true
      : item.title.toLowerCase().includes(searchText.value.toLowerCase())

    const initChar = getInitialChar(item.title)
    const matchesInitial = !selectedInitial.value
      ? true
      : initChar === selectedInitial.value

    return matchesSearch && matchesInitial
  })
})

// 그리드 준비 시 API 저장
function onGridReady(params) {
  gridApi = params.api
}

// 삭제 버튼 클릭 → 삭제 확인 모달 열기
function onDeleteClick() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length === 0) {
    alert('삭제할 항목을 선택하세요.')
    return
  }
  showDeleteModal.value = true
}

// 삭제 모달 취소
function cancelDelete() {
  showDeleteModal.value = false
}

// 삭제 모달 확인 → 삭제 로직
function confirmDelete() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length > 0) {
    rowData.value = rowData.value.filter(row => !selectedRows.includes(row))
    gridApi.deselectAll()
  }
  showDeleteModal.value = false

  alert('삭제가 완료되었습니다.')
}

// 등록 버튼 클릭 → 등록 모달 열기
function onRegisterClick() {
  isEditMode.value = false
  entryTitle.value = ''
  entryDefinition.value = ''
  editingId.value = null
  showEntryModal.value = true
}

// 수정 버튼 클릭 → 선택된 항목이 있으면 수정 모달 열기
function onModifyClick() {
  const selectedRows = gridApi.getSelectedRows()
  if (selectedRows.length !== 1) {
    alert('수정할 항목을 하나만 선택하세요.')  
    return
  }
  const item = selectedRows[0]
  isEditMode.value = true
  editingId.value = item.id
  entryTitle.value = item.title
  entryDefinition.value = item.definition
  showEntryModal.value = true
}

// 등록/수정 모달 취소
function cancelEntry() {
  showEntryModal.value = false
}

// 등록/수정 모달 완료
function confirmEntry() {
  const title = entryTitle.value.trim()
  const definition = entryDefinition.value.trim()
  if (!title || !definition) {
    alert('용어명과 내용을 모두 입력하세요.')
    return
  }

  if (isEditMode.value) {
    // 수정 모드: 해당 항목 업데이트
    const idx = rowData.value.findIndex(r => r.id === editingId.value)
    if (idx !== -1) {
      rowData.value[idx].title = title
      rowData.value[idx].definition = definition
    }
    showEntryModal.value = false
    alert('수정이 완료되었습니다.')
  } else {
    // 등록 모드: 새로운 ID 생성 후 추가
    const newId = Math.max(...rowData.value.map(r => r.id)) + 1
    rowData.value.push({ id: newId, title, definition })
    showEntryModal.value = false
    alert('등록이 완료되었습니다.')
  }

  // 선택 해제 및 새로고침
  gridApi && gridApi.deselectAll()
}

// 행 높이 동적 조정
function getRowHeight(params) {
  return params.data && params.data.title.length > 20
    ? 80
    : defaultRowHeight
}

// 초성/영문 이니셜 클릭 시
function onInitialClick(cho) {
  if (selectedInitial.value === cho) {
    selectedInitial.value = ''
  } else {
    selectedInitial.value = cho
  }
}
</script>

<style scoped>
.page-title {
  margin-left: 20px;
  margin-bottom: 50px;
  color: #00a8e8;
}

/* 헤더: desc와 수정 버튼을 같은 높이에 배치 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 10px;
}

/* desc 위치는 그대로 유지 */
.desc {
  margin: 0;
  font-size: 16px;
  color: #333;
}

/* 수정 버튼 */
.btn-modify {
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
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  width: 100%;
  margin: 0 10px 30px;
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
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
  height: 300px;              /* 그리드 높이(500px)의 중앙에 오도록 절반 이하로 설정 */
  background: #fafafa;
  border: 1px solid #d9d9d9;
  border-radius: 30px;
  overflow-y: auto;
}

/* 스크롤바 스타일 */
.initials-sidebar::-webkit-scrollbar {
  width: 6px;
}
.initials-sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 20px;
}
.initials-sidebar::-webkit-scrollbar-track {
  background: transparent;
  margin: 30px 0;            /* 테두리 곡선 부분과 간섭 없도록 위/아래 여백 */
  border-radius: 3px;
}

.initials-sidebar ul {
  list-style: none;
  padding: 4px 0;
  margin: 0;
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
.initials-sidebar li:hover {
  background: #e0f7fa;
}
.initials-sidebar li.active {
  background: #00a8e8;
  color: #fff;
  font-weight: bold;
}

/* 하단 버튼 영역 */
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
  justify-content: space-between;
}
.entry-buttons .btn-delete,
.entry-buttons .btn-save {
  width: 48%;
}
</style>
