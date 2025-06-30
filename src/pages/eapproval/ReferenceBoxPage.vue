<!-- 전자결재 > 문서함 > 참조함 -->

<template>
    <!-- 1. 상단: 페이지 제목 -->
    <h1 class="page-title">참조함</h1>
    <div class="reference-page">

    <!-- 2. 탭 -->
    <div class="tab-wrapper">
      <div class="tabs">
          <span :class="{active: tab==='읽지않음'}" @click="tab='읽지않음'">읽지않음</span>
          <span :class="{active: tab==='읽음'}" @click="tab='읽음'">읽음</span>
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
                rowSelection="single"
                @row-click="handleFormRowClick"
                :overlayNoRowsTemplate="'<span class=\'ag-empty\'>데이터가 없습니다.</span>'"
                style="width:100%; height:100%;"
            />
        </div>
    </div> 
  </div>   
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive } from 'vue'
import AgGridVue from '@/components/grid/BaseGrid.vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const tab = ref('읽지않음')
const search = reactive({startDate: '', endDate: '',  title: ''})
const docs = ref([])
const router = useRouter()
const userStore = useUserStore() 


const fetchDocs = async () => {
  try {
    const params = new URLSearchParams({
      status: tab.value,
      title: search.title || '',
    })

    const res = await fetch(`https://api.isddishr.site/drafts/query/reference?${params.toString()}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
    })

    if (!res.ok) throw new Error('문서 목록 조회 실패')

    const data = await res.json()
    docs.value = data
  } catch (err) {
    console.error(err)
  }
}


// 탭이 바뀔 때마다 다시 조회
watch(
  [tab, () => search.title, () => search.startDate, () => search.endDate],
  fetchDocs
)
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
        { headerName: '기안자', valueGetter: params => {
            const name = params.data.writerName || '';
            const rank = params.data.rankName || '';
            return rank ? `${name} / ${rank}` : name;
        }, width: 150 }
    ],
    '읽지않음': [
        { headerName: '번호', field: 'no',  width: 100 },
        { headerName: '구분', field: 'role', width: 150 },
        { headerName: '제목', field: 'title', flex: 1 },
        { headerName: '상신일시', field: 'createdAt', valueFormatter: params => formatDateTime(params.value),width: 230 },
        { headerName: '열람일시', field: 'readAt', valueFormatter: params => formatDateTime(params.value),width: 230 },
        { headerName: '기안자', valueGetter: params => {
            const name = params.data.writerName || '';
            const rank = params.data.rankName || '';
            return rank ? `${name} / ${rank}` : name;
        }, width: 150 }
    ]}

const currentColumnDefs = computed(() => columnDefsByTab[tab.value])

const filteredForms = computed(() => {
  const enriched = docs.value.map(doc => ({
    ...doc,
    status: doc.readAt ? '읽음' : '읽지않음',
    writerName: doc.drafterName,
    rankName: doc.drafterRank
  }))

    const filtered = enriched.filter(doc => {
    if (tab.value && doc.status !== tab.value) return false
    if (search.title && !doc.title?.includes(search.title)) return false

    if (search.startDate || search.endDate) {
      const docDate = doc.createdAt?.substring(0, 10)
      if (!docDate) return false
      if (search.startDate && docDate < search.startDate) return false
      if (search.endDate && docDate > search.endDate) return false
    }
    return true
  })

  return filtered.map((doc, idx) => ({ ...doc, no: filtered.length - idx }))
})

function handleFormRowClick(params) {
  const doc = params.data
  
  if (!doc.readAt) {
    fetch(`https://api.isddishr.site/drafts/query/reference/${doc.docId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${userStore.accessToken}` }
,
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
        router.push({ name: 'DraftDetail', params: { docId: doc.docId },query: { box: 'ReferenceBox' } })
      })
      .catch(console.error)
  } else {
    router.push({ name: 'DraftDetail', params: { docId: doc.docId },query: { box: 'ReferenceBox' } })
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
.reference-page{
  padding: 20px 20px 20px;
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
  display: flex;               
  flex-direction: row;         
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
  height: 18px;

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