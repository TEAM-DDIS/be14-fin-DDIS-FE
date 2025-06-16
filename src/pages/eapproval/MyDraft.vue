<!-- 전자결재 > 문서함 > 기안함 -->
 
<template>
  <h1 class="page-title">기안함</h1>
  <div class="tabs">
    <span :class="{active: tab==='상신'}" @click="tab='상신'">상신</span>
    <span :class="{active: tab==='완료'}" @click="tab='완료'">완료</span>
    <span :class="{active: tab==='반려'}" @click="tab='반려'">반려</span>
    <span :class="{active: tab==='회수'}" @click="tab='회수'">회수</span>
  </div>

  <div class="main-box">
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

    <div class="table-box">
      <AgGridVue
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="currentColumnDefs"
        :rowData="filteredForms"
        :pagination="true"
        rowSelection="single"
        @rowClicked="onRowClick"
        style="width:100%; height:100%;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
ModuleRegistry.registerModules([AllCommunityModule])

// 1) 상태
const tab    = ref('상신')
const search = ref({ date: '', title: '' })
const docs   = ref([])
const route = useRoute()
const router = useRouter()
// 2) 컬럼 정의 (결재함이랑 동일)
const columnDefsByTab = {
  '상신': [ 
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    { headerName:"상신일시", field:"date", width:230 },
    { headerName:"결재대기자", field:"approver", width:150 },
  ],
  '완료': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
    { headerName:"완료일시", field:"completeDate", width:230 },
  ],
  '반려': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
  ],
  '회수': [
    { headerName:"번호", field:"no", width:100 },
    { headerName:"구분", field:"type", width:150 },
    { headerName:"제목", field:"title", flex:1 },
  ]
}
const currentColumnDefs = computed(() => columnDefsByTab[tab.value])
const statusMap = {
  상신: ['대기중','심사중'],
  완료: ['완료'],
  반려: ['반려'],
  회수: ['회수']
}

// 3) 필터 & 번호붙이기
const filteredForms = computed(() => {
  const expectedStatuses = statusMap[tab.value]     // 예: '상신' → '대기중'
  const filtered = docs.value.filter(doc => {
    // 1) 탭 필터
    if (!expectedStatuses .includes(doc.status)) return false

    // 2) 제목 검색
    if (search.value.title && !doc.title.includes(search.value.title)) return false

    // 3) 날짜 검색 (YYYY-MM-DD)
    if (search.value.date) {
      const day = (doc.date || doc.createdAt).slice(0, 10)
      if (day !== search.value.date) return false
    }

    return true
  })

  // 3) 번호 붙이기 (최신순)
  return filtered.map((doc, i) => ({
    ...doc,
    no: filtered.length - i
  }))
})

// 4) API 호출
async function fetchMyDrafts() {
  try {
    const res = await axios.get('http://localhost:8000/drafts/query', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    // 백이 주는 DocumentDTO 필드에 맞춰 맵핑
    docs.value = res.data.map(d => ({
      docId: d.docId,
      title: d.docTitle,
      type: d.type,
      status: d.status,

      // Ag-Grid 상신 탭에 필요한 필드
      date:        d.submittedAt || d.createdAt, // columnDefs 상신에서 field:"date"
      approver:    d.approver,                             // 다음 결재대기자 정보를 알고 있으면 넣고, 아니면 빈 문자열

      // 완료 탭
      completeDate: d.approvedAt || '',            // field:"completeDate"
      createdAt: d.createdAt
    }))
  } catch (e) {
    console.error('기안함 불러오기 실패', e)
  }
}

// 5) 라이프사이클
onMounted(() => {
 const queryTab = route.query.tab
 if (['상신', '완료', '반려', '회수'].includes(queryTab)) {
   tab.value = queryTab
 }

  fetchMyDrafts()
})


// 6) 행 클릭 핸들러
function onRowClick(e) {
   console.log('선택된 행:', e.data)
  const docId = e.data.docId
  // /drafts/8 같은 경로로 이동
  router.push({ name: 'DraftDetail', params: { docId } })
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
  border-bottom: 3px solid #1f2937;  /* 클릭시 검은색 강조 */
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