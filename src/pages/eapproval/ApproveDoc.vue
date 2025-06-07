<!-- 전자결재  > 문서함 > 결재함 -->

<template>
    <!-- 1. 상단: 페이지 제목 -->
    <h1 class="page-title">결재함</h1>

    <!-- 2. 탭 -->
    <div class="tabs">
        <span :class="{active: tab==='결재'}" @click="tab='결재'">결재</span>
        <span :class="{active: tab==='진행'}" @click="tab='진행'">진행</span>
        <span :class="{active: tab==='완료'}" @click="tab='완료'">완료</span>
    </div>

    <!-- 3. 메인 컨텐츠 박스 (검색 + 테이블) -->
    <div class="main-box">

        <!-- 3-1. 검색 영역 -->
        <div class="search-row">
            <!-- 검색: 상신일 -->
            <div class="search-item">
                <label>기안상신일</label>
                <input type="date" v-model="search.Date" />
            </div>
            <!-- 검색: 제목 -->
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

// Composition API import 및 ag-grid 관련 모듈 등록

import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])


// 상태 변수 및 검색 조건 등

const tab = ref('결재');   // 현재 선택된 탭 (결재)
const search = ref({
    date: '',
    title: '',
});


// 문서 데이터 (실제 서비스에서는 API로 대체)

const docs = ref([
  // 결재
    { no: 1, type: '휴가신청서', title: '[휴가신청서] 이도현 - 보고', date: '2025-05-26 10:40', writer: '이도현', status: '결재' },
    { no: 2, type: '지출품의서', title: '[지출품의서] 김유정 - 회식비', date: '2025-05-25 14:25', writer: '김유정', status: '결재' },
    { no: 3, type: '사업기안', title: '[사업기안] 박정우 - 출장계획', date: '2025-05-24 09:30', writer: '박정우', status: '결재' },
    { no: 4, type: '휴가신청서', title: '[휴가신청서] 최수연 - 연차', date: '2025-05-23 15:40', writer: '최수연', status: '결재' },
    { no: 5, type: '사업기안', title: '[사업기안] 이지원 - 제안서', date: '2025-05-22 08:10', writer: '이지원', status: '결재' },
    { no: 6, type: '지출품의서', title: '[지출품의서] 윤아름 - 광고비', date: '2025-05-21 11:45', writer: '윤아름', status: '결재' },
    { no: 7, type: '휴가신청서', title: '[휴가신청서] 박지훈 - 반차', date: '2025-05-20 17:10', writer: '박지훈', status: '결재' },
    { no: 8, type: '사업기안', title: '[사업기안] 서민재 - 교육참석', date: '2025-05-19 12:20', writer: '서민재', status: '결재' },
    { no: 9, type: '지출품의서', title: '[지출품의서] 정예린 - 장비구입', date: '2025-05-18 09:50', writer: '정예린', status: '결재' },
    { no: 10, type: '휴가신청서', title: '[휴가신청서] 김태훈 - 병가', date: '2025-05-17 13:00', writer: '김태훈', status: '결재' },
    // 진행
    { no: 1, type: '사업기안', title: '[사업기안] 한지민 - 회의계획', date: '2025-05-26 09:10', writer: '한지민', status: '진행' },
    { no: 2, type: '지출품의서', title: '[지출품의서] 송강 - 출장비', date: '2025-05-25 10:30', writer: '송강', status: '진행' },
    { no: 3, type: '휴가신청서', title: '[휴가신청서] 김세정 - 반차', date: '2025-05-24 16:20', writer: '김세정', status: '진행' },
    { no: 4, type: '사업기안', title: '[사업기안] 배수지 - 시연발표', date: '2025-05-23 11:15', writer: '배수지', status: '진행' },
    { no: 5, type: '지출품의서', title: '[지출품의서] 정해인 - 간식비', date: '2025-05-22 14:50', writer: '정해인', status: '진행' },
    { no: 6, type: '휴가신청서', title: '[휴가신청서] 문가영 - 조퇴', date: '2025-05-21 17:25', writer: '문가영', status: '진행' },
    { no: 7, type: '사업기안', title: '[사업기안] 노정의 - 계약추진', date: '2025-05-20 13:10', writer: '노정의', status: '진행' },
    { no: 8, type: '지출품의서', title: '[지출품의서] 이도겸 - 회의비', date: '2025-05-19 15:40', writer: '이도겸', status: '진행' },
    { no: 9, type: '휴가신청서', title: '[휴가신청서] 윤두준 - 휴가계획', date: '2025-05-18 11:00', writer: '윤두준', status: '진행' },
    { no: 10, type: '사업기안', title: '[사업기안] 이정은 - 홍보자료', date: '2025-05-17 09:20', writer: '이정은', status: '진행' },
    // 완료
    { no: 1, type: '지출품의서', title: '[지출품의서] 김민재 - 비용정산', date: '2025-05-26 15:10', writer: '김민재', status: '완료' },
    { no: 2, type: '휴가신청서', title: '[휴가신청서] 정유진 - 연차신청', date: '2025-05-25 12:20', writer: '정유진', status: '완료' },
    { no: 3, type: '사업기안', title: '[사업기안] 황민현 - 프로젝트요청', date: '2025-05-24 13:15', writer: '황민현', status: '완료' },
    { no: 4, type: '휴가신청서', title: '[휴가신청서] 박하늘 - 병가요청', date: '2025-05-23 10:05', writer: '박하늘', status: '완료' },
    { no: 5, type: '지출품의서', title: '[지출품의서] 유승호 - 구매품의', date: '2025-05-22 16:40', writer: '유승호', status: '완료' },
    { no: 6, type: '사업기안', title: '[사업기안] 김소현 - 회의안건', date: '2025-05-21 09:45', writer: '김소현', status: '완료' },
    { no: 7, type: '휴가신청서', title: '[휴가신청서] 강하늘 - 조퇴요청', date: '2025-05-20 14:30', writer: '강하늘', status: '완료' },
    { no: 8, type: '지출품의서', title: '[지출품의서] 서강준 - 접대비', date: '2025-05-19 17:15', writer: '서강준', status: '완료' },
    { no: 9, type: '사업기안', title: '[사업기안] 김고은 - 프로젝트제안', date: '2025-05-18 08:55', writer: '김고은', status: '완료' },
    { no: 10, type: '휴가신청서', title: '[휴가신청서] 전지현 - 휴가신청', date: '2025-05-17 11:50', writer: '전지현', status: '완료' }
])
  // 샘플 데이터: 실제론 API로 불러옴


// 탭별 컬럼(ag-grid 테이블 헤더) 정의
const columnDefsByTab = {
    '결재': [
        { headerName: "번호", field: "no", width: 100 },
        { headerName: "구분", field: "type", width: 150 },
        { headerName: "제목", field: "title", flex: 1 },
        { headerName: "상신일시", field: "date", width: 230 },
        { headerName: "결재상태", field: "status", width: 230 },
        { headerName: "기안자", field: "writer", width: 150 },
    ],
    '진행': [
        { headerName: "번호", field: "no", width: 100 },
        { headerName: "구분", field: "type", width: 150 },
        { headerName: "제목", field: "title", flex: 1 },
        { headerName: "상신일시", field: "date", width: 230 },
        { headerName: "결재상태", field: "status", width: 230 },
        { headerName: "기안자", field: "writer", width: 150 },
    ],
    '완료': [
        { headerName: "번호", field: "no", width: 100 },
        { headerName: "구분", field: "type", width: 150 },
        { headerName: "제목", field: "title", flex: 1 },
        { headerName: "상신일시", field: "date", width: 230 },
        { headerName: "결재완료일시", field: "date", width: 230 },
        { headerName: "기안자", field: "writer", width: 150 },
    ],
};


// 현재 탭에 맞는 컬럼 반환 (computed)
const currentColumnDefs = computed(() => columnDefsByTab[tab.value]);


// 탭/검색 조건에 맞는 데이터만 추출해 테이블에 표시
const filteredForms = computed(() => {
    const filtered = docs.value.filter(doc => {
        if (tab.value && doc.status !== tab.value) return false;

        if (search.value.title && !doc.title.includes(search.value.title)) return false;

        // 검색 조건: 날짜(Date)가 정확히 일치하는 경우만 필터링 (하루 단위)
        if (search.value.Date) {
        const docDate = doc.date?.substring(0, 10);  // 'YYYY-MM-DD'
        if (docDate !== search.value.Date) return false;
        }
        return true;
    });
  // 번호 필드 재생성
    return filtered.map((doc, idx) => ({
        ...doc,
        no: filtered.length - idx, // 최신순: 1,2,3...
    }));
});

function handleFormRowClick(params) {
  // params.data에 선택된 행 데이터가 담김
    console.log('선택된 행:', params.data);
}
// 검색 버튼 클릭
// (실제 API 연동시 이 함수에서 서버에 요청)

function onSearch() {
  // API 연동 등 실제 로직 위치
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