<!-- 전자결재  > 문서함 > 결재함 -->

<template>
  <!-- 1. 상단: 페이지 제목 -->
  <h1 class="page-title">결재함</h1>

  <!-- 2. 탭 -->
  <div class="tabs">
    <span :class="{ active: tab.value === '전체' }" @click="tab.value = '전체'">전체</span>
    <span :class="{ active: tab.value === '결재' }" @click="tab.value = '결재'">결재</span>
    <span :class="{ active: tab.value === '진행' }" @click="tab.value = '진행'">진행</span>
    <span :class="{ active: tab.value === '완료' }" @click="tab.value = '완료'">완료</span>
  </div>

  <!-- 3. 메인 컨텐츠 박스 (검색 + 테이블) -->
  <div class="main-box">
    <!-- 3-1. 검색 영역 -->
    <div class="search-row">
      <div class="search-item">
        <label>기안상신일</label>
        <input type="date" v-model="search.date" />
      </div>
      <div class="search-item">
        <label>기안 제목</label>
        <input type="text" v-model="search.title" placeholder="기안 제목 입력" />

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
        rowSelection="single"
        @rowClicked="handleFormRowClick"
        :overlayNoRowsTemplate="'<span class=\'ag-empty\'>데이터가 없습니다.</span>'"
        style="width:100%; height:100%;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

// 상태 정의
const tab = reactive({ value: '결재' })
const search = reactive({ date: '', title: '' })
const docs = ref([])
const router = useRouter()  

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
    { headerName: '구분', field: 'type', width: 150 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '상신일시', field: 'submittedAt', width: 230 },
    { headerName: '결재상태', field: 'docStatus', width: 230 },
    { headerName: '기안자', field: 'writer', width: 150 }
  ],
  '결재': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 150 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '상신일시', field: 'submittedAt', width: 230 },
    { headerName: '결재상태', field: 'docStatus', width: 230 },
    { headerName: '기안자', field: 'writer', width: 150 }
  ],
  '진행': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 150 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '상신일시', field: 'submittedAt', width: 230 },
    { headerName: '결재상태', field: 'docStatus', width: 230 },
    { headerName: '기안자', field: 'writer', width: 150 }
  ],
  '완료': [
    { headerName: '번호', field: 'no', width: 100 },
    { headerName: '구분', field: 'type', width: 150 },
    { headerName: '제목', field: 'title', flex: 1 },
    { headerName: '완료일시', field: 'approvedAt', width: 230 },
    { headerName: '기안자', field: 'writer', width: 150 }
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
    const res = await axios.get(`https://ddis-be-alb-1219702514.ap-northeast-2.elb.amazonaws.com/approvals/ApprovalBox?tab=${tab.value}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    console.log('📦 응답 데이터:', res.data)
    
    const list = Array.isArray(res.data) ? res.data : res.data.documents || []

    docs.value = list
      .filter(doc => doc && typeof doc === 'object') // 안전 필터링
    .map((doc, idx) => ({
      docId:       doc.docId,
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
  return docs.value
    .filter(doc => {
      if (!doc) return false  // ✅ null 또는 undefined 방지
      const isRejected = doc.lineStatus === '반려' || doc.docStatus === '반려'

      // '전체' 탭이 아닌 경우 반려 문서는 표시하지 않음
      if (tab.value !== '전체' && isRejected) return false

      // '전체' 탭인 경우 반려 문서는 항상 표시함
      if (tab.value === '전체' && isRejected) return true

      // 현재 탭이 결재/진행/완료인 경우, 해당 상태 조건과 일치해야 표시됨
      if (expected) {
        const docStatusMatch = expected.docStatus.includes(doc.docStatus)
        const lineStatusMatch = expected.lineStatus.includes(doc.lineStatus)
        if (!docStatusMatch || !lineStatusMatch) return false
      }

      // 제목 검색 조건
      if (search.title && !doc.title?.includes(search.title)) return false

      if (search.date) {
        const dateOnly = doc.submittedAt?.slice(0, 10)
        if (dateOnly !== search.date) return false
      }
      return true
    })
    .map((doc, idx, arr) => ({
      ...doc,
      no: arr.length - idx,  // 번호는 뒤에서부터
      writer: formatWriter(doc.drafter, doc.drafterRank) // 기안자 이름과 직급을 포맷하여 할당
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
    background: #fff;
    border-radius: 12px;
    box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
    width: 100%;
    height: 700px;
    min-width: 0;
    max-width: 100%;
    margin: 20px 0 0 0;     /* 상단 32px, 좌우하단 0 */
    padding: 40px 40px 32px 40px; /* 상 우 하 좌 */
    box-sizing: border-box;
}

/* 페이지 타이틀 */
.page-title {
    margin-left: 20px;
    margin-bottom: 30px;
    color: #00a8e8;
}

/* 탭 영역 */
.tabs {
    display: flex;
    gap: 36px;           /* 탭 사이 간격 */
    font-size: 1.2em;
    font-weight: 500;
    margin-left: 4px;
}

.tabs span {
    color: #8b95a1;
    padding-bottom: 8px;
    cursor: pointer;
    transition: color 0.2s;
}

.tabs .active {
    color: #1f2937;
    border-bottom: 3px solid #00a8e8;  /* 클릭시 검은색 강조 */
    font-weight: bold
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
    display: flex;                /* label, input을 한 줄에 배치 */
    flex-direction: row;          /* 가로 정렬(한 줄) */
    align-items: center;          /* 세로 중앙 정렬 */
    gap: 8px;                     /* label과 input 사이 간격 */
    min-width: 150px;             /* 최소 너비(인풋이 깨지지 않게) */
}

.search-item label {
    font-size: 16.5px;            /* label 폰트 크기 (1.04rem 기준) */
    color: #343434;               /* label 텍스트 색상 */
    margin-bottom: 2px;           /* (행 아닌 열 정렬일 땐 의미 없음, row일 땐 영향 없음) */
    font-weight: 500;             /* label 굵기 */
    letter-spacing: -0.5px;       /* 자간 조정 */
}

.search-item input[type="date"],
.search-item input[type="text"] {
    padding: 8px 12px;            /* 인풋 내부 여백 */
    border: 1.2px solid #e1e7ee;  /* 연한 회색 테두리 */
    border-radius: 8px;           /* 둥근 테두리 */
    background: #fff;
    font-size: 16px;              /* 입력값, placeholder 모두 16px로 통일 */
    width: 180px;                 /* 입력 란의 고정 폭 */
    min-width: 180px;
    max-width: 180px;             /* 고정 폭: 포커스 등으로 절대 안 커짐 */
    box-sizing: border-box;       /* 패딩·테두리 포함한 크기 */
    transition: border 0.2s, box-shadow 0.2s;
}

/* 인풋 placeholder 색상 등 스타일 */
.search-item input[type="text"]::placeholder {
    color: #bbb;
    font-size: 16px;              /* placeholder도 16px로 고정 */
}

/* 입력란 클릭/포커스시 효과 */
.search-item input[type="text"]:focus,
.search-item input[type="date"]:focus {
    outline: none;                /* 기본 파란 테두리 제거 */
    border: 1px solid #1f2937;    /* 파란 테두리(폭은 2px, 색상 변경 가능) */
/* width가 180px로 고정이기 때문에, 포커스되어도 절대 커지지 않음!! */
}

/* ------- 표 박스 ------- */
.table-box {
    width: 100%;
    height: 500px;                 /* 원하는 고정 크기 */
    padding: 0;
    margin: 0;
    border: 1px solid #e3e5e8;     /* 연한 회색 테두리 */
    border-radius: 8px;            /* 둥근 모서리 */
    background: #fff;
    overflow: auto;             
    box-sizing: border-box;
/* → 이 상태에서 내부 AgGridVue가 100% 채움 */
}

/* 스타일 커스터마이징 */
.ag-custom .ag-header-row {
    background-color: #f8f9fa !important;
    border-color: #c8c8c8 !important;
}
.ag-custom .ag-row-hover {
    background-color: #eeeeee !important;
}
.ag-custom .ag-row-selected {
    background-color: #dddddd !important;
}
.ag-custom .ag-root-wrapper, .ag-custom .ag-cell, .ag-custom .ag-header-cell {
    border-color: #c8c8c8 !important;
}
</style>