<!-- 급여명세서 상세 모달 -->
<template>
  <div class="modal-wrapper">
    <div class="modal" ref="pdfContent">
      <button class="close-btn no-print" @click="emit('close')">×</button>
      <h2 class="modal-title">
        {{ isMySlip ? '급여명세서' : `${slip.employeeName} 님의 급여명세서` }}
      </h2>

      <table class="info-table bordered">
        <tbody>
          <tr>
            <th>사번</th>
            <td>{{ slip.employeeId || '-' }}</td>
            <th>성명</th>
            <td>{{ slip.employeeName || '-' }}</td>
          </tr>
          <tr>
            <th>본부</th>
            <td>{{ slip.headName || '-' }}</td>
            <th>부서</th>
            <td>{{ slip.departmentName || '-' }}</td>
          </tr>
          <tr>
            <th>팀</th>
            <td>{{ slip.teamName || '-' }}</td>
            <th>직급</th>
            <td>{{ slip.rankName || '-' }}</td>
          </tr>
        </tbody>
      </table>

      <table class="section-title-table">
        <tbody>
          <tr><td>세부 내역</td></tr>
        </tbody>
      </table>

      <div class="slip-tables">
        <table class="table">
          <thead>
            <tr class="sub-head"><th colspan="2">지급</th></tr>
            <tr class="sub-sub-head"><th>항목</th><th>금액</th></tr>
          </thead>
          <tbody>
            <tr v-for="item in slip.pays" :key="item.label">
              <td :class="item.label.includes('총') ? 'bold-label gray-row' : ''">{{ item.label }}</td>
              <td :class="['right-align', item.label.includes('총') ? 'highlight gray-row' : '']">
                {{ formatCurrency(item.amount) }}
              </td>
            </tr>
          </tbody>
        </table>

        <table class="table">
          <thead>
            <tr class="sub-head"><th colspan="2">공제</th></tr>
            <tr class="sub-sub-head"><th>항목</th><th>금액</th></tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in paddedDeductions" :key="index">
              <td :class="item.label?.includes('총') ? 'bold-label gray-row' : ''">
                {{ item.label || ' ' }}
              </td>
              <td :class="['right-align', item.label?.includes('총') ? 'highlight gray-row' : '']">
                {{ item.amount !== undefined ? formatCurrency(item.amount) : ' ' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="summary-row gray-row">
        <span>실 수령액(원)</span>
        <span class="highlight">{{ formatCurrency(slip.netSalary || netPay) }}</span>
      </div>

      <div class="footer">
        <p class="today bold">{{ today }}</p>
        <button
          v-if="showMailButton && isMySlip"
          class="btn left no-print"
          @click="sendMail"
        >
          메일 전송
        </button>
        <button class="btn right no-print" @click="downloadPDF">PDF 다운로드</button>
      </div>
    </div>

    <BaseToast ref="toastRef" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDateFormat } from '@vueuse/core'
import html2pdf from 'html2pdf.js'
import axios from 'axios'
import { useUserStore } from '@/stores/user'
import BaseToast from '@/components/toast/BaseToast.vue' 

const toastRef = ref(null)
function showToast(msg) {
  toastRef.value?.show(msg)
}

const token = useUserStore().accessToken
const props = defineProps({
  slip: Object,
  showMailButton: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['close'])
const pdfContent = ref(null)

const userStore = useUserStore()
const accessToken = computed(() => userStore.accessToken)

const netPay = computed(() => props.slip.netSalary || (props.slip.totalPay - props.slip.totalDeduction))

const today = computed(() => {
  const date = new Date(props.slip.salaryDate)
  return useDateFormat(date, 'YYYY년 MM월 DD일').value
})

const paddedDeductions = computed(() => {
  const max = props.slip.pays.length
  const current = props.slip.deductions.length
  const pad = max - current
  return [...props.slip.deductions, ...Array(pad).fill({})]
})

function parseJwtPayload() {
  try {
    const token = accessToken.value || ''
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}` )
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('JWT 복호화 실패:', e)
    return {}
  }
}

const decoded = parseJwtPayload()
const isHR = computed(() => decoded?.auth?.includes('ROLE_HR'))
const isMySlip = computed(() => decoded?.sub == props.slip.employeeId?.toString() || isHR.value)

function formatCurrency(val) {
  return val?.toLocaleString() || ''
}


async function sendMail() {
  showToast('메일 전송 중...')
  try {
    const payload = {
      employeeEmail: props.slip.employeeEmail,
      employeeId: props.slip.employeeId,
      employeeName: props.slip.employeeName,
      headName: props.slip.headName,
      departmentName: props.slip.departmentName,
      teamName: props.slip.teamName,
      rankName: props.slip.rankName,
      salaryDate: props.slip.salaryDate,
      netSalary: props.slip.netSalary,
      pays: props.slip.pays,
      deductions: props.slip.deductions
    }

    await axios.post('http://localhost:5000/payroll/mail', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    showToast('메일 전송이 완료되었습니다.')
  } catch (error) {
    console.error('메일 전송 실패', error)
    showToast('메일 전송에 실패했습니다.')
  }
}

function downloadPDF() {
  const clone = pdfContent.value.cloneNode(true)
  clone.querySelectorAll('.no-print').forEach(el => el.remove())

  const fileName = `${props.slip.employeeName}_${props.slip.yearMonth.replace('-', '년 ')}월_급여명세서.pdf`

  html2pdf().from(clone).set({
    margin: 0.5,
    filename: fileName,
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  }).save()
}
</script>


<style scoped>
/* 모달 전체 배경 */
.modal-wrapper {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달 본체 */
.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 650px;
  height: 820px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
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
}
.close-btn:hover {
  color: #00a8e8;
}

/* 제목 */
.modal-title {
  text-align: center;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 20px;
}

/* 사원 정보, 지급/공제 테이블 스타일 */
.info-table, .table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ccc;
}

.bordered th, .bordered td {
  border: 1px solid #ccc;
}

.info-table th {
  background: #f8f9fa;
  padding: 6px 8px;
  text-align: left;
  width: 25%;
}
.info-table td {
  padding: 6px 8px;
  width: 25%;
}

/* '세부 내역' 구분선 */
.section-title-table {
  width: 100%;
}
.section-title-table td {
  text-align: center;
  background: #f8f9fa;
  font-weight: bold;
  border: 1px solid #ccc;
  padding: 10px;
}

/* 표 내부 스타일 */
.table th, .table td {
  border: 1px solid #e0e0e0;
  padding: 8px;
}
.sub-head th, .sub-sub-head th {
  background: #f8f9fa;
  font-weight: bold;
  border: 1px solid #ccc;
}

/* 지급/공제 테이블 나란히 배치 */
.slip-tables {
  display: flex;
  gap: 0;
}

/* 정렬 및 강조 */
.right-align {
  text-align: right;
}
.bold-label {
  font-weight: bold;
}
.highlight {
  font-weight: bold;
  color: #00a8e8;
}
.gray-row {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
}

/* 실 수령액 요약 줄 */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-weight: bold;
  background-color:#f8f9fa;
}

/* 하단 버튼 및 날짜 */
.footer {
  position: relative;
  margin-top: 30px;
}
.today {
  text-align: center;
  font-size: 18px;
  margin-bottom: 30px;
  font-weight: bold;
}
.btn {
  position: absolute;
  background-color: #00a8e8;
  color: white;
  font-weight: bold;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 30px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.btn:hover {
  background-color: white;
  color: #00a8e8;
  border-color: #00a8e8;
  box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
}
.btn.left { left: 0; }
.btn.right { right: 0; }

/* 인쇄 시 버튼 등 숨기기 */
.no-print { display:block; }
@media print {
  .no-print { display: none !important; }
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
