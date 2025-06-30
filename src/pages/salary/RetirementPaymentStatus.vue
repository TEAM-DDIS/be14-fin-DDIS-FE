<!-- 퇴직 > 퇴직금 지급 현황 -->
<template>
  <div class="retirement-page">
    <h1 class="page-title">퇴직금 지급 현황</h1>

    <!-- 조회 필터 -->
    <p class="desc">조회 필터</p>
    <div class="section filters-row justify-between">
      <div class="filters-left" style="display: flex; align-items: center; gap: 20px;">
        <div class="date-type-toggle">
          <label><input type="radio" value="retire" v-model="filterMode" /><strong>퇴직일자</strong></label>
          <label><input type="radio" value="provision" v-model="filterMode" /><strong>지급일자</strong></label>
        </div>
        <div class="inputs">
          <label>기간</label>
          <input type="month" v-model="dateRange.start" />
          <span>~</span>
          <input type="month" v-model="dateRange.end" />
        </div>
      </div>
      <div>
        <button class="search-btn" @click="fetchRetirements">조회</button>
      </div>
    </div>

    <!-- 목록 -->
    <p class="desc">퇴직금 지급 현황 목록</p>
    <div class="section" ref="listSection">
      <div class="filters-row" style="margin-bottom: 12px;">
        <div class="search-bar">
          <img src="@/assets/icons/search.svg" class="search" />
          <input v-model="searchKeyword" placeholder="사번 또는 성명 검색" />
        </div>
        <div class="filters">
          <select v-model="provisionSituation">
            <option value="">지급현황 전체</option>
            <option value="미지급">미지급</option>
            <option value="지급완료">지급완료</option>
            <option value="지연">지연</option>
          </select>
        </div>
      </div>

      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy', rowSelection: 'single' }"
        :columnDefs="columnDefs"
        :rowData="filteredData"
        height="400px"
        :pagination="true"
        :paginationPageSize="20"
        @row-click="onRowClicked"
        @grid-ready="onGridReady"
      />

      <div class="btn-area mt-2 right-align">
        <button class="search-btn" :disabled="!selectedSlip" @click="openModal">상세보기</button>
      </div>
    </div>

    <!-- 상세 모달 -->
    <RetirementModal v-if="showModal && selectedSlip" :slip="selectedSlip" @close="showModal = false" />
  </div>
    <BaseToast ref="toastRef" />

</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import AgGrid from '@/components/grid/BaseGrid.vue'
import RetirementModal from '@/components/salary/RetirementModal.vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import BaseToast from '@/components/toast/BaseToast.vue' 

const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}

// 토큰 디코딩 함수
function parseJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

// 유저 스토어 및 라우터
const userStore = useUserStore()
const token = userStore.accessToken
const router = useRouter()

// HR 권한 체크
const payload = parseJwtPayload(userStore.accessToken)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}

// 페이지 내부 로직 (HR인 경우만 실행)
const listSection = ref(null)
const searchKeyword = ref('')
const provisionSituation = ref('')
const dateRange = ref({ start: '', end: '' })
const filterMode = ref('retire')
const retirements = ref([])
const showModal = ref(false)
const selectedSlip = ref(null)
const gridApi = ref(null)

const columnDefs = [
  { headerName: '사번', field: 'employeeId' },
  { headerName: '성명', field: 'employeeName' },
  { headerName: '퇴직일', field: 'retirementDate' },
  { headerName: '지급일자', field: 'provisionDate'},
  { headerName: '지급현황', field: 'provisionSituation' },
  { headerName: '비고', field: 'remark'},
  { headerName: '퇴직금 총액', field: 'retireTotal', valueFormatter: formatCurrency},
  { headerName: '퇴직소득세', field: 'retireIncomeTax', valueFormatter: formatCurrency},
  { headerName: '실지급액', field: 'provisionActual', valueFormatter: formatCurrency}
]

const filteredData = computed(() => {
  return retirements.value.filter(row => {
    const keyword = searchKeyword.value.toLowerCase()
    const matchKeyword =
      !keyword ||
      row.employeeId.toString().includes(keyword) ||
      row.employeeName.toLowerCase().includes(keyword)
    const matchStatus =
      !provisionSituation.value || row.provisionSituation === provisionSituation.value
    return matchKeyword && matchStatus
  })
})

async function fetchRetirements() {
  if (!dateRange.value.start || !dateRange.value.end) {
    showToast('기간을 입력해주세요.')
    return
  }

  const params = filterMode.value === 'retire'
    ? { retireMonthFrom: dateRange.value.start, retireMonthTo: dateRange.value.end }
    : { provisionMonthFrom: dateRange.value.start, provisionMonthTo: dateRange.value.end }

  try {
    const { data } = await axios.get('https://api.isddishr.site/payroll/retirements', {
      params: {
        ...params,
        provisionSituation: provisionSituation.value || '',
        keyword: searchKeyword.value || ''
      },
      headers: { Authorization: `Bearer ${token}` }
    })
    retirements.value = Array.isArray(data) ? data : []
    selectedSlip.value = null
    scrollToList()
  } catch (e) {
    console.error('퇴직금 현황 조회 실패:', e)
  }
}

function scrollToList() {
  listSection.value?.scrollIntoView({ behavior: 'smooth' })
}

function formatCurrency(params) {
  return params.value ? params.value.toLocaleString() : ''
}

function onGridReady(params) {
  gridApi.value = params.api
}

function onRowClicked(event) {
  selectedSlip.value = event.data
}

async function openModal() {
  if (!selectedSlip.value?.employeeId) {
    showToast('먼저 행을 선택해주세요.')
    return
  }

  try {
    const { data } = await axios.get(`https://api.isddishr.site/payroll/retirements/${selectedSlip.value.employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    selectedSlip.value = data
    showModal.value = true
  } catch (e) {
    console.error('상세정보 불러오기 실패:', e)
    showToast('상세 정보를 불러올 수 없습니다.')
  }
}

watch(filterMode, () => {
  dateRange.value.start = ''
  dateRange.value.end = ''
})
</script>



<style scoped>	
/* 전체 페이지 제목 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: var(--primary);
}

/* 공통 섹션 박스 스타일 */
.section {
  background: var(--bg-main);
  color: var(--text-main);
  padding: 20px;
  margin: 0 20px 24px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.05);
}

/* 필터 행 (정렬 + 여백) */
.filters-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  /* margin-bottom: 30px; */
}
.filters-row input[type="month"]::-webkit-calendar-picker-indicator {
    filter: var(--icon-filter);
    }
/* 라디오 버튼 라벨 간격 */
.date-type-toggle label {
  margin-right: 15px;
    color: var(--text-main);
}

/* 기간 입력 필드 정렬 */
.inputs,
.search-and-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 기간 라벨 스타일 */
.inputs label {
  font-weight: bold;
  margin-right: 5px;
    color: var(--text-main);
}

/* 공통 input/select 기본 스타일 */
input[type="month"],
input,
select {
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: var(--bg-main);
  color: var(--text-main);
}

/* 조회 버튼 hover 시 스타일 */
.search-btn:hover {
  background-color: var(--bg-main);
  color: var(--primary);

  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 조회 버튼 기본 스타일 */
.search-btn {
  background-color: var(--primary);
  color: var(--text-on-primary);
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

/* AgGrid 헤더 커스터마이징 */
.custom-theme :deep(.ag-header) {
  background-color: var(--bg-label-cell);
  color: var(--text-main);
}

/* 소제목 설명 (예: "조회 필터") */
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

/* 검색바 영역 */
.search-bar {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 검색 input 필드 */
.search-bar input {
  width: 200px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  height: 18px;
  background: var(--bg-main);
  color: var(--text-main);
}

/* (참고용) 검색 아이콘 스타일 — 사용 안 하면 삭제 가능 */
.search {
  width: 20px;
  height: 20px;
  padding-bottom: 1px;
  filter: var(--arrow-filter); /* 다크모드 시 반전 */

}

/* 드롭다운 필터 select 박스 */
.filters select {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

/* 박스형 섹션 및 기간 선택 박스 공통 스타일 */
.section,
.section .period {
  background: var(--bg-box);
  padding: 30px;
  margin: 0 20px 24px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}

/* 기간 선택 input 정렬 */
.period .inputs {
  display: flex;
  align-items: center;
  gap: 13px;
}
/* 기본적으로 primary 색상 */
input[type="radio"] {
  accent-color: var(--primary);
}

/* 라이트 모드일 때만 별도 색상 지정 */
body:not(.dark) input[type="radio"] {
  accent-color: #1c9dd0; /* 예: 더 어두운 회색으로 */
}
/* 상세보기 버튼 정렬 영역 */
.btn-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

</style>
