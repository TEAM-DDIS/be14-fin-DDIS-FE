<template>
  <div class="performance-page">
    <h1 class="page-title">전체 성과 이력</h1>

    <!-- 인사팀인 경우에만 전체/나의 조회 토글 버튼 노출 -->
    <div v-if="isHR" class="toggle-btn-wrapper">
      <button @click="toggleView" class="toggle-btn">
        {{ viewingAll ? '나의 성과 조회' : '전체 성과 조회' }}
      </button>
    </div>

    <div class="ag-grid-wrapper">
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="gridOptions"
        :columnDefs="columnDefs"
        :rowData="rowData"
        style="height: 500px; width: 100%; margin: 0 auto;"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import AgGrid from '@/components/grid/BaseGrid.vue';
import PerformanceContentFilter from '@/components/filters/PerformanceContentFilter.vue';
import YearMonthFilter from '@/components/filters/YearMonthFilter.vue';
import { useUserStore } from '@/stores/user';

// JWT payload & HR 체크
const userStore = useUserStore();
const getPayload = () => {
  try {
    const base64 = userStore.accessToken.split('.')[1];
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
};
const isHR = computed(() => {
  const auth = getPayload().auth;
  return Array.isArray(auth) && auth.includes('ROLE_HR');
});

// 조회 모드 & 데이터 로드
const viewingAll = ref(isHR.value);
const endpoint = computed(() =>
  isHR.value && viewingAll.value
    ? '/review/history/all'
    : '/review/history/employee'
);
const rowData = ref([]);
const loadData = async () => {
  try {
    const res = await fetch(`http://localhost:5000${endpoint.value}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    rowData.value = res.ok ? await res.json() : [];
  } catch {
    rowData.value = [];
  }
};
function toggleView() {
  viewingAll.value = !viewingAll.value;
  loadData();
}

onMounted(loadData);

// 그리드 옵션 & 컬럼 정의
const gridOptions = reactive({
  frameworkComponents: {
    performanceContentFilter: PerformanceContentFilter,
    yearMonthFilter: YearMonthFilter
  },
  defaultColDef: {
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    popupParent: document.body
  }
});

const columnDefs = ref([
  { headerName: '사번', field: 'employeeId', width: 140 },
  { headerName: '이름', field: 'employeeName', width: 140 },
  { headerName: '직급', field: 'rankName', width: 120 },
  { headerName: '부서', field: 'departmentName', width: 140 },
  { headerName: '팀', field: 'teamName', width: 140 },
  {
    headerName: '평가 기간',
    field: 'yearMonth',
    width: 120,
    filter: 'yearMonthFilter',
    filterParams: { options: ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'] }
  },
  {
    headerName: '성과 내용',
    field: 'performanceContent',
    flex: 1,
    filter: 'performanceContentFilter'
  },
  {
    headerName: '성과 수치',
    field: 'performanceValue',
    width: 120,
    filter: 'agNumberColumnFilter',
    filterParams: { debounceMs: 200 }
  },
  {
    headerName: '평가 점수',
    field: 'reviewScore',
    width: 120,
    valueFormatter: ({ value }) => (value != null ? `${value} 점` : '-'),
    filter: 'agNumberColumnFilter'
  }
]);
</script>

<style scoped>
.performance-page { padding: 24px; }
.page-title { margin-bottom: 20px; font-size: 24px; color: #00a8e8; font-weight: bold; }
.toggle-btn-wrapper { text-align: right; margin-bottom: 10px; }
.toggle-btn { font-size: 14px; font-weight: bold; background-color: #00a8e8; color: #fff; border-radius: 10px; padding: 10px 30px; cursor: pointer; }
.toggle-btn:hover { background-color: #fff; color: #00a8e8; border: 1px solid #00a8e8; }
.ag-grid-wrapper { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
</style>
