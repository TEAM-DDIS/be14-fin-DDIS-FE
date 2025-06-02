<!-- 급여명세서 상세 모달 -->
<template>
  <div class="modal-wrapper" @click.self="emit('close')">
    <div class="modal" ref="pdfContent">
      <!-- 닫기 버튼 -->
      <button class="close-btn no-print" @click="emit('close')">×</button>
      <h2 class="modal-title">급여명세서</h2>

      <!-- 사원 정보 테이블 -->
      <table class="info-table bordered">
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
      </table>

      <!-- 구분선 역할 -->
      <table class="section-title-table">
        <tr><td>세부 내역</td></tr>
      </table>

      <!-- 지급/공제 테이블 두 개 나란히 배치 -->
      <div class="slip-tables">

        <!-- 지급 테이블 -->
        <table class="table">
          <thead>
            <tr class="sub-head"><th colspan="2">지급</th></tr>
            <tr class="sub-sub-head"><th>항목</th><th>금액</th></tr>
          </thead>
          <tbody>
            <!-- 항목 이름과 금액 출력 -->
            <tr v-for="item in slip.pays" :key="item.label">
              <td :class="item.label.includes('총') ? 'bold-label gray-row' : ''">{{ item.label }}</td>
              <td :class="['right-align', item.label.includes('총') ? 'highlight gray-row' : '']">
                {{ formatCurrency(item.amount) }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 공제 테이블 -->
        <table class="table">
          <thead>
            <tr class="sub-head"><th colspan="2">공제</th></tr>
            <tr class="sub-sub-head"><th>항목</th><th>금액</th></tr>
          </thead>
          <tbody>
            <!-- 지급 항목 수와 맞추기 위해 빈 객체로 패딩된 항목까지 포함 -->
            <tr v-for="(item, index) in paddedDeductions" :key="index">
              <!-- 총공제 항목이면 강조 처리, 없으면 공백 문자 출력 -->
              <td :class="item.label?.includes('총') ? 'bold-label gray-row' : ''">
                {{ item.label || '\u00A0' }}
              </td>
              <td :class="['right-align', item.label?.includes('총') ? 'highlight gray-row' : '']">
                {{ item.amount !== undefined ? formatCurrency(item.amount) : '\u00A0' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 실 수령액 표시 영역 -->
      <div class="summary-row gray-row">
        <span>실 수령액(월)</span>
        <span class="highlight">{{ formatCurrency(slip.netSalary || netPay) }}</span>
      </div>

      <!-- 날짜 및 하단 버튼 -->
      <div class="footer">
        <p class="today bold">{{ today }}</p>
        <button class="btn left no-print">메일 전송</button>
        <button class="btn right no-print" @click="downloadPDF">PDF 다운로드</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDateFormat } from '@vueuse/core'
import html2pdf from 'html2pdf.js'

const props = defineProps(['slip'])           // 부모에서 받은 slip 객체
const emit = defineEmits(['close'])           // 닫기 이벤트
const pdfContent = ref(null)                  // PDF로 출력할 영역

// 실 수령액 계산: slip에서 전달된 값이 없으면 계산
const netPay = computed(() => props.slip.netSalary || (props.slip.totalPay - props.slip.totalDeduction))

// 오늘 날짜 포맷팅
const today = computed(() => {
  const date = new Date(props.slip.salaryDate)
  return useDateFormat(date, 'YYYY년 MM월 DD일').value
})

// 공제 항목의 길이를 지급 항목과 맞춰 빈 행 추가
const paddedDeductions = computed(() => {
  const max = props.slip.pays.length
  const current = props.slip.deductions.length
  const pad = max - current
  return [...props.slip.deductions, ...Array(pad).fill({})]
})

// 숫자를 천단위 쉼표로 변환
function formatCurrency(val) {
  return val?.toLocaleString() || ''
}

// (아직 미구현) 메일 전송 버튼
function sendMail() {
  alert('메일 전송 기능이 아직 구현되지 않았습니다.')
}

// PDF 다운로드 기능 (html2pdf.js)
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
  background: #f0f0f0;
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
  background: #f0f0f0;
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
  background: #f0f0f0;
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
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
}

/* 실 수령액 요약 줄 */
.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-weight: bold;
  background-color: #f0f0f0;
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
</style>
