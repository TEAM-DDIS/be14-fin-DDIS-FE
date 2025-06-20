<template>
  <div class="payroll-page">
    <h1 class="page-title">내 급여명세서 조회</h1>

    <!-- 기본 정보 및 계좌 -->
    <p class="desc">기본 정보 및 급여 계좌</p>
    <div class="section">
      <div class="table-wrapper">
        <table class="table info-table">
                    <colgroup>
            <col v-for="i in 9" :key="i" style="width: 11.11%">
          </colgroup>
          <thead>
            <tr>
              <th>사번</th>
              <th>성명</th>
              <th>본부</th>
              <th>부서</th>
              <th>팀</th>
              <th>직급</th>
              <th>거래은행</th>
              <th>계좌번호</th>
              <th>예금주</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ employee?.employeeId }}</td>
              <td>{{ employee?.employeeName }}</td>
              <td>{{ employee?.headName }}</td>
              <td>{{ employee?.departmentName }}</td>
              <td>{{ employee?.teamName }}</td>
              <td>{{ employee?.rankName }}</td>
              <td>{{ employee?.bankName }}</td>
              <td>{{ employee?.bankAccount }}</td>
              <td>{{ employee?.bankDepositor }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 기간 설정 -->
    <p class="desc">기간 설정</p>
    <div class="section period">
      <div class="inputs">
        <label><strong>조회기간</strong></label>
        <input type="month" v-model="dateRange.start" />
        <span>~</span>
        <input type="month" v-model="dateRange.end" />
      </div>
      <div class="btn-area">
        <button class="search-btn" @click="fetchSalaryHistory">조회</button>
      </div>
    </div>

    <!-- 월별 급여 내역 + 상세 -->
    <div class="desc-title">
      <p class="desc">월별 급여 내역</p>
      <p class="desc">급여명세서 상세</p>
      <p class="desc"></p>
    </div>
    <div class="grid-section" ref="salarySection">

      <!-- 월별 급여 내역: ag-grid 사용 -->
      <div class="history-box">
        <h3 class="detail-title">월별 급여 내역</h3>
        <AgGrid
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :columnDefs="salaryColumnDefs"
          :rowData="salaryHistory"
          :paginationPageSize="20"
          @row-click="e => selectSlip(e.data.yearMonth)"
          height="400px"
          :pagination="true"
        />
      </div>

      <!-- 상세 명세서 -->
      <div class="detail-box">
        <p class="detail-intro" v-if="!selectedSlip">급여명세서를 보려면 왼쪽 내역을 클릭하세요.</p>
        <div v-else>
          <h3 class="detail-title">{{ employee.employeeName }}님 {{ selectedSlip.yearMonth.replace('-', '년 ') }}월 급여명세서</h3>
          <div class="slip-tables">
            <table class="table">
              <thead>
                <tr class="main-head"><th colspan="2">지급</th></tr>
                <tr class="sub-head"><th>항목</th><th>금액</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedSlip.pays" :key="item.label">
                  <td :class="item.label.includes('총') ? 'bold-label' : ''">{{ item.label }}</td>
                  <td class="right-align" :class="item.label.includes('총') ? 'highlight' : ''">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
            <table class="table">
              <thead>
                <tr class="main-head"><th colspan="2">공제</th></tr>
                <tr class="sub-head"><th>항목</th><th>금액</th></tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedSlip.deductions" :key="item.label">
                  <td :class="item.label.includes('총') ? 'bold-label' : ''">{{ item.label }}</td>
                  <td class="right-align" :class="item.label.includes('총') ? 'highlight' : ''">{{ formatCurrency(item.amount) }}</td>
                </tr>
                <tr v-if="selectedSlip.deductions.length < selectedSlip.pays.length">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="btn-area mt-2 right-align">
            <button class="search-btn" @click="openModal">상세보기</button>
          </div>
        </div>
      </div>
    </div>
        <Modal v-if="showModal" :slip="selectedSlip":showMailButton="false" @close="showModal = false" />
  </div>
  <BaseToast ref="toastRef" />

</template>


<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import AgGrid from '@/components/grid/BaseGrid.vue'
import Modal from '@/components/salary/PayrollModal.vue'
import BaseToast from '@/components/toast/BaseToast.vue' 

const salarySection = ref(null)
const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)

const employee = ref(null)
const dateRange = reactive({ start: '', end: '' })
const salaryHistory = ref([])
const selectedSlip = ref(null)
const showModal = ref(false)
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
const salaryColumnDefs = [
  { headerName: '지급일자', field: 'salaryDate' },
  {
    headerName: '총지급',
    field: 'totalIncome',
    valueFormatter: params => formatCurrency(params.value),
    cellClass: 'right-align'
  },
  {
    headerName: '총공제',
    field: 'totalDeductions',
    valueFormatter: params => formatCurrency(params.value),
    cellClass: 'right-align'
  },
  {
    headerName: '실지급',
    field: 'netSalary',
    valueFormatter: params => formatCurrency(params.value),
    cellClass: 'right-align'
  }
]
function parseJwtPayload() {
  try {
    const token = accessToken.value || ''
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
    console.error('JWT 복호화 실패:', e)
    return {}
  }
}

onMounted(async () => {
  await fetchEmployeeInfo()
})

async function fetchEmployeeInfo() {
  const { data } = await axios.get(`http://localhost:8000/payroll/me`, {
    headers: { Authorization: `Bearer ${accessToken.value}` }
  })
  employee.value = data
}

async function fetchSalaryHistory() {
  if (!dateRange.start || !dateRange.end) {
    showToast('조회 기간을 선택해주세요.')
    return
  }

  const results = []
  const start = new Date(dateRange.start + '-01')
  const end = new Date(dateRange.end + '-01')
  const current = new Date(start)

  while (current <= end) {
    const yyyymm = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    try {
      const { data } = await axios.get(`http://localhost:8000/payroll/me/salary`, {
        params: { month: yyyymm },
        headers: { Authorization: `Bearer ${accessToken.value}` }
      })
      if (data?.salaryDate) {
        results.push({
          ...data,
          yearMonth: data.salaryDate.slice(0, 7)
        })
      }
    } catch (e) {
      console.warn(`${yyyymm} 급여 없음`)
    }
    current.setMonth(current.getMonth() + 1)
  }

  salaryHistory.value = results
  scrollToSalarySection()
}

function scrollToSalarySection() {
  salarySection.value?.scrollIntoView({ behavior: 'smooth' })
}

async function selectSlip(month) {
  const response = await axios.get(`http://localhost:8000/payroll/me/salary`, {
    params: { month },
    headers: { Authorization: `Bearer ${accessToken.value}` }
  })

  const data = response.data

  selectedSlip.value = {
    yearMonth: month,
    employeeId: employee.value.employeeId,
    employeeName: employee.value?.employeeName || '',
    headName: employee.value?.headName || '',
    departmentName: employee.value?.departmentName || '',
    teamName: employee.value?.teamName || '',
    rankName: employee.value?.rankName || '',
    netSalary: data.netSalary,
    salaryDate: data.salaryDate,
    pays: [
      { label: '기본급', amount: data.salaryBasic },
      { label: '연장수당', amount: data.salaryOvertime },
      { label: '야간수당', amount: data.salaryNight },
      { label: '휴일수당', amount: data.salaryHoliday },
      { label: '식대', amount: data.salaryMeal },
      { label: '교통비', amount: data.salaryTransport },
      { label: '상여금', amount: data.salaryBonus },
      { label: '총지급', amount: data.totalIncome }
    ],
    deductions: [
      { label: '소득세', amount: data.incomeTax },
      { label: '지방소득세', amount: data.localIncomeTax },
      { label: '국민연금', amount: data.nationalPension },
      { label: '건강보험', amount: data.healthInsurance },
      { label: '장기요양보험', amount: data.longCareInsurance },
      { label: '고용보험', amount: data.employmentInsurance },
      { label: '총공제', amount: data.totalDeductions }
    ]
  }
}

function formatCurrency(val) {
  return val?.toLocaleString() || 0
}

function openModal() {
  showModal.value = true
}
</script>



<style scoped>
/* 공통 입력 요소 테두리 둥글게 */
input[type="month"],
.search-bar input,
.filters select {
  border-radius: 8px !important;
}

/* 월 선택 input 스타일 */
input[type="month"] {
  height: 20px;
  padding: 6px 8px;
  border: 1px solid #ccc;
}

/* ag-grid 헤더 색상 커스터마이징 */
.custom-grid :deep(.ag-header) {
  background-color: #f0f0f0 !important;
}

/* select 박스 고정 폭 */
.fixed-select {
  width: 150px;
}

/* 테이블 상단 제목 셀 스타일 */
.main-head th,
.table-head th {
  background-color: #f8f9fa !important;
  font-weight: bold;
  
}

/* 서브 헤더 행 스타일 */
.sub-head th {
  background-color: #f8f9fa !important;
  font-weight: bold;
}

/* 필터 행 배치 정렬 */
.filters-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  margin-right: 20px;
}

/* 페이지 제목 스타일 */
.page-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

/* 소제목 설명 */
.desc {
  display: block;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
}

/* 박스형 섹션 공통 스타일 */
.section,
.section .period {
  background: #fff;
  padding: 30px;
  margin: 0 20px 24px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}

/* 검색바 영역 스타일 */
.search-bar {
  margin-bottom: 12px;
  gap: 10px;
  display: flex;
}

/* 검색 아이콘 */
.search {
  width: 20px;
  padding-bottom: 1px;
}

/* 검색 input 박스 스타일 */
.search-bar input {
  width: 150px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 18px;
}

/* 필터 select 영역 배치 */
.filters {
  display: flex;
  gap: 30px;
  margin-bottom: 12px;
}

/* 필터 select 기본 스타일 */
.filters select {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* 기간 섹션 배치 스타일 */
.period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #fff;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}

/* 기간 선택 input 그룹 정렬 */
.period .inputs {
  display: flex;
  align-items: center;
  gap: 13px;
}

/* 조회 버튼 hover 효과 */
.search-btn:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 조회 버튼 기본 스타일 */
.search-btn {
  background-color: #00a8e8;
  color: white;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

/* input 클래스 높이 세팅 */
.input {
  height: 20px;
}

/* 상세 박스 2개 나란히 정렬 */
.grid-section {
  display: flex;
  gap: 16px;
  margin: 0 20px 24px;
}

/* 왼쪽: 내역 / 오른쪽: 상세 */
.history-box,
.detail-box {
  flex: 1;
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}

/* 급여 테이블 묶음 (지급/공제) */
.slip-tables {
  display: flex;
  margin-top: 16px;
}

/* 표 기본 스타일 */
.table {
  width: 100%;
  border-collapse: collapse;
}
.info-table th{
  background: #f8f9fa !important;
  text-align: left;
  
}
/* 표 셀 스타일 */
.table th,
.table td {
  height: 32px;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
}

/* 급여 상세 상단 설명 */
.desc-title {
  display: flex;
  justify-content: space-between;
}

/* 상세 박스 헤더 */
.detail-header {
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
  padding: 8px 16px;
}

/* 상세 타이틀 중앙 정렬 */
.detail-title {
  text-align: center;
  font-weight: bold;
  margin: 0 0 12px;
}

/* 강조 텍스트 */
.highlight {
  font-weight: bold;
  color: #00a8e8;
}

/* 숫자 등 우측 정렬 */
.right-align {
  text-align: right;
}

/* 굵은 항목 이름 */
.bold-label {
  font-weight: bold;
}

/* 상단 여백용 클래스 */
.mt-2 {
  align-items: flex-end;
  margin-top: 16px;
  text-align: center;
}

/* 안내 문구 스타일 */
.detail-intro {
  font-size: 15px;
  color: #00a8e8;
  padding-left: 4px;
  text-align: center;
  padding-top: 200px;
}

/* 항목 열 너비 고정 */
/* .table th:first-child,
.table td:first-child {
  width: 50%;
} */

/* 금액 열 우측 정렬 및 너비 고정 */
.table th:last-child,
.table td:last-child {
  width: 50%;
}
</style>
