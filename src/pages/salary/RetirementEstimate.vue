<!-- 퇴직 > 예상 퇴직금 계산 -->
<template>
  <div class="main-page">
    <!-- 상단 타이틀 -->
    <h1 class="total-title">예상 퇴직금 계산</h1>

    <!-- 좌우 타이틀 라벨 (간편 계산기 / 계산 결과) -->
    <div class="labels-row">
      <p class="section-title">간편 계산기</p>
      <div class="label-spacer"></div>
      <p class="section-title">계산 결과</p>
    </div>

    <!-- 메인 패널: 좌측 입력 + 우측 결과 -->
    <div class="panels">
      <!-- 가운데 화살표 이미지 -->
      <img class="arrows" src="@/assets/icons/Polygon-2.svg" />

      <!-- 왼쪽 입력 패널 -->
      <section class="panel left-panel">
        <!-- 입사일/퇴사일 입력 필드 -->
        <div class="form-row horizontal">
          <label>입사일</label>
          <input type="date" :value="dateRange.start" disabled />
          <span>~</span>
          <label>퇴사일</label>
          <input type="date" v-model="dateRange.end" />
        </div>

        <!-- 연봉 입력 필드 -->
        <div class="form-row">
          <label>연봉</label>
          <input
            type="text"
            :value="formattedSalary"
            @input="handleSalaryInput"
            placeholder="숫자만 입력해주세요."
          />
        </div>

        <!-- 연봉 한글 표기 안내 -->
        <p v-if="formattedHangulSalary" class="salary-hint">
          입력하신 연봉은 약 {{ formattedHangulSalary }}입니다.
        </p>

        <!-- 재직기간 및 안내 문구 -->
        <div class="result-area" ref="resultSection">
          <!-- 계산 후 재직일수 출력 -->
          <div v-if="showResult">
            <span class="duration">{{ employmentDuration }}</span><br />
            <p class="duration-info">총 재직일수</p>
          </div>

          <!-- 계산 전 안내 문구 -->
          <p v-else class="guide">
            퇴사일과 연봉을 입력한 뒤<br />
            예상 퇴직금을 확인해보세요!
          </p>

          <!-- 재직기간이 1년 미만일 때 경고 -->
          <p v-if="showInsufficient" class="warning">
            ※ 1년 미만 재직자는 퇴직금이 발생하지 않습니다.
          </p>
        </div>

        <!-- 계산 버튼 -->
        <div class="actions">
          <button class="btn-primary" @click="calculate">간편계산</button>
        </div>
      </section>

      <!-- 오른쪽 결과 패널 -->
      <section class="panel right-panel">
        <!-- 계산 후 결과 출력 영역 -->
        <div v-if="showResult" class="result-summary">
          <!-- 월별 근무 기간/일수/금액 리스트 -->
          <div class="salary-row" v-for="(month, idx) in displayedMonths" :key="idx">
            <div class="month-info">
              <p class="month-title">{{ month.label }}</p>
              <p class="month-range">{{ month.range }}</p>
              <p class="month-days">{{ month.days }}일</p>
            </div>
            <div class="month-amount">
              <p>{{ formatCurrency(month.amount) }} <span class="unit">원</span></p>
            </div>
          </div>

          <!-- 합계, 평균임금, 퇴직금 등 요약 -->
          <div class="summary-row">
            <p class="label highlight">합계</p>
            <p class="total-amount">{{ formatCurrency(total3MonthsPay) }}<span class="unit">원</span></p>
          </div>
          <div class="summary-row">
            <p class="total-days">총 {{ totalDays }}일</p>
          </div>
          <div class="summary-row">
            <p class="label highlight">1개월 평균임금</p>
            <p class="total-amount">{{ formatCurrency(averageMonthlyWage) }}<span class="unit">원</span></p>
          </div>
          <div class="summary-row">
            <p class="label highlight">1일 평균임금</p>
            <p class="total-amount">{{ formatCurrency(dailyWage) }}<span class="unit">원</span></p>
          </div>

          <!-- 최종 퇴직금 -->
          <div class="summary-row final">
            <p class="final-label">퇴직금</p>
            <p class="final-amount">{{ formatCurrency(retirementPay) }}<span class="unit">원</span></p>
          </div>

          <!-- 퇴직금 참고사항 안내 -->
          <div class="note-box">
            <p>1. 본 퇴직금 계산기는 가장 범용적인 방식으로 만들어졌으나, 회사 내규 등에 따라 약간의 오차가 발생할 수 있습니다.</p>
            <p>2. 통상임금이 평균임금보다 클 경우에는 통상임금을 기준으로 계산합니다.</p>
          </div>
        </div>

        <!-- 계산 전 기본 안내 박스 -->
        <div v-else class="note-box">
          <p>퇴직일과 연봉을 입력하고 '간편계산'을 누르면 예상 퇴직금이 계산됩니다.</p>
          <p>본 계산은 일반적인 기준으로 제공되며 실제와 차이가 있을 수 있습니다.</p>
        </div>
      </section>
    </div>
  </div>

  <BaseToast ref="toastRef" />
</template>


<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import axios from 'axios'
import BaseToast from '@/components/toast/BaseToast.vue'


const token = useUserStore().accessToken
const resultSection = ref(null)
const employee = ref(null)

const toastRef = ref(null)

// 날짜 및 연봉, 결과 표시 여부 관련 변수들
const dateRange = ref({ start: '', end: '' })
const annualSalary = ref('')
const showResult = ref(false)
const showInsufficient = ref(false)
const employmentDuration = ref('')

// 급여 계산을 위한 상태 값들
const displayedMonths = ref([])
const totalDays = ref(0)
const total3MonthsPay = ref(0)
const averageMonthlyWage = ref(0)
const dailyWage = ref(0)

// 연봉 입력값을 콤마 포맷된 문자열로 표시
const formattedSalary = computed(() => {
  const num = Number(annualSalary.value)
  return isNaN(num) ? '' : num.toLocaleString()
})

// 연봉을 한글 금액(만원/원)으로 표시
const formattedHangulSalary = computed(() => {
  const amount = Number(annualSalary.value)
  if (isNaN(amount) || amount === 0) return ''
  return amount >= 10000
    ? `${Math.floor(amount / 10000).toLocaleString()}만원`
    : `${amount.toLocaleString()}원`
})

// 퇴직금 계산 로직: 일급 × 30 × (근속일수 / 365)
const retirementPay = computed(() => {
  const employmentStart = new Date(dateRange.value.start)
  const employmentEnd = new Date(dateRange.value.end)
  const diffDays = Math.floor((employmentEnd - employmentStart) / (1000 * 60 * 60 * 24))

  if (diffDays < 365) return 0
  return Math.floor(dailyWage.value * 30 * (diffDays / 365))
})

// 연봉 입력 시 숫자만 추출하여 상태 업데이트
function handleSalaryInput(e) {
  const raw = e.target.value.replace(/[^0-9]/g, '')
  annualSalary.value = raw ? Number(raw) : ''
}

// 내 정보 불러오기 (employeeId 따로 필요 없음)
onMounted(async () => {
  try {
    const { data } = await axios.get(`http://localhost:8000/payroll/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    employee.value = data
    if (employee.value?.employmentDate) {
      dateRange.value.start = employee.value.employmentDate.slice(0, 10)
    }
  } catch (err) {
    console.error('사용자 정보 조회 실패:', err)
  }
})

// 퇴사일 변경 시 월별 급여 범위 생성
watch(dateRange, val => {
  if (val.end) generateMonthData(val.end)
}, { deep: true })

// 숫자 통화 포맷 함수
function formatCurrency(val) {
  return typeof val === 'number' ? val.toLocaleString() : '0'
}

// 계산 버튼 클릭 시 퇴직금 및 평균임금 계산
function calculate() {
  showResult.value = false
  showInsufficient.value = false

  if (!dateRange.value.end || Number(annualSalary.value) === 0) {
    showToast('퇴사일과 연봉을 모두 입력해주세요.')
    return
  }

  const start = new Date(dateRange.value.start)
  const end = new Date(dateRange.value.end)
  const diffTime = end - start
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // 1년 미만은 퇴직금 미지급
  if (diffDays < 365) {
    showInsufficient.value = true
    return
  }

  // 근속기간 문자열 구성
  const years = Math.floor(diffDays / 365)
  const months = Math.floor((diffDays % 365) / 30)
  const days = diffDays % 30
  employmentDuration.value = `${years}년 ${months}개월 ${days}일`

  const monthlyWage = Number(annualSalary.value) / 12

  let totalPay = 0
  let totalDayCount = 0

  // 최근 3개월 급여 데이터 계산
  displayedMonths.value = displayedMonths.value.map((month) => {
    const [startStr, endStr] = month.range.split(' ~ ')
    const startDate = new Date(startStr)
    const endDate = new Date(endStr)
    const daysInMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate()
    const dailyWageForMonth = monthlyWage / daysInMonth

    const amount = Math.floor(dailyWageForMonth * month.days)
    totalPay += amount
    totalDayCount += month.days
    return { ...month, amount }
  })

  total3MonthsPay.value = totalPay
  totalDays.value = totalDayCount
  dailyWage.value = totalDayCount > 0 ? Math.floor(totalPay / totalDayCount) : 0
  averageMonthlyWage.value = dailyWage.value * 30

  showResult.value = true

  nextTick(() => {
    if (resultSection.value) {
      resultSection.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 퇴사일 기준으로 최근 3~4개월간 급여 범위 생성
function generateMonthData(retireDateStr) {
  const retireDate = new Date(retireDateStr)
  if (isNaN(retireDate.getTime())) return

  const ranges = []
  const retireDay = retireDate.getDate()
  const retireMonth = retireDate.getMonth()
  const retireYear = retireDate.getFullYear()
  const rangeDefinitions = []

  if (retireDay === 1) {
    const base = new Date(retireYear, retireMonth, 1)
    for (let i = 1; i <= 3; i++) {
      const end = new Date(base.getFullYear(), base.getMonth() - i + 1, 0)
      const start = new Date(end.getFullYear(), end.getMonth(), 1)
      rangeDefinitions.push({ label: `${i}개월 전`, start, end })
    }
  } else {
    rangeDefinitions.push(
      { label: '1개월 전', start: new Date(retireYear, retireMonth, 1), end: new Date(retireYear, retireMonth, retireDay - 1) },
      { label: '2개월 전', start: new Date(retireYear, retireMonth - 1, 1), end: new Date(retireYear, retireMonth, 0) },
      { label: '3개월 전', start: new Date(retireYear, retireMonth - 2, 1), end: new Date(retireYear, retireMonth - 1, 0) },
      { label: '4개월 전', start: new Date(retireYear, retireMonth - 3, retireDay), end: new Date(retireYear, retireMonth - 2, 0) }
    )
  }

  rangeDefinitions.forEach(({ label, start, end }) => {
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
    ranges.push({
      label,
      range: `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')} ~ ${end.getFullYear()}-${(end.getMonth() + 1).toString().padStart(2, '0')}-${end.getDate().toString().padStart(2, '0')}`,
      days: days > 0 ? days : 0,
      amount: 0
    })
  })
  displayedMonths.value = ranges
}


// 메세지 Toast
function showToast(msg) {
  toastRef.value?.show(msg)
}
</script>



<style scoped>
/* 연봉 입력 후 하단 힌트 텍스트 */
.salary-hint {
  margin: -6px 20px 20px 95px;
  font-size: 0.85rem;
  color: #666;
}

/* 전체 페이지 기본 레이아웃 */
.main-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.month-days{
  color: #666 !important;
  font-size: 14px !important;
}
/* 상단 제목 스타일 */
.total-title {
  margin-left: 20px;
  margin-bottom: 30px;
  color: #00a8e8;
}

/* 좌우 제목 라벨 영역 */
.labels-row {
  display: flex;
  gap: 24px;
  margin-bottom: 8px;
  margin-top: -18px;
}
.section-title:first-child {
  width: 40%;
  margin-left: 20px;
  margin-bottom: 10px;
  font-size: 18px;
  display: block;
}
.label-spacer {
  width: 20px;
}
.section-title:last-child {
  margin-left: 20px;
  width: 55%;
  margin-bottom: 10px;
  font-size: 18px;
  display: block;
}
.highlight{
  color: #00a8e8;
  font-weight: bold;
}
/* 좌우 패널 전체 영역 */
.panels {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 공통 패널 스타일 */
.panel {
  background: #fff;
  border-radius: 8px;
  margin: 0 20px 24px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding: 30px;
}

/* 왼쪽 입력 패널 */
.left-panel {
  margin-right: 0px;
  width: 45%;
  overflow-y: auto;
  position: relative;
  z-index: 3;
}

/* 오른쪽 결과 패널 */
.right-panel {
  margin-left: 0px;
  width: 55%;
  background: #f3f3f3;
  position: relative;
  z-index: 1;
  overflow-y: auto;
}

/* 양쪽 패널 가운데 화살표 아이콘 */
.arrows {
  position: absolute;
  left: 43%;
  z-index: 2;
}

/* 입력 필드 라인 (label + input) */
.form-row {
  display: flex;
  flex-direction: row;
  margin-bottom: 16px;
  margin-top: 10px;
  margin-left: 40px;
  margin-right: 40px;
  gap: 25px;
}
.form-row.horizontal {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

/* input 스타일 */
input[type='date'],
input[type='text'] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  flex: 1;
  min-width: 0;
}

/* label 스타일 */
label {
  font-weight: bold;
}

/* 입력 후 표시되는 결과 안내 영역 */
.result-area {
  flex: 1;
  margin-top: 180px;
  text-align: center;
}
.duration {
  font-weight: bold;
  color: #00a8e8;
  font-size: 30px;
}
.duration-info {
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
}
.guide {
  color: #00a8e8;
  font-size: 1.2rem;
  font-weight: 600;
}
.warning {
  margin-top: 12px;
  color: red;
  font-size: 0.95rem;
  font-weight: bold;
}

/* 버튼 영역 및 버튼 스타일 */
.actions {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 20px;
}
.btn-primary {
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
.btn-primary:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}

/* 결과 패널 내 각 항목 출력 스타일 */
.result-summary {
  padding: 24px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.salary-row {
  display: flex;
  justify-content: space-between;
  padding-bottom: 20px;
}
.month-info p {
  margin: 2px 0;
  font-size: 0.9rem;
  color: #333;
}
.month-title {
  font-weight: bold;
}
.month-amount {
  display: flex;
  align-items: center;
  font-weight: bold;
}
.unit {
  margin-left: 4px;
  color: #777;
}

/* 요약 줄 스타일 */
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #444;
}
.total-days {
  color: #00a8e8;
  font-size: 0.9rem;
  margin-bottom: -30px;
  margin-top: -30px;
}
.final-label {
  font-weight: bold;
  color: #00a8e8;
  font-size: 1.2rem;
}
.final-amount {
  color: #00a8e8;
  font-weight: bold;
  font-size: 1.2rem;
}

/* 결과 설명 박스 */
.note-box {
  background: #f5fcff;
  padding: 16px;
  margin-top: 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #666;
  border: 1px solid #00a8e8;
}

/* 기타 공통 섹션 */
.section,
.section .period {
  background: #fff;
  padding: 30px;
  margin: 0 20px 24px;
  border-radius: 8px;
  box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
}
</style>

