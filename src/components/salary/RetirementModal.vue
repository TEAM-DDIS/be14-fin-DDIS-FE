<!-- 퇴직금명세서 상세 모달 -->
<template>
  <!-- 모달: 배경 클릭 시 닫기 제거 -->
  <div class="modal-wrapper">
    <div class="modal" ref="pdfContent">
      <button class="close-btn no-print" @click="emit('close')">×</button>
      <h2 class="modal-title">퇴직금 명세서</h2>

      <!-- 인사 정보 테이블 -->
      <table class="info-table bordered">
        <tbody>
          <tr>
            <th class="gray label-left">사번</th><td class="white-bg">{{ slip.employeeId }}</td>
            <th class="gray label-left">성명</th><td class="white-bg">{{ slip.employeeName }}</td>
          </tr>
          <tr>
            <th class="gray label-left">본부</th><td class="white-bg">{{ slip.headName }}</td>
            <th class="gray label-left">부서</th><td class="white-bg">{{ slip.departmentName }}</td>
          </tr>
          <tr>
            <th class="gray label-left">팀</th><td class="white-bg">{{ slip.teamName }}</td>
            <th class="gray label-left">직급</th><td class="white-bg">{{ slip.rankName }}</td>
          </tr>
          <tr>
            <th class="gray label-left">입사일자</th><td class="white-bg">{{ formatDate2(slip.employmentDate) }}</td>
            <th class="gray label-left">퇴사일자</th><td class="white-bg">{{ formatDate2(slip.retirementDate) }}</td>
          </tr> 
          <tr>
            <th class="gray label-left">근속일수</th><td class="white-bg">{{ slip.totalWorkDays?.toLocaleString() }}일</td>
            <th class="gray label-left">근속년수</th><td class="white-bg">{{ totalYears }}년</td>
          </tr>
        </tbody>
      </table>

      <!-- 세부 내역 제목 -->
      <table class="section-title-table">
        <tbody> 
          <tr><td>세부 내역</td></tr>
        </tbody>
      </table>

      <!-- 월별 급여 항목 표시 테이블 -->
      <table class="details-table">
        <thead>
          <tr>
            <th class="gray center-align">월</th>
            <th class="gray center-align">금액</th>
            <th class="gray center-align">항목</th>
            <th class="gray center-align">금액</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in monthlySalaryRows" :key="row.label">
            <td class="text-left">{{ row.label }}</td>
            <td class="right-align">{{ formatCurrency(row.amount) }}</td>
            <td>
              <span v-show="idx === 0">3개월 일수</span>
              <span v-show="idx === 1">일 평균임금</span>
              <span v-show="idx === 2">상여금 총합</span>
            </td>
            <td class="right-align">
              <span v-show="idx === 0">{{ slip.totalDays }}일</span>
              <span v-show="idx === 1">{{ formatCurrency(averageDailySalary) }}</span>
              <span v-show="idx === 2">{{ formatCurrency(slip.totalBonus) }}</span>
            </td>
          </tr>
          <tr class="highlight-row">
            <td class="bold-label" colspan="2">총지급</td>
            <td colspan="2" class="right-align highlight">{{ formatCurrency(slip.retireTotal) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 공제 내역 테이블 -->
      <table class="deduction-table">
        <thead>
          <tr class="gray-row">
            <th class="center-align">공제 항목</th>
            <th class="center-align">금액</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>퇴직소득세</td>
            <td class="right-align">{{ formatCurrency(slip.retireIncomeTax) }}</td>
          </tr>
          <tr class="highlight-row">
            <td class="bold-label">총공제</td>
            <td class="right-align highlight">{{ formatCurrency(slip.retireIncomeTax) }}</td>
          </tr>
          <tr class="highlight-row">
            <td class="bold-label">실 수령액(원)</td>
            <td class="right-align highlight">{{ formatCurrency(slip.provisionActual) }}</td>
          </tr>
        </tbody>
      </table>

<div class="footer">
        <p class="today">{{ formatDate(slip.provisionDate, true) }}</p>
        <button class="btn left no-print" @click="sendMail">
          메일 전송
        </button>
        <button class="btn right no-print" @click="downloadPDF">PDF 다운로드</button>
      </div>
    </div>

    <!-- Toast 알림 -->
    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import html2pdf from 'html2pdf.js'
import axios from 'axios'
import BaseToast from '@/components/toast/BaseToast.vue'
import { useUserStore } from '@/stores/user'

const token = useUserStore().accessToken
const props = defineProps({ slip: Object })
const emit = defineEmits(['close'])

const pdfContent = ref(null)
const toastRef = ref(null)
const sending = ref(false)

const totalYears = computed(() => {
  const start = new Date(props.slip.employmentDate)
  const end = new Date(props.slip.retirementDate)
  return Math.floor((end - start) / (1000 * 60 * 60 * 24 * 365.25))
})

const formatCurrency = val =>
  typeof val === 'number' ? val.toLocaleString() : '0'

const formatDate = (date, full = false) => {
  if (!date) return '-'
  const d = new Date(date)
  return full
    ? `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getDate()}`
}

const formatDate2 = formatDate

const averageDailySalary = computed(() => {
  const total =
    (props.slip.month1Salary || 0) +
    (props.slip.month2Salary || 0) +
    (props.slip.month3Salary || 0) +
    (props.slip.totalBonus || 0)
  return props.slip.totalDays > 0
    ? Math.floor(total / props.slip.totalDays)
    : 0
})

const monthlySalaryRows = computed(() => {
  const retirementDate = new Date(props.slip.retirementDate)
  const start = new Date(retirementDate.getTime() - 89 * 86400000)
  const range = Array.from({ length: 90 }, (_, i) => new Date(start.getTime() + i * 86400000))

  const months = [
    { month: props.slip.month2, salary: props.slip.month2Salary },
    { month: props.slip.month1, salary: props.slip.month1Salary },
    { month: props.slip.month3, salary: props.slip.month3Salary },
    { month: props.slip.month4, salary: props.slip.month4Salary },
  ].filter(e => e.month && e.salary)

  return months.map(({ month, salary }) => {
    const [year, m] = month.split('-').map(Number)
    const daysInMonth = new Date(year, m, 0).getDate()
    const filtered = range.filter(d => d.getFullYear() === year && d.getMonth() + 1 === m)

    let label = `${year}-${String(m).padStart(2, '0')}`
    let prorated = salary
    if (filtered.length === daysInMonth) label += ' (전체)'
    else if (filtered.length) {
      label += ` (${filtered[0].getDate()}~${filtered[filtered.length - 1].getDate()}일)`
      prorated = Math.round(salary * (filtered.length / daysInMonth))
    }

    return { label, amount: prorated, sortDate: new Date(year, m - 1) }
  }).sort((a, b) => b.sortDate - a.sortDate)
})

async function sendMail() {
  if (sending.value) return

  sending.value = true
  toastRef.value?.show('메일 전송 중입니다...')

  try {
    await axios.post('https://api.isddishr.site/retirement/mail', {
      ...props.slip,
      totalYears: totalYears.value,
      averageDailySalary: averageDailySalary.value,
      monthlySalaries: monthlySalaryRows.value.map(row => ({
        label: row.label,
        amount: row.amount
      }))
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })

    toastRef.value?.show('메일이 전송되었습니다.')
  } catch (err) {
    console.error('메일 전송 실패:', err)
    toastRef.value?.show('메일 전송에 실패했습니다.')
  } finally {
    sending.value = false
  }
}

function downloadPDF() {
  if (!pdfContent.value) {
    console.warn('PDF content is not yet available')
    return
  }

  const clone = pdfContent.value.cloneNode(true)
  clone.querySelectorAll('.no-print').forEach(el => el.remove())

  html2pdf().from(clone).set({
    margin: 0.5,
    filename: `${props.slip.employeeName}_퇴직금명세서.pdf`,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).save()
}
</script>

<style scoped>
/* 텍스트 정렬 유틸 */
.label-left {
  text-align: left !important;
}
.text-left {
  text-align: left !important;
}
.right-align {
  text-align: right !important;
}
.center-align {
  text-align: center !important;
}

/* 모달 배경 (dim 처리) */
.modal-wrapper {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 본체 */
.modal {
  background: var(--modal-bg);
  color: var(--modal-text);
  border-radius: 12px;
  padding: 24px;
  padding-bottom: 80px; /* 하단 버튼 공간 확보 */
  width: 680px;
  max-height: 100vh;
  overflow-y: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
}

/* 닫기 버튼 */
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--modal-text);
}
.close-btn:hover {
  color: var(--primary);
}

/* 모달 제목 */
.modal-title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 20px;
}

/* 테이블 스타일 공통 */
.info-table,
.details-table,
.deduction-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
    color: var(--modal-text);
}

/* 테이블 내부 셀 기본 패딩 + 테두리 */
/* 셀 스타일 */
.bordered th,
.bordered td,
.details-table th,
.details-table td,
.deduction-table th,
.deduction-table td {
  border: 1px solid var(--border-color);
  padding: 6px 8px;
}
/* 배경색 유틸 */
.gray {
  background: var(--bg-label-cell);
  text-align: left;
}
.gray-row {
  background: var(--bg-label-cell);
  border: 1px solid var(--border-color);
}
.white-bg {
  background: var(--bg-main);
}

/* 섹션 제목 테이블 */
.section-title-table {
  width: 100%;
}
.section-title-table td {
  text-align: center;
  background: var(--bg-label-cell);
  font-weight: bold;
  border: 1px solid var(--border-color);
  padding: 10px;
  font-size: 16px;
    color: var(--modal-text);
}

/* 상세/공제 테이블 셀 */
.details-table th,
.details-table td,
.deduction-table th,
.deduction-table td {
  border: 1px solid var(--border-color);
  padding: 8px;
  text-align: left;
}

/* 강조 스타일 */
.bold-label {
  font-weight: bold;
}
.highlight {
  font-weight: bold;
  color: var(--primary);
}
.highlight-row {
  background-color: var(--bg-label-cell);
}

/* 하단 버튼 영역 */
.footer {
  margin-top: 30px;
  position: relative;
  margin-bottom: 10px;
}

/* 날짜 표시 */
.today {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--modal-text);
}

/* 버튼 공통 스타일 */
.btn {
  position: absolute;
  background-color: var(--primary);
  color: var(--text-on-primary);
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn:hover {
  background-color: var(--bg-main);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn.left {
  left: 0;
}
.btn.right {
  right: 0;
}

/* 인쇄 시 숨길 요소 */
.no-print {
  display: block;
}
@media print {
  .no-print {
    display: none !important;
  }
}
</style>