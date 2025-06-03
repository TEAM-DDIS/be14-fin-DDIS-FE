<template>
  <!-- 1. 상단: 페이지 제목 -->
  <h1 class="page-title">기안함</h1>

    <!-- 2. 탭 (상신/완료/반려/회수) -->
    <div class="tabs">
      <span :class="{active: tab==='상신'}" @click="tab='상신'">상신</span>
      <span :class="{active: tab==='완료'}" @click="tab='완료'">완료</span>
      <span :class="{active: tab==='반려'}" @click="tab='반려'">반려</span>
      <span :class="{active: tab==='회수'}" @click="tab='회수'">회수</span>
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
/**
 * 1. Composition API import 및 ag-grid 관련 모듈 등록
 */
import { ref, computed } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
ModuleRegistry.registerModules([AllCommunityModule])

/**
 * 2. 상태 변수 및 검색 조건 등
 */
const tab = ref('상신');   // 현재 선택된 탭 (상신/완료/반려/회수)
const search = ref({
  date: '',
  title: '',
});

/**
 * 3. 문서 데이터 (실제 서비스에서는 API로 대체)
 */
const docs = ref([
  // 샘플 데이터: 실제론 API로 불러옴
  {
    id: 4, no: 4, type: '휴가신청서', title: '[휴가신청서] 주아현_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '회수', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '2025-05-26 10:40', withdrawer: ''
  },
  {
    id: 3, no: 3, type: '휴가신청서', title: '[휴가신청서] 이성준_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '상신', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 3, no: 3, type: '휴가신청서', title: '[휴가신청서] 고도연_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '상신', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 3, no: 3, type: '휴가신청서', title: '[휴가신청서] 한윤상_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '상신', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 3, no: 3, type: '휴가신청서', title: '[휴가신청서] 강이도은_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '상신', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 3, no: 3, type: '휴가신청서', title: '[휴가신청서] 김기종_연차_05/22~05/23_(2일)', date: '2025-05-26 10:40', approver: '김병범', status: '상신', completeDate: '', finalApprover: '', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 2, no: 2, type: '사업기안', title: '[사업기안] DISS 전력팀 워룸 TF팀 구성 운영 계획', date: '2025-05-26 10:40', approver: '김병범', status: '완료', completeDate: '2025-05-28 11:30', finalApprover: '최완결', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 2, no: 2, type: '사업기안', title: '[사업기안] DISS 전력팀 워룸 TF팀 구성 운영 계획', date: '2025-05-26 10:40', approver: '김병범', status: '완료', completeDate: '2025-05-28 11:30', finalApprover: '최완결', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 2, no: 2, type: '사업기안', title: '[사업기안] DISS 전력팀 워룸 TF팀 구성 운영 계획', date: '2025-05-26 10:40', approver: '김병범', status: '완료', completeDate: '2025-05-28 11:30', finalApprover: '최완결', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 2, no: 2, type: '사업기안', title: '[사업기안] DISS 전력팀 워룸 TF팀 구성 운영 계획', date: '2025-05-26 10:40', approver: '김병범', status: '완료', completeDate: '2025-05-28 11:30', finalApprover: '최완결', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 2, no: 2, type: '사업기안', title: '[사업기안] DISS 전력팀 워룸 TF팀 구성 운영 계획', date: '2025-05-26 10:40', approver: '김병범', status: '완료', completeDate: '2025-05-28 11:30', finalApprover: '최완결', rejectDate: '', rejector: '', rejectReason: '', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  },
  {
    id: 1, no: 1, type: '지출품의서', title: '[지출품의서] 개발 1팀 사무용품 구매비 지출', date: '2025-05-26 10:40', approver: '김병범', status: '반려', completeDate: '', finalApprover: '', rejectDate: '2025-05-29 09:00', rejector: '박반려', rejectReason: '증빙 부족', withdrawDate: '', withdrawer: ''
  }
]);

/**
 * 4. 탭별 컬럼(ag-grid 테이블 헤더) 정의
 */
const columnDefsByTab = {
  '상신': [
    { headerName: "번호", field: "no", width: 100 },
    { headerName: "구분", field: "type", width: 150 },
    { headerName: "제목", field: "title", flex: 1 },
    { headerName: "상신일시", field: "date", width: 230 },
    { headerName: "결재대기자", field: "approver", width: 150 },
  ],
  '완료': [
    { headerName: "번호", field: "no", width: 100 },
    { headerName: "구분", field: "type", width: 150 },
    { headerName: "제목", field: "title", flex: 1 },
    { headerName: "완료일시", field: "completeDate", width: 230 },
  ],
  '반려': [
    { headerName: "번호", field: "no", width: 100 },
    { headerName: "구분", field: "type", width: 150 },
    { headerName: "제목", field: "title", flex: 1 },
    { headerName: "반려일시", field: "rejectDate", width: 230 },
    { headerName: "반려자", field: "rejector", width: 150 },
    { headerName: "반려사유", field: "rejectReason", width: 230 },
  ],
  '회수': [
    { headerName: "번호", field: "no", width: 100 },
    { headerName: "구분", field: "type", width: 150 },
    { headerName: "제목", field: "title", flex: 1 },
    { headerName: "회수일시", field: "withdrawDate", width: 230 },
  ],
};

/**
 * 5. 현재 탭에 맞는 컬럼 반환 (computed)
 */
const currentColumnDefs = computed(() => columnDefsByTab[tab.value]);

/**
 * 6. 탭/검색 조건에 맞는 데이터만 추출해 테이블에 표시
 *    - 최신순 번호(내림차순) 재정렬
 */
const filteredForms = computed(() => {
  const filtered = docs.value.filter(doc => {
    // 현재 탭(상신/완료/반려/회수)에 해당하는 문서만 필터링
    if (tab.value && doc.status !== tab.value) return false;

    // 검색 조건: 제목에 입력한 문자열이 포함된 경우만 필터링
    if (search.value.title && !doc.title.includes(search.value.title)) return false;

    // 검색 조건: 날짜(Date)가 정확히 일치하는 경우만 필터링 (하루 단위)
    if (search.value.Date) {
      const docDate = doc.date?.substring(0, 10);  // 'YYYY-MM-DD'
      if (docDate !== search.value.Date) return false;
    }

    // 모든 조건을 통과한 문서만 결과에 포함
    return true;
  });
  // 2) 번호 필드 재생성
  return filtered.map((doc, idx) => ({
    ...doc,
    no: filtered.length - idx, // 최신순: 1,2,3...
  }));
});

/**
 * 7. 행 클릭시 이벤트
 */
function handleFormRowClick(params) {
  // params.data에 선택된 행 데이터가 담김
  console.log('선택된 행:', params.data);
}

/**
 * 8. 검색 버튼 클릭
 *    (실제 API 연동시 이 함수에서 서버에 요청)
 */
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
  margin-left: 36px;
  margin-bottom: 44px;
  color: #00a8e8;
  font-size: 2.1rem;
  font-weight: bold;
}

/* 탭 영역 */
.tabs {
  display: flex;
  gap: 36px;           /* 탭 사이 간격 */
  font-size: 20px;
  font-weight: 500;
  margin-left: 4px;
  margin-top: 2px;
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