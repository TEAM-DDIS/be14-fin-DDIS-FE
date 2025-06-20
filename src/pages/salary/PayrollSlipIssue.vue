<!-- 급여 > 급여명세서 발급 -->
<template>
  <div class="payroll-page">
    <h1 class="page-title">급여명세서 발급</h1>

    <!-- 사원 전체 조회 영역 -->
    <p class="desc">사원 전체 조회</p>
    <div class="section">
      <!-- 필터 영역: 검색 및 본부/부서/팀/직급 선택 -->
      <div class="filters-row">
        <div class="search-bar">
          <img src="@/assets/icons/search.svg" class="search" />
          <input v-model="searchKeyword" placeholder="사번 또는 성명 검색" />
        </div>
        <div class="filters">
          <div>
            <label>본부 </label>
            <select v-model="filters.headName" class="fixed-select">
              <option value="">전체 본부</option>
              <option v-for="h in uniqueHeads" :key="h">{{ h }}</option>
            </select>
          </div>
          <div>
            <label>부서 </label>
            <select v-model="filters.departmentName" class="fixed-select">
              <option value="">전체 부서</option>
              <option v-for="d in filteredDepartments" :key="d">{{ d }}</option>
            </select>
          </div>
          <div>
            <label>팀 </label>
            <select v-model="filters.teamName" class="fixed-select">
              <option value="">전체 팀</option>
              <option v-for="t in filteredTeams" :key="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label>직급 </label>
            <select v-model="filters.rankName" class="fixed-select">
              <option value="">전체 직급</option>
              <option v-for="r in uniqueRanks" :key="r">{{ r }}</option>
            </select>
          </div>
        </div>
      </div>
      <!-- 사원 목록 테이블 -->
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :key="searchKeyword + filters.headName + filters.departmentName + filters.teamName + filters.rankName" 
        :rowData="filteredEmployees"
        height="400px"
        :pagination="true"
        :paginationPageSize="20"
      />
    </div>

    <!-- 기간 설정 영역 -->
    <p class="desc">기간 설정</p>
    <div class="section period">
      <div class="inputs">
        <label><strong>조회기간</strong></label>
        <input type="month" v-model="dateRange.start" />
        <span>~</span>
        <input type="month" v-model="dateRange.end" />
      </div>
      <div class="btn-area">
        <button class="search-btn" @click="fetchSalaryHistory">
          조회
        </button>
      </div>
    </div>

    <!-- 월별 급여 내역 & 급여명세서 상세 -->
    <div class="desc-title">
      <p class="desc">월별 급여 내역</p>
      <p class="desc">급여명세서 상세</p>
      <p class="desc"></p>
    </div>

    <div class="grid-section" ref="salarySection">

      <!-- 급여 내역 테이블 -->
      <div class="history-box">
        <h3 class="detail-title">조회 사원별 월별 급여 내역</h3>
        <AgGrid
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :columnDefs="salaryColumnDefs"
          :rowData="salaryHistory"
          :paginationPageSize="20"
          @row-click="selectSlip"
          height="400px"
          :pagination="true"
        />
      </div>

      <!-- 선택된 사원의 급여명세서 상세 영역 -->
      <div class="detail-box">
        <p class="desc detail-intro" v-if="!selectedSlip.yearMonth">
          급여명세서를 확인하려면 왼쪽에서 확인하고자 하는 행을 클릭해주세요.
        </p>
        <div v-if="selectedSlip.yearMonth" class="detail-content">
          <h3 class="detail-title">{{ selectedSlip.employeeName }}님 {{ selectedSlip.yearMonth.replace('-', '년 ') }}월 급여명세서</h3>
          <div class="slip-tables">
            <!-- 지급 항목 테이블 -->
            <table class="table">
              <thead>
                <tr class="main-head">
                  <th colspan="2">지급</th>
                </tr>
                <tr class="sub-head">
                  <th>항목</th><th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedSlip.pays" :key="item.label">
                  <td :class="item.label.includes('총') ? 'bold-label' : ''">{{ item.label }}</td>
                  <td :class="['right-align', item.label.includes('총') ? 'highlight' : '']">{{ formatCurrency(item.amount) }}</td>
                </tr>
              </tbody>
            </table>
            <!-- 공제 항목 테이블 -->
            <table class="table">
              <thead>
                <tr class="main-head">
                  <th colspan="2">공제</th>
                </tr>
                <tr class="sub-head">
                  <th>항목</th><th>금액</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in selectedSlip.deductions" :key="item.label">
                  <td :class="item.label.includes('총') ? 'bold-label' : ''">{{ item.label }}</td>
                  <td :class="['right-align', item.label.includes('총') ? 'highlight' : '']">{{ formatCurrency(item.amount) }}</td>
                </tr>
                <!-- 지급 행 수보다 공제 행 수가 부족할 경우 빈 행 추가 -->
                <tr v-if="selectedSlip.deductions.length < selectedSlip.pays.length">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- 상세보기 버튼 -->
          <div class="btn-area mt-2 right-align">
            <button class="search-btn" @click="openModal">상세보기</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 급여명세서 모달 컴포넌트 -->
    <Modal v-if="showModal" :slip="selectedSlip" @close="showModal = false" />
  </div>
  <BaseToast ref="toastRef" />

</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import AgGrid from '@/components/grid/BaseGrid.vue'
import Modal from '@/components/salary/PayrollModal.vue'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue' 

// ---------------------------------------------------------
// HR 권한 체크 로직
// ---------------------------------------------------------
const router = useRouter()
const userStore = useUserStore()
// const token = localStorage.getItem('token')
const toastRef = ref(null)

function showToast(msg) {
  toastRef.value?.show(msg)
}
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

// const token = localStorage.getItem('token')
const token = userStore.accessToken

const payload = parseJwtPayload(token)
const isHR = payload?.role?.includes('ROLE_HR') || payload?.auth?.includes('ROLE_HR')

if (!isHR) {
  showToast('접근 권한이 없습니다.')
  router.push('/error403')
}
// ---------------------------------------------------------

const showModal = ref(false)
const searchKeyword = ref('')
const employees = ref([])
const salaryHistory = ref([])
const salarySection = ref(null)

const selectedSlip = reactive({
  yearMonth: '',
  employeeId: '',
  employeeEmail: '',
  employeeName: '',
  headName: '',
  departmentName: '',
  teamName: '',
  rankName: '',
  pays: [],
  deductions: [],
  totalPay: 0,
  totalDeduction: 0,
  salaryDate: ''
})

const dateRange = reactive({ start: '', end: '' })

const filters = reactive({
  headName: '',
  departmentName: '',
  teamName: '',
  rankName: ''
})

const columnDefs = [
  { headerName: '사번', field: 'employeeId' },
  { headerName: '성명', field: 'employeeName' },
  { headerName: '본부', field: 'headName' },
  { headerName: '부서', field: 'departmentName' },
  { headerName: '팀', field: 'teamName' },
  { headerName: '직급', field: 'rankName' },
  { headerName: '거래은행', field: 'bankName' },
  { headerName: '계좌번호', field: 'bankAccount' },
  { headerName: '예금주', field: 'bankDepositor' }
]

const salaryColumnDefs = [
  { headerName: '사원번호', field: 'employeeId' },
  { headerName: '성명', field: 'employeeName' },
  { headerName: '지급일자', field: 'salaryDate' },
  { headerName: '총지급', field: 'totalIncome' },
  { headerName: '총공제', field: 'totalDeductions' },
  { headerName: '실지급', field: 'netSalary' }
]

const uniqueHeads = computed(() => [...new Set(employees.value.map(e => e.headName).filter(Boolean))])
const uniqueRanks = computed(() => [...new Set(employees.value.map(e => e.rankName).filter(Boolean))])

const filteredDepartments = computed(() => {
  return [...new Set(
    employees.value
      .filter(e => !filters.headName || e.headName === filters.headName)
      .map(e => e.departmentName).filter(Boolean)
  )]
})

const filteredTeams = computed(() => {
  return [...new Set(
    employees.value
      .filter(e =>
        (!filters.headName || e.headName === filters.headName) &&
        (!filters.departmentName || e.departmentName === filters.departmentName)
      )
      .map(e => e.teamName).filter(Boolean)
  )]
})

const filteredEmployees = computed(() => {
  return employees.value.filter(e => {
    const keyword = searchKeyword.value.toLowerCase()
    const keywordMatch = !keyword || e.employeeId.toString().includes(keyword) || e.employeeName.toLowerCase().includes(keyword)
    const headMatch = !filters.headName || e.headName === filters.headName
    const deptMatch = !filters.departmentName || e.departmentName === filters.departmentName
    const teamMatch = !filters.teamName || e.teamName === filters.teamName
    const rankMatch = !filters.rankName || e.rankName === filters.rankName
    return keywordMatch && headMatch && deptMatch && teamMatch && rankMatch
  })
})

function scrollToSalarySection() {
  salarySection.value?.scrollIntoView({ behavior: 'smooth' })
}

async function fetchSalaryHistory() {
  try {
    if (!dateRange.start || !dateRange.end) {
      showToast('조회기간을 설정해주세요.')
      return
    }

    const params = {
      fromMonth: dateRange.start,
      toMonth: dateRange.end,
      headName: filters.headName,
      departmentName: filters.departmentName,
      teamName: filters.teamName,
      rankName: filters.rankName
    }

    const { data } = await axios.get(`http://localhost:5000/payroll/salaries`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })

    const filtered = data.filter(item =>
      filteredEmployees.value.some(emp => emp.employeeId === item.employeeId)
    )

    salaryHistory.value = filtered.map(s => ({
      ...s,
      yearMonth: s.salaryDate.slice(0, 7)
    }))

    scrollToSalarySection()
  } catch (e) {
    console.error('조회 중 오류:', e)
  }
}

async function selectSlip(e) {
  const row = e.data
  try {
    const { data: salary } = await axios.get(`http://localhost:5000/payroll/salaries/${row.employeeId}`, {
      params: { month: row.yearMonth },
      headers: { Authorization: `Bearer ${token}` }
    })

    const { data: emp } = await axios.get(`http://localhost:5000/payroll/employees/${row.employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    Object.assign(selectedSlip, {
      employeeId: emp.employeeId,
      employeeEmail: emp.employeeEmail,
      employeeName: emp.employeeName,
      headName: emp.headName,
      departmentName: emp.departmentName,
      teamName: emp.teamName,
      rankName: emp.rankName,
      yearMonth: salary.salaryDate.slice(0, 7),
      salaryDate: salary.salaryDate,
      netSalary: salary.netSalary,
      pays: [
        { label: '기본급', amount: salary.salaryBasic },
        { label: '연장수당', amount: salary.salaryOvertime },
        { label: '야간수당', amount: salary.salaryNight },
        { label: '휴일수당', amount: salary.salaryHoliday },
        { label: '식대', amount: salary.salaryMeal },
        { label: '교통비', amount: salary.salaryTransport },
        { label: '상여금', amount: salary.salaryBonus },
        { label: '총지급', amount: salary.totalIncome }
      ],
      deductions: [
        { label: '소득세', amount: salary.incomeTax },
        { label: '지방소득세', amount: salary.localIncomeTax },
        { label: '국민연금', amount: salary.nationalPension },
        { label: '건강보험', amount: salary.healthInsurance },
        { label: '장기요양보험', amount: salary.longCareInsurance },
        { label: '고용보험', amount: salary.employmentInsurance },
        { label: '총공제', amount: salary.totalDeductions }
      ]
    })
  } catch (e) {
    console.error('명세서 상세 조회 오류:', e)
  }
}

function formatCurrency(val) {
  return val.toLocaleString()
}

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:5000/payroll/employees', {
      headers: { Authorization: `Bearer ${token}` }
    })
    employees.value = res.data
  } catch (err) {
    if (err.response?.status === 403) {
      router.push('/error403')
    } else {
      console.error('사원 목록 불러오기 실패:', err)
    }
  }
})

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
  background-color: #f8f9fa !important;
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
  background-color: #f0f0f0;
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
.btn-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}


/* 항목 열 너비 고정 */
.table th:first-child,
.table td:first-child {
  width: 50%;
}

/* 금액 열 우측 정렬 및 너비 고정 */
.table th:last-child,
.table td:last-child {
  width: 50%;
}
</style>
