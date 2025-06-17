<!-- 전자결재 > 문서함 > 수신함 -->

<template>
    <!-- 1. 상단: 페이지 제목 -->
    <h1 class="page-title">수신함</h1>
    <!-- 2. 탭 -->
    <div class="tabs">
        <span :class="{active: tab==='읽지않음'}" @click="tab='읽지않음'">읽지않음</span>
        <span :class="{active: tab==='읽음'}" @click="tab='읽음'">읽음</span>
    </div>

    <!-- 3. 메인 컨텐츠 박스 (검색 + 테이블) -->
    <div class="main-box">
        <!-- 3-1. 검색 영역 -->
        <div class="search-row">
            <div class="search-item">
                <label>기안상신일</label>
                <input type="date" v-model="search.Date" />
            </div>
        <div class="search-item">
            <label>기안 제목</label>
            <input type="text" v-model="search.title" placeholder="기안 제목 입력" />
        </div>
    </div>
        <!-- 3-2. 목록 테이블 영역 -->
        <div class="table-box">
        <AgGridVue
            class="ag-theme-alpine custom-theme ag-custom"
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
import { ref, computed, watch, onMounted } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useRouter } from 'vue-router'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const tab = ref('읽지않음')
const search = ref({ date: '', title: '' })

const docs = ref([])
const router = useRouter()


const fetchDocs = async () => {
  try {
    const token = localStorage.getItem('token')

    const params = new URLSearchParams({
      status: tab.value,
      title: search.value.title || '',
      date: search.value.date || ''
    })

    const res = await fetch(`http://localhost:8000/drafts/query/receiver?${params.toString()}`, {
       method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,  // ✅ 핵심
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) throw new Error('문서 목록 조회 실패')

    const data = await res.json()
    docs.value = data
  } catch (err) {
    console.error(err)
  }
}


// 탭이 바뀔 때마다 다시 조회
watch([tab, () => search.value.title, () => search.value.date], fetchDocs)

onMounted(() => {
  fetchDocs()
})


    const columnDefsByTab = {
    '읽음': [
        { headerName: '번호', field: 'no', width: 100 },
        { headerName: '구분', field: 'role', width: 150 },
        { headerName: '제목', field: 'title', flex: 1 },
        { headerName: '상신일시', field: 'createdAt',valueFormatter: params => formatDateTime(params.value), width: 230 },
        { headerName: '열람일시', field: 'readAt',valueFormatter: params => formatDateTime(params.value), width: 230 },
        { headerName: '기안자', field: 'writerName', width: 150 }
    ],
    '읽지않음': [
        { headerName: '번호', field: 'no', flex: 1 },
        { headerName: '구분', field: 'role', flex: 1 },
        { headerName: '제목', field: 'title', flex: 3 },
        { headerName: '상신일시', field: 'createdAt',valueFormatter: params => formatDateTime(params.value), flex: 1 },
        { headerName: '열람일시', field: 'readAt',valueFormatter: params => formatDateTime(params.value), flex: 1 },
        { headerName: '기안자', field: 'writerName', flex: 1 }
    ]}

const currentColumnDefs = computed(() => columnDefsByTab[tab.value])

const filteredForms = computed(() => {
  const enriched = docs.value.map(doc => ({
    ...doc,
    status: doc.readAt ? '읽음' : '읽지않음'
  }))

  const filtered = enriched.filter(doc => {
    if (tab.value && doc.status !== tab.value) return false
    if (search.value.title && !doc.title.includes(search.value.title)) return false
    if (search.value.date) {
      const docDate = doc.createdAt?.substring(0, 10)
      if (docDate !== search.value.date) return false
    }
    return true
  })

  return filtered.map((doc, idx) => ({ ...doc, no: filtered.length - idx }))
})

// function handleFormRowClick(params) {
//     const row = docs.value.find(d => d.no === params.data.no)
//     if (row && !row.readAt) {
//         row.readAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
//         row.status = '읽음'
//     }
// }


// 6) 행 클릭 핸들러
function handleFormRowClick(params) {
  const doc = params.data
  const token = localStorage.getItem('token')

  if (!doc.readAt) {
    fetch(`http://localhost:8000/drafts/query/reference/${doc.docId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('읽음 처리 실패')
          const contentType = res.headers.get('Content-Type') || ''
            if (res.status === 204 || !contentType.includes('application/json')) {
                return null // 응답 본문 없음
            }

            return res.json()
      })
      .then(() => {
        doc.readAt = new Date().toISOString()
        doc.status = '읽음'
        router.push({ name: 'DraftDetail', params: { docId: doc.docId }, query: { box: 'MyDraft' } })
      })
      .catch(console.error)
  } else {
    router.push({ name: 'DraftDetail', params: { docId: doc.docId }, query: { box: 'MyDraft' } })
  }

}

const formatDateTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
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