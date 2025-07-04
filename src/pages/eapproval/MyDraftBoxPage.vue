<!-- 전자결재 > 문서함 > 기안함 -->
 
<template>
  <h1 class="page-title">기안함</h1>
  <div class="my-draft-page">
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

    if (search.title && !doc.title.toLowerCase().includes(search.title.toLowerCase())) {
    return false
  }

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
    const res = await axios.get('https://api.isddishr.site/approvals/draftDoc', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    // 🔽 여기에 콘솔 출력 추가
    // console.log('📦 서버에서 받아온 기안문 목록:', res.data)

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
  // console.log('선택된 행:', params.data)
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
.my-draft-page{
  padding: 20px 20px 20px;
}

/* 공통 입력 요소 테두리 둥글게 */
input[type="month"],
.search-bar input,
.filters select {
  border-radius: 8px !important;
  background-color: var(--modal-box-bg);
  color: var(--text-main);
  font-family: 'inter';
  box-shadow: none !important;
  border: 2px solid #ddd;

}

/* 월 선택 input 스타일 */
input[type="month"] {
  height: 20px;
  padding: 6px 8px;
  border: 1px solid #ddd;
  background-color: var(--modal-box-bg);
  color: var(--text-main);
  font-family: 'inter';
  box-shadow: none !important;

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
  color: var(--primary);
}

/* 🔷 겹쳐지는 탭 스타일 */
.tab-wrapper {
    position: relative;
    z-index: 1;
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
  text-decoration: none;
  cursor: pointer;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  position: relative;
  z-index: 1;
  margin-right: -10px;
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
  align-items: center;          /* 세로 중앙 정렬 */
  gap: 5px;                     /* label과 input 사이 간격 */
  min-width: 150px;             /* 최소 너비(인풋이 깨지지 않게) */
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
  height: 18px;
}

/* ------- 표 박스 ------- */
.table-box {
  width: 100%;
  height: 500px;                 /* 원하는 고정 크기 */
  padding: 0;
  margin: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;            /* 둥근 모서리 */
  overflow: auto;             
  box-sizing: border-box;
}

</style>