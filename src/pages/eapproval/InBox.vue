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
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

const tab = ref('읽지않음')
const search = ref({ date: '', title: '' })

const docs = ref([
    { no: 1, type: '지출품의서', title: '[지출품의서] 이수민 - 구매요청', date: '2025-06-01 09:00', writer: '이수민', readAt: '', status: '읽지않음' },
    { no: 2, type: '휴가신청서', title: '[휴가신청서] 김태연 - 연차', date: '2025-05-31 13:20', writer: '김태연', readAt: '', status: '읽지않음' },
    { no: 3, type: '사업기안', title: '[사업기안] 장도윤 - 신규사업 제안', date: '2025-05-30 11:10', writer: '장도윤', readAt: '', status: '읽지않음' },
    { no: 4, type: '지출품의서', title: '[지출품의서] 전지우 - 홍보비', date: '2025-05-29 10:45', writer: '전지우', readAt: '', status: '읽지않음' },
    { no: 5, type: '사업기안', title: '[사업기안] 백서현 - 마케팅 캠페인', date: '2025-05-28 14:00', writer: '백서현', readAt: '', status: '읽지않음' },
    { no: 6, type: '휴가신청서', title: '[휴가신청서] 윤소희 - 병가', date: '2025-05-27 08:30', writer: '윤소희', readAt: '', status: '읽지않음' },
    { no: 7, type: '지출품의서', title: '[지출품의서] 민지현 - 교육비', date: '2025-05-26 10:20', writer: '민지현', readAt: '', status: '읽지않음' },
    { no: 8, type: '사업기안', title: '[사업기안] 김하늘 - 기술제휴', date: '2025-05-25 15:10', writer: '김하늘', readAt: '', status: '읽지않음' },
    { no: 9, type: '휴가신청서', title: '[휴가신청서] 이한결 - 조퇴', date: '2025-05-24 17:15', writer: '이한결', readAt: '', status: '읽지않음' },
    { no: 10, type: '지출품의서', title: '[지출품의서] 정하윤 - 회의비', date: '2025-05-23 12:40', writer: '정하윤', readAt: '', status: '읽지않음' },
    { no: 11, type: '지출품의서', title: '[지출품의서] 최현우 - 운영비', date: '2025-05-22 11:30', writer: '최현우', readAt: '2025-06-04 09:20', status: '읽음' },
    { no: 12, type: '사업기안', title: '[사업기안] 김도영 - 협업제안', date: '2025-05-21 13:45', writer: '김도영', readAt: '2025-06-04 10:15', status: '읽음' },
    { no: 13, type: '휴가신청서', title: '[휴가신청서] 이지수 - 반차', date: '2025-05-20 14:50', writer: '이지수', readAt: '2025-06-04 11:00', status: '읽음' }
])

const columnDefsByTab = {
    '읽음': [
        { headerName: '번호', field: 'no', width: 100 },
        { headerName: '구분', field: 'type', width: 150 },
        { headerName: '제목', field: 'title', flex: 1 },
        { headerName: '상신일시', field: 'date', width: 230 },
        { headerName: '열람일시', field: 'readAt', width: 230 },
        { headerName: '기안자', field: 'writer', width: 150 }
    ],
    '읽지않음': [
        { headerName: '번호', field: 'no', width: 100 },
        { headerName: '구분', field: 'type', width: 150 },
        { headerName: '제목', field: 'title', flex: 1 },
        { headerName: '상신일시', field: 'date', width: 230 },
        { headerName: '열람일시', field: 'readAt', width: 230 },
        { headerName: '기안자', field: 'writer', width: 150 }
    ]
}

const currentColumnDefs = computed(() => columnDefsByTab[tab.value])

const filteredForms = computed(() => {
const filtered = docs.value.filter(doc => {
    if (tab.value && doc.status !== tab.value) return false
    if (search.value.title && !doc.title.includes(search.value.title)) return false
    if (search.value.Date) {
        const docDate = doc.date?.substring(0, 10)
        if (docDate !== search.value.Date) return false
    }
    return true
    })
    return filtered.map((doc, idx) => ({ ...doc, no: filtered.length - idx }))
})

function handleFormRowClick(params) {
    const row = docs.value.find(d => d.no === params.data.no)
    if (row && !row.readAt) {
        row.readAt = new Date().toISOString().slice(0, 16).replace('T', ' ')
        row.status = '읽음'
    }
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