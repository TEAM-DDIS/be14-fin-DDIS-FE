<!-- 전자결재  > 문서함 > 결재함 -->

<template>
  <!-- 1. 상단: 페이지 제목 -->
  <h1 class="page-title">결재함</h1>
  <div class="approval-box-page">

    <!-- 2. 탭 -->
    <div class="tab-wrapper">
      <div class="tabs">
        <span :class="{ active: tab.value === '전체' }" @click="tab.value = '전체'">전체</span>
        <span :class="{ active: tab.value === '결재' }" @click="tab.value = '결재'">결재</span>
        <span :class="{ active: tab.value === '진행' }" @click="tab.value = '진행'">진행</span>
        <span :class="{ active: tab.value === '완료' }" @click="tab.value = '완료'">완료</span>
      </div>
    </div>

    <!-- 3. 메인 컨텐츠 박스 (검색 + 테이블) -->
    <div class="main-box">
      <!-- 3-1. 검색 영역 -->
      <div class="search-row">
        <div class="search-item">
          <label>기안 제목</label>
          <input type="text" v-model="search.title" placeholder="기안 제목 입력" />
        </div>
        <div class="search-item">
          <label>기안상신일</label>
          <input type="date" v-model="search.startDate" /> ~
          <input type="date" v-model="search.endDate" />
        </div>
      </div>

      <!-- 3-2. 목록 테이블 영역 -->
      <div class="table-box">
        <AgGridVue
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :columnDefs="currentColumnDefs"
          :rowData="filteredForms"
          :pagination="true"
          :paginationPageSize="10"
          :paginationPageSizeSelector="[10, 20, 50, 100]"
          rowSelection="single"  
          @row-click="handleFormRowClick"
          :overlayNoRowsTemplate="'<span class=\'ag-empty\'>데이터가 없습니다.</span>'"
          style="width: 100%; height: 100%;"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import AgGridVue from '@/components/grid/BaseGrid.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

// 상태 정의
const tab = reactive({ value: '결재' })
const search = reactive({startDate: '', endDate: '',  title: ''})
const docs = ref([])
const router = useRouter() 
const userStore = useUserStore()

axios.defaults.headers.common['Authorization'] = `Bearer ${userStore.accessToken}`
ModuleRegistry.registerModules([AllCommunityModule])


function authHeaders() {
  return { Authorization: `Bearer ${userStore.accessToken}` }
}

// 기안자 및 직급 포맷팅 헬퍼 함수
function formatWriter(name, rank) {
  if (name && rank) return `${name} / ${rank}`
  if (name) return name
  return '-'
}

// 탭별 그리드 컬럼 설정
const columnDefsByTab = {
  '전체': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 180 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '결재유형', field: 'lineType', width: 180},
    { headerName: '상신일시', field: 'submittedAt', width: 180, sort: 'desc' },
    { headerName: '결재상태', field: 'docStatus', width: 180 },
    { headerName: '기안자', field: 'writer', width: 180 }
  ],
  '결재': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 180 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '결재유형', field: 'lineType', width: 180},
    { headerName: '상신일시', field: 'submittedAt', width: 180, sort: 'desc' },
    { headerName: '결재상태', field: 'docStatus', width: 180 },
    { headerName: '기안자', field: 'writer', width: 180 }
  ],
  '진행': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 180 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '결재유형', field: 'lineType', width: 180},
    { headerName: '상신일시', field: 'submittedAt', width: 180, sort: 'desc' },
    { headerName: '결재상태', field: 'docStatus', width: 180 },
    { headerName: '기안자', field: 'writer', width: 180 }
  ],
  '완료': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 180 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '결재유형', field: 'lineType', width: 180},
    { headerName: '완료일시', field: 'approvedAt', width: 180, sort: 'desc' },
    { headerName: '기안자', field: 'writer', width: 180 }
  ]
}
const currentColumnDefs = computed(() => columnDefsByTab[tab.value] || [])

const statusMap = {
  '결재': { docStatus: ['심사중'], lineStatus: ['미결'] },
  '진행': { docStatus: ['심사중'], lineStatus: ['승인'] },
  '완료': { docStatus: ['결재완료'], lineStatus: ['승인'] }
}

// 백엔드에서 결재 문서 목록 조회
function formatDateTime(dateString) {
  if (!dateString) return ''
  const dt = new Date(dateString)
  const yyyy = dt.getFullYear()
  const MM   = String(dt.getMonth() + 1).padStart(2, '0')
  const dd   = String(dt.getDate()).padStart(2, '0')
  const hh   = String(dt.getHours()).padStart(2, '0')
  const mm   = String(dt.getMinutes()).padStart(2, '0')
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`
}

async function fetchApprovals() {
  console.log('✅ fetchApprovals 호출됨. 현재 탭:', tab.value)  // 👈 무조건 찍혀야 함
  try {
    const res = await axios.get(`http://localhost:5000/approvals/ApprovalBox?tab=${tab.value}`, {
      headers: authHeaders()
    })
    console.log('📦 응답 데이터:', res.data)
    
    const list = Array.isArray(res.data) ? res.data : res.data.documents || []

    docs.value = list
      .filter(doc => doc && typeof doc === 'object') // 안전 필터링
    .map((doc, idx) => ({
      docId:       doc.docId,
      lineType:    doc.lineType,
      title:       doc.title,
      submittedAt: formatDateTime(doc.submittedAt || doc.createdAt),
      approvedAt:  formatDateTime(doc.approvedAt),
      docStatus:   doc.docStatus || '',
      lineStatus:  doc.lineStatus || '',
      drafter:     doc.drafter || '',       // 기안자 이름
      drafterRank: doc.drafterRank || '', // 기안자 직급
      type:        doc.type   || '',
      approverName: doc.approverName || '', // 현재 결재자 이름 추가
      approverRank: doc.approverRank || '', // 현재 결재자 직급 추가
      no:          idx + 1
    }))
  } catch (e) {
    console.error('❗ 결재함 조회 실패', e)
  }
}

onMounted(fetchApprovals)

watch(tab, fetchApprovals)

// 검색/탭 조건에 따른 필터링
const filteredForms = computed(() => {   
  const expected = statusMap[tab.value]

  // 1. 필터링
  const filtered = docs.value.filter(doc => {
    if (!doc) return false
    const isRejected = doc.lineStatus === '반려' || doc.docStatus === '반려'
    if (tab.value !== '전체' && isRejected) return false
    if (tab.value === '전체' && isRejected) return true

    if (expected) {
      const docStatusMatch = expected.docStatus.includes(doc.docStatus)
      const lineStatusMatch = expected.lineStatus.includes(doc.lineStatus)
      if (!docStatusMatch || !lineStatusMatch) return false
    }

    if (
      search.title &&
      !doc.title?.replace(/\s/g, '').toLowerCase().includes(
        search.title.replace(/\s/g, '').toLowerCase()
      )
    ) {
      return false
    }

    if (search.startDate || search.endDate) {
    const submitted = doc.submittedAt?.slice(0, 10) // yyyy-MM-dd
    if (!submitted) return false

    if (search.startDate && submitted < search.startDate) return false
    if (search.endDate && submitted > search.endDate) return false
  }
    return true
  })

  // 2. 최신순 정렬
  const sorted = filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  // 3. 번호 재지정 (최신순으로 1번부터)
  return sorted.map((doc, index) => ({
    ...doc,
    no: index + 1,
    writer: formatWriter(doc.drafter, doc.drafterRank)
  }))
})

// 행 클릭 핸들러
function handleFormRowClick(params) {
  console.log('선택된 행:', params.data)
  const docId = params.data.docId
  // /drafts/8 같은 경로로 이동
  router.push({
    name: 'DraftDetail',
    params: {docId},
    query: { box: 'ApprovalBox' }
  })
}
</script>

<style>
/* 흰색 메인 컨텐츠 박스 */
.main-box {
  background-color: var(--bg-box);
  border-radius: 0px 12px 12px 12px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin-bottom: 50px;
  padding: 30px;
  box-sizing: border-box;
}

/* 페이지 타이틀 */
.page-title {
    margin-left: 20px;
    margin-bottom: 30px;
    color: var(--primary)
}

.approval-box-page {
  padding: 20px 20px 20px;
}

/* 🔷 겹쳐지는 탭 스타일 */
.tab-wrapper {
    position: relative;
    z-index: 2;
}

/* 탭 영역 */
.tabs {
  display: flex;
  align-items: flex-end;
  gap: 0;
  position: relative;
  margin-right: -20px; 
}

.tabs span {
  font-size: 18px;
  padding: 10px 30px;
  border: none;
  border-bottom: none;
  background-color: #C8C8C8;
  color: var(--bg-main);
  text-decoration: none; /* ✅ 밑줄 제거 */
  cursor: pointer;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  z-index: 1;
  margin-right: -10px; /* ✅ 가로 겹치기 */
  transition: all 0.2s ease;
}

.tabs .active {
  z-index: 3;
  background: var(--bg-box);
  color: var(--modal-text);
  border-bottom: none;

}

/* ------- 검색 영역 ------ */
.search-row {
    width: 100%;                  /* 부모 컨테이너 전체 너비 사용 */
    display: flex;                /* 자식 요소(검색 인풋/버튼 등)를 한 줄로 나열 */
    align-items: flex-end;        /* 하단 정렬 */
    justify-content: flex-end;    /* 오른쪽 끝 정렬 */
    margin-bottom: 12px;          /* 아래와의 간격 */
    margin-top: 0;                /* 위쪽 여백 없음 */
    padding-right: 0;
    gap: 15px;                    /* 각 search-item 사이 간격(버튼 포함) */
}

.search-item {
  background-color: var(--modal-box-bg);
  display: flex;                /* label, input을 한 줄에 배*/
  flex-direction: row;          /* 가로 정렬(한 줄) */
  align-items: center;          
  gap: 5px;                     
  min-width: 150px;             
  background-color: transparent;         
}

.search-item label {
  margin-bottom: 2px;           
  color: var(--text-main);
}

.search-item input[type="date"],
.search-item input[type="text"] {
  padding: 6px 8px;          /* 인풋 내부 여백 */
  border: 1px solid #e0e0e0;
  border-radius: 6px;           /* 둥근 테두리 */
  width: 200px;
  transition: border 0.2s, box-shadow 0.2s;
  background-color: var(--modal-box-bg);
  height: 18px;
  color: var(--text-main);
  font-family: 'inter';
}

/* 인풋 placeholder 색상 등 스타일 */
.search-item input[type="text"]::placeholder {
    color: #bbb;
}



/* ------- 표 박스 ------- */
.table-box {
    width: 100%;
    height: 500px;                 /* 원하는 고정 크기 */
    padding: 0;
    margin: 0;
    border: 1px solid #e3e5e8;     /* 연한 회색 테두리 */
    border-radius: 8px;            /* 둥근 모서리 */
    overflow: auto;             
    box-sizing: border-box;
/* → 이 상태에서 내부 AgGridVue가 100% 채움 */
}

</style>