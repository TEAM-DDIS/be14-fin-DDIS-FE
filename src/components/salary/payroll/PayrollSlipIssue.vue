<!-- 급여 > 급여명세서 발급 -->
<template>
  <div class="payroll-page">
    <h1 class="page-title">급여명세서 발급</h1>

    <!-- 사원 전체 조회 -->
    <p class="desc">사원 전체 조회</p>
    <div class="section">
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
      <AgGrid
        class="ag-theme-alpine custom-theme"
        :gridOptions="{ theme: 'legacy' }"
        :columnDefs="columnDefs"
        :key="searchKeyword + filters.headName + filters.departmentName + filters.teamName + filters.rankName" 
        :rowData="filteredEmployees"
        height="400px"
        :pagination="true"
        :paginationPageSize="10"
      />
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

      <div class="history-box">
              <h3 class="detail-title">조회 사원별 월별 급여 내역</h3>
        <AgGrid
          class="ag-theme-alpine custom-theme"
          :gridOptions="{ theme: 'legacy' }"
          :columnDefs="salaryColumnDefs"
          :rowData="salaryHistory"
          @row-click="selectSlip"
          height="400px"
          :pagination="true"
        />
      </div>
      <div class="detail-box">
        <p class="desc detail-intro" v-if="!selectedSlip.yearMonth">
          급여명세서를 확인하려면 왼쪽에서 확인하고자 하는 행을 클릭해주세요.
        </p>
        <div v-if="selectedSlip.yearMonth" class="detail-content">
          <h3 class="detail-title">{{ selectedSlip.employeeName }}님 {{ selectedSlip.yearMonth.replace('-', '년 ') }}월 급여명세서</h3>
          <div class="slip-tables">
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
                <tr v-if="selectedSlip.deductions.length < selectedSlip.pays.length">
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="btn-area mt-2 right-align">
            <button class="search-btn">상세보기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import axios from 'axios'
import AgGrid from '@/components/grid/BaseGrid.vue'

const searchKeyword = ref('')
const employees = ref([])
const salaryHistory = ref([])
const salarySection = ref(null)
const selectedSlip = reactive({
  yearMonth: '',
  employeeName: '',
  pays: [],
  deductions: [],
  totalPay: 0,
  totalDeduction: 0
})
const dateRange = reactive({ start: '', end: '' })
const filters = reactive({
  headName: '',
  departmentName: '',
  teamName: '',
  rankName: ''
})
const hover = ref(false)

// const searchHoverStyle = {
//   background: '#ffffff',
//   color: '#00a8e8',
//   border: '1px solid #00a8e8',
//   borderRadius: '10px',
//   width: '100px',
//   height: '37px',
//   fontWeight: '700',
//   boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.05)'
// }

// const searchStyle = {
//   ...searchHoverStyle,
//   background: '#00a8e8',
//   color: '#fff'
// }

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
  return [...new Set(employees.value.filter(e => !filters.headName || e.headName === filters.headName).map(e => e.departmentName).filter(Boolean))]
})
const filteredTeams = computed(() => {
  return [...new Set(employees.value.filter(e => !filters.departmentName || e.departmentName === filters.departmentName).map(e => e.teamName).filter(Boolean))]
})

const filteredEmployees = computed(() => {
  return employees.value.filter(e => {
    const keyword = searchKeyword.value.toString().toLowerCase();
    const keywordMatch =
      !keyword ||
      e.employeeId.toString().includes(keyword) ||
      e.employeeName.toLowerCase().includes(keyword);
    const headMatch = !filters.headName || e.headName === filters.headName;
    const deptMatch = !filters.departmentName || e.departmentName === filters.departmentName;
    const teamMatch = !filters.teamName || e.teamName === filters.teamName;
    const rankMatch = !filters.rankName || e.rankName === filters.rankName;
    return keywordMatch && headMatch && deptMatch && teamMatch && rankMatch;
  });
});
function scrollToSalarySection() {
  salarySection.value?.scrollIntoView({ behavior: 'smooth' })
}

async function fetchSalaryHistory() {
  try {
    if (!dateRange.start || !dateRange.end) {
      alert('조회기간을 설정해주세요.')
      return
    }

    const results = []
    const startMonth = new Date(dateRange.start + '-01')
    const endMonth = new Date(dateRange.end + '-01')

    for (const emp of filteredEmployees.value) {
      const current = new Date(startMonth)
      while (current <= endMonth) {
        const yyyymm = current.getFullYear() + '-' + String(current.getMonth() + 1).padStart(2, '0')
        const { data } = await axios.get(`http://localhost:8000/payroll/salaries/${emp.employeeId}`, {
          params: { month: yyyymm }
        })
        if (data && data.salaryDate) {
          const ym = data.salaryDate.slice(0, 7)
          results.push({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            yearMonth: ym,
            salaryDate: data.salaryDate,
            totalIncome: data.totalIncome,
            totalDeductions: data.totalDeductions,
            netSalary: data.netSalary
          })
        }
        current.setMonth(current.getMonth() + 1)
      }
    }
    salaryHistory.value = results
    scrollToSalarySection()
  } catch (e) {
    console.error('조회 중 오류:', e)
  }
}

async function selectSlip(e) {
  const row = e.data
  try {
    const { data } = await axios.get(`http://localhost:8000/payroll/salaries/${row.employeeId}`, {
      params: { month: row.yearMonth }
    })
    selectedSlip.employeeName = row.employeeName
    selectedSlip.yearMonth = data.salaryDate.slice(0, 7)
    selectedSlip.pays = [
      { label: '기본급', amount: data.salaryBasic },
      { label: '연장수당', amount: data.salaryOvertime },
      { label: '야간수당', amount: data.salaryNight },
      { label: '휴일수당', amount: data.salaryHoliday },
      { label: '식대', amount: data.salaryMeal },
      { label: '교통비', amount: data.salaryTransport },
      { label: '상여금', amount: data.salaryBonus },
      { label: "총지급", amount: data.totalIncome }
    ]
    selectedSlip.deductions = [
      { label: '소득세', amount: data.incomeTax },
      { label: '지방소득세', amount: data.localIncomeTax },
      { label: '국민연금', amount: data.nationalPension },
      { label: '건강보험', amount: data.healthInsurance },
      { label: '장기요양보험', amount: data.longCareInsurance },
      { label: '고용보험', amount: data.employmentInsurance },
      { label: "총공제", amount: data.totalDeductions }
    ]


  } catch (e) {
    console.error('명세서 상세 조회 오류:', e)
  }
}

// function applyFilters() {
//     searchKeyword.value = searchKeyword.value.trim(); // 입력 값 공백 제거
// }

function formatCurrency(val) {
  return val.toLocaleString()
}

onMounted(async () => {
  const res = await axios.get('http://localhost:8000/payroll/employees')
  employees.value = res.data
  const today = new Date()
  dateRange.end = today.toISOString().slice(0, 7)
  const twoMonthsAgo = new Date(today.setMonth(today.getMonth() - 2))
  dateRange.start = twoMonthsAgo.toISOString().slice(0, 7)
})
</script>


<style scoped>
input[type="month"],
.search-bar input,
.filters select {
  border-radius: 8px !important;
}
input[type="month"] {
  height: 20px;
  padding: 6px 8px;
  border: 1px solid #ccc;
}
.custom-grid :deep(.ag-header) {
  background-color: #f0f0f0 !important;
}
.fixed-select {
  width: 150px;
}
.main-head th,
.table-head th{
    background-color: #f0f0f0 !important;
  font-weight: bold;
}
.sub-head th {
  background-color: #f0f0f0!important;
  font-weight: bold;
}
.filters-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  margin-right: 20px;
}
.page-title {
  margin: 20px;
  /* font-size: 50px; */
  color: #00a8e8;
}
.desc {
  margin-left: 20px;
}
.section,
.section .period {
  background: #fff;
  padding: 30px;
  margin: 0 20px 24px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}
.search-bar {
  margin-bottom: 12px;
  gap: 10px;
  display: flex;
  
}
.search{
  width: 20px;
  padding-bottom: 1px;
}
.search-bar input {
  width: 150px;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  height: 18px;
}
.filters {
  display: flex;
  gap: 30px;
  margin-bottom: 12px;
}

.filters select {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.period {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  background: #fff;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}
.period .inputs {
  display: flex;
  align-items: center;
  gap: 13px;
}

.search-btn:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow:
  inset 1px 1px 10px rgba(0, 0, 0, 0.25);

}
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
.input{
  height: 20px;
}
.grid-section {
  display: flex;
  gap: 16px;
  margin: 0 20px 24px;
}
.history-box,
.detail-box {
  flex: 1;
  background: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}
.slip-tables {
  display: flex;
  /* gap: 12px; */
  margin-top: 16px;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th,
.table td {
  height: 32px;
  /* text-align: left; */
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
}

.desc-title {
  display: flex;
  justify-content: space-between;
  /* margin: 0 20px; */
}
.detail-header {
  background-color: #f0f0f0;
  border-radius: 12px 12px 0 0;
  padding: 8px 16px;
}
.detail-title {
  text-align: center;
  font-weight: bold;
  margin: 0;
  margin-bottom: 12px;
}

.highlight {
  font-weight: bold;
  color: #00a8e8;
}
.right-align {
  text-align: right;
}
.bold-label {
  font-weight: bold;
}
.mt-2 {
  align-items: flex-end;
  margin-top: 16px;
  text-align: center;
}
.detail-intro {
  font-size: 15px;
  color: #00a8e8;
  padding-left: 4px;
  text-align: center;
  padding-top: 200px;
}
</style>
