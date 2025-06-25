<!-- 전자결재 > 문서함 > 기안함 -->
 
<template>
  <h1 class="page-title">기안함</h1>
  <div class="tab-wrapper">
    <div class="tabs">
      <span :class="{active: tab==='전체'}" @click="tab='전체'">전체</span>
      <span :class="{active: tab==='상신'}" @click="tab='상신'">상신</span>
      <span :class="{active: tab==='완료'}" @click="tab='완료'">완료</span>
      <span :class="{active: tab==='반려'}" @click="tab='반려'">반려</span>
      <span :class="{active: tab==='회수'}" @click="tab='회수'">회수</span>
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
        :gridOptions="{ theme: 'legacy' , rowSelection: 'single' }"
        :columnDefs="currentColumnDefs"
        :rowData="filteredForms"
        :pagination="true"
        :paginationPageSize="10"
        :paginationPageSizeSelector="[10, 20, 50, 100]"
        rowSelection="single"  
        @row-click="handleFormRowClick"
        style="width: 100%; height: 100%;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import axios from 'axios'
import AgGridVue from '@/components/grid/BaseGrid.vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // ✅ 먼저 import

ModuleRegistry.registerModules([AllCommunityModule])

// 1) 상태
const tab    = ref('상신')
const search = reactive({startDate: '', endDate: '',  title: ''})
const docs   = ref([])
const route = useRoute()
const router = useRouter()
const userStore = useUserStore() 


// 2) 컬럼 정의 (결재함이랑 동일)
const columnDefsByTab = {
  '전체': [ 
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    { headerName:"상신일시", field:"date", width:230, sort: 'desc' },
    { headerName:"문서상태", field:"docStatus", width:150 },
  ],
  '상신': [ 
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    { headerName:"상신일시", field:"date", width:230, sort: 'desc' },
    { headerName:"현재 결재자", field:"approver", width:150 },
  ],
  '완료': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    { headerName:"완료일시", field:"completeDate", width:230, sort: 'desc' },
  ],
  '반려': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    // 반려일시 추가
  ],
  '회수': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    // 회수일시 추가
  ]
}
const currentColumnDefs = computed(() => columnDefsByTab[tab.value])
const statusMap = {
  전체: ['심사중', '대기중', '결재완료', '반려', '회수'],
  상신: ['심사중', '대기중'],
  완료: ['결재완료'],
  반려: ['반려'],
  회수: ['회수']
}

// 3) 필터 & 번호붙이기

const filteredForms = computed(() => {
  const currentTab = tab.value
  const expectedStatuses = statusMap[currentTab]

  // ✅ 필터링
  const filtered = docs.value.filter(doc => {
    if (!doc || !doc.docStatus) return false

    if (!expectedStatuses.includes(doc.docStatus)) return false

    // 조회기간 필터링
    if (search.startDate || search.endDate) {
    const submitted = doc.submittedAt?.slice(0, 10) // yyyy-MM-dd
    if (!submitted) return false

    if (search.startDate && submitted < search.startDate) return false
    if (search.endDate && submitted > search.endDate) return false
  }
    return true
  })
  // ✅ 정렬: 완료탭은 approvedAt, 나머지는 submittedAt 기준
  const sorted = filtered.sort((a, b) => {
    const dateA = new Date(currentTab === '완료' ? a.approvedAt : a.submittedAt)
    const dateB = new Date(currentTab === '완료' ? b.approvedAt : b.submittedAt)
    return dateB - dateA // 최신순 정렬
  })
  // ✅ 정렬된 후 번호 부여
  return sorted.map((doc, idx) => ({
    ...doc,
    no: idx + 1,  // 최신순 1번부터
    approver: formatApprover(doc.approverName, doc.approverRank)
  }))
})

// 4) API 호출
function formatApprover(name, rank) {
  return name && rank ? `${name} / ${rank}` : '-'
}

function formatDate(datetime) {
  return datetime ? datetime.replace('T', ' ').slice(0, 16) : '-'
}

async function fetchMyDrafts() {
  try {
    const res = await axios.get('http://localhost:5000/approvals/draftDoc', {
    headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })

    // 🔽 여기에 콘솔 출력 추가
    console.log('📦 서버에서 받아온 기안문 목록:', res.data)

    docs.value = res.data.map(d => ({
      docId: d.docId,
      title: d.title,
      type: d.type,
      docStatus: d.docStatus, // ✅ 이걸로 수정
      approver: formatApprover(d.approverName, d.approverRank), // '현재 결재자' 컬럼에 표시될 데이터
      date: formatDate(d.submittedAt || d.createdAt),
      completeDate: formatDate(d.approvedAt),
      createdAt: d.createdAt,
      lineStatus: d.lineStatus,
      drafter: d.drafter,
      approverName: d.approverName,
      approverRank: d.approverRank
    }))
  } catch (e) {
    console.error('기안함 불러오기 실패', e)
  }
}


// 5) 라이프사이클
onMounted(() => {
 const queryTab = route.query.tab
  if (['상신', '완료', '반려', '회수', '전체'].includes(queryTab)) {
   tab.value = queryTab
 }
  fetchMyDrafts()
})


// 6) 행 클릭 핸들러
function handleFormRowClick(params) {
  console.log('선택된 행:', params.data)
  const docId = params.data.docId
  // /drafts/8 같은 경로로 이동
  router.push({
    name: 'DraftDetail',
    params: {docId},
    query: { box: 'MyDraft' }
  })
}
</script>

<style>
/* 공통 입력 요소 테두리 둥글게 */
input[type="month"],
.search-bar input,
.filters select {
  border-radius: 8px !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

/* 월 선택 input 스타일 */
input[type="month"] {
  height: 20px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  background-color: transparent !important;
  box-shadow: none !important;
    background: #fff;


}

/* 기간 선택 inpust 그룹 정렬 */
.period .inputs {
  display: flex;
  align-items: center;
  gap: 13px;
  background: #fff;

}

/* 기간 섹션 배치 스타일 */
.period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  background: transparent;

}

/* 흰색 메인 컨텐츠 박스 */
.main-box {
  background-color: var(--bg-box);
  border-radius: 0px 12px 12px 12px;
  box-shadow: 1px 1px 20px 1px rgba(0,0,0,0.05);
  width: 100%;
  height: 700px;
  min-width: 0;
  max-width: 100%;
  margin: 0 20px 30px; 
  padding: 20px 40px 32px 40px;
  box-sizing: border-box;
}

/* 페이지 타이틀 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
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
  margin: 50px 24px 0px 24px;
}

.tabs span {
  font-size: 18px;
  padding: 10px 30px;
  border: none;
  border-bottom: none;
  background-color: #C8C8C8;
  color: white;
  text-decoration: none; /* ✅ 밑줄 제거 */
  cursor: pointer;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  z-index: 1;
  margin-right: -20px; /* ✅ 가로 겹치기 */
  transition: all 0.2s ease;
}

.tabs .active {
  background-color: #fff;
  color: #000;
  z-index: 3;
  background: var(--bg-box);
  border-bottom: none;
}

.tabs span:focus,
.tabs span:active {
  outline: none;             /* 포커스 테두리 제거 */
  text-decoration: none;     /* 포커스 시 밑줄 제거 */
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
  display: flex;                /* label, input을 한 줄에 배치 */
  background-color: transparent;
  flex-direction: row;          /* 가로 정렬(한 줄) */
  align-items: center;          /* 세로 중앙 정렬 */
  gap: 5px;                     /* label과 input 사이 간격 */
  min-width: 150px;             /* 최소 너비(인풋이 깨지지 않게) */
}

.search-item label {
  font-size: 16.5px;            /* label 폰트 크기 (1.04rem 기준) */
  color: #000000;               /* label 텍스트 색상 */
  margin-bottom: 2px;           /* (행 아닌 열 정렬일 땐 의미 없음, row일 땐 영향 없음) */
  letter-spacing: -0.5px;       /* 자간 조정 */
}

.search-item input[type="date"],
.search-item input[type="text"] {
  padding: 8px 12px;            /* 인풋 내부 여백 */
  border: 1.2px solid #e1e7ee;  /* 연한 회색 테두리 */
  border-radius: 8px;           /* 둥근 테두리 */
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