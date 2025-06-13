<template>
  <div class="attendance-summary-card">
    <p class="greeting">
      <!-- name + position -->
      <span class="greeting-main">
        {{ name }} {{ position }}
      </span>
      <span class="greeting-sub">
        님 안녕하세요.
      </span>
      <br />

      <!-- status -->
      <span class="status-wrapper">
        <span class="status-main">{{ status }}</span>
        <span class="status-sub">입니다.</span>
      </span>
    </p>

    <div class="time-info">
      <p>출근 : {{ checkIn ? checkIn : '-' }}</p>
      <p>퇴근 : {{ checkOut ? checkOut : '-' }}</p>
    </div>

    <div class="circle-box">
      <div class="circle">
        <svg viewBox="0 0 36 36">
          <path
            class="circle-bg"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            class="circle-progress"
            :stroke-dasharray="`${percent}, 100`"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div class="percent-text">
          <strong>{{ Math.floor(percent) }}%</strong>
          <span class="label">근무 시간</span>
          <p class="time">{{ formattedWorkTime }}</p>
        </div>
      </div>
    </div>

    <button
    class="check-btn"
    :class="isCheckedIn ? 'btn-gray' : 'btn-blue'"
    @click="handleClick"
    :disabled="isButtonDisabled">
    {{ buttonText }}
  </button>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 상태
const name = ref('')
const position = ref('')
const checkIn = ref('')
const checkOut = ref('')
const isCheckedIn = ref(false)
const workSeconds = ref(0)
let timer = null
let checkInDate = null
let isLunchBreak = false // 점심시간 상태 저장
let alertedAtSix = false // 퇴근 누락 방지용 알림
const workStatusName = ref('')
const buttonText = computed(() => {
  if (!checkIn.value) return '출근'
  if (!checkOut.value) return '퇴근'
  return '완료됨'  // ✅ 퇴근 완료 상태
})
const isButtonDisabled = computed(() => {
  return !!(checkIn.value && checkOut.value)
})

// 현재 시각
const now = () => new Date()

// 서버 시간 받아오기 (출근/퇴근 기록 기반)
onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    console.error('토큰이 없습니다. 로그인 후 다시 시도하세요.')
    return
  }

  try {
    const res = await fetch('http://localhost:8000/attendance/status/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const data = await res.json()

    name.value = data.employeeName
    position.value = data.rankName
    checkIn.value = data.checkInTime ? data.checkInTime.split('.')[0] : null
    checkOut.value = data.checkOutTime ? data.checkOutTime.split('.')[0] : null

    if (data.checkInTime && data.checkOutTime) {
  const [h1, m1, s1] = data.checkInTime.split(':').map(Number)
  const [h2, m2, s2] = data.checkOutTime.split(':').map(Number)

  const checkInDate = now()
  checkInDate.setHours(h1, m1, s1, 0)

  const checkOutDate = now()
  checkOutDate.setHours(h2, m2, s2, 0)

  let diff = Math.floor((checkOutDate - checkInDate) / 1000)

  const noonStart = now()
  noonStart.setHours(12, 0, 0, 0)
  const noonEnd = now()
  noonEnd.setHours(13, 0, 0, 0)

  if (checkInDate < noonStart && checkOutDate > noonEnd) {
    diff -= 3600
  }

  workSeconds.value = Math.max(0, Math.min(diff, 8 * 3600))
  isCheckedIn.value = false
}

    if (data.checkInTime && !data.checkOutTime) {
      const [h, m, s] = data.checkInTime.split(':').map(Number)
      const checkInTime = now()
      checkInTime.setHours(h, m, s, 0)
      checkInDate = checkInTime

      const nowTime = now()
      const nineAM = now()
      nineAM.setHours(9, 0, 0, 0)

      const startTime = checkInTime < nineAM ? nineAM : checkInTime
      let elapsed = Math.floor((nowTime - startTime) / 1000)

      const noonStart = now()
      noonStart.setHours(12, 0, 0, 0)
      const noonEnd = now()
      noonEnd.setHours(13, 0, 0, 0)

      if (nowTime >= noonStart && nowTime < noonEnd) {
        isLunchBreak = true
        elapsed = Math.floor((noonStart - startTime) / 1000)
      } else if (checkInTime < noonStart && nowTime >= noonEnd) {
        elapsed -= 3600
      }

      elapsed = Math.min(elapsed, 8 * 3600)

      workSeconds.value = Math.max(elapsed, 0)
      isCheckedIn.value = true
      if (!(nowTime >= noonStart && nowTime < noonEnd)) {
        startTimer()
      }
    }

    const nowTime = now()
    const eighteenPM = now()
    eighteenPM.setHours(18, 0, 0, 0)

    if (data.checkInTime && !data.checkOutTime && nowTime >= eighteenPM) {
      workSeconds.value = 8 * 3600
      isCheckedIn.value = true
      status.value = '근무 종료'
    }

    const interval = setInterval(() => {
    const nowTime = now()

    const eighteenPM = new Date()
    eighteenPM.setHours(18, 0, 0, 0)

    // 조건: 18:00이 되었고, 출근했고 퇴근 안 했고, alert 한 번도 안 띄웠을 때
    if (
      nowTime.getHours() === 18 &&
      nowTime.getMinutes() === 0 &&
      !checkOut.value &&
      checkIn.value &&
      isCheckedIn.value &&
      !alertedAtSix
    ) {
      alertedAtSix = true
      alert('18시가 되었습니다. 퇴근을 등록해주세요.')
    }
  }, 1000) // 1초 간격으로 체크 (1분 단위로 해도 됨)

  onUnmounted(() => clearInterval(interval))

  workStatusName.value = data.workStatusName

  } catch (err) {
    console.error('내 근무 현황 API 호출 실패:', err)
  }
})

// 출근 등록
const postCheckIn = async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:8000/attendance/check-in', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const nowTime = now()
    checkIn.value = formatTime(nowTime)
    isCheckedIn.value = true
    workSeconds.value = 0
    startTimer()
  } catch (err) {
    console.error('출근 등록 실패:', err.message)
    alert('출근 등록 중 오류가 발생했습니다.\n' + err.message)
  }
}

// 퇴근 등록
const postCheckOut = async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await fetch('http://localhost:8000/attendance/check-out', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(errorText)
    }

    const nowTime = now()
    checkOut.value = formatTime(nowTime)
    isCheckedIn.value = false
    stopTimer()
  } catch (err) {
    console.error('퇴근 등록 실패:', err.message)
    alert('퇴근 등록 중 오류가 발생했습니다.\n' + err.message)
  }
}

// 출근/퇴근 버튼
const handleClick = () => {
  const nowTime = now()
  const hours = nowTime.getHours()
  const minutes = nowTime.getMinutes()
  const seconds = nowTime.getSeconds()

  // 출근
  if (!isCheckedIn.value) {
    const isAfter11_59_59 = hours > 11 || (hours === 11 && minutes === 59 && seconds > 59)
    const isBefore12 = hours < 12

    if (
      (workStatusName.value === '오전반차' && isBefore12) ||
      (workStatusName.value !== '오전반차' && !isBefore12)
    ) {
      alert('출근 가능 시간이 아닙니다.')
      return
    }

    checkIn.value = formatTime(nowTime)
    isCheckedIn.value = true
    workSeconds.value = 0
    startTimer()
    postCheckIn()
  }

  // 퇴근
  else {
    const isBefore12 = hours < 12
    const isBefore18 = hours < 18

    if (
      (workStatusName.value === '오후반차' && isBefore12) ||
      (workStatusName.value !== '오후반차' && isBefore18)
    ) {
      alert('퇴근 가능 시간이 아닙니다.')
      return
    }

    checkOut.value = formatTime(nowTime)
    isCheckedIn.value = false
    stopTimer()
    postCheckOut()
  }
}

const formatTime = time => {
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`
}

const startTimer = () => {

  const baseSeconds = 8 * 3600

  if (!checkIn.value) return

  // 출근 시간 기준 설정
  const [h, m, s] = checkIn.value.split(':').map(Number)
  checkInDate = now()
  checkInDate.setHours(h, m, s, 0)

  timer = setInterval(() => {
    const nowTime = now()

    // 점심시간 체크
    const noonStart = now()
    noonStart.setHours(12, 0, 0, 0)
    const noonEnd = now()
    noonEnd.setHours(13, 0, 0, 0)

    if (nowTime >= noonStart && nowTime < noonEnd) {
      status.value = '점심 시간'
      return // 점심시간 동안 타이머 멈춤
    }

    // 퇴근 시간 체크
    const eighteenPM = now()
    eighteenPM.setHours(18, 0, 0, 0)

    if (nowTime >= eighteenPM || workSeconds.value >= baseSeconds - 1) {
      workSeconds.value = baseSeconds
      stopTimer()
      status.value = '근무 종료'
      return
    }

    // ✅ 점심도 아니고 퇴근도 아니면 1초씩 누적
    workSeconds.value += 1
    status.value = '근무 중'
  }, 1000)
}


const stopTimer = () => {
  clearInterval(timer)
  timer = null
}

onUnmounted(() => {
  if (timer) stopTimer()
})

const status = computed(() => {
  const nowTime = now()
  const noonStart = now()
  noonStart.setHours(12, 0, 0, 0)
  const noonEnd = now()
  noonEnd.setHours(13, 0, 0, 0)

  if (isCheckedIn.value && nowTime >= noonStart && nowTime < noonEnd) {
    return '점심 시간'
  }
  if (!isCheckedIn.value && !checkOut.value) return '출근 전'
  if (isCheckedIn.value) return '근무 중'
  return '근무 종료'
})

const formattedWorkTime = computed(() => {
  const h = Math.floor(workSeconds.value / 3600)
  const m = Math.floor((workSeconds.value % 3600) / 60)
  const s = workSeconds.value % 60
  const pad = n => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
})

const percent = computed(() => {
  const base = 8 * 3600
  return Math.min((workSeconds.value / base) * 100, 100)
})
</script>


<style scoped>
  .attendance-summary-card {
    background: white;
    padding-top: 8px;    /* 상단만 8px 로 줄임 */
    padding-right: 18px;
    padding-bottom: 18px;
    padding-left: 18px;
    border-radius: 12px;
    box-shadow: 1px 1px 20px 1px rgba(0, 0, 0, 0.05);
    font-family: 'Pretendard', sans-serif;
  }

  .greeting {
      margin-top: 8px;
      margin-bottom: 8px;
      line-height: 1.6;
      text-align: left;
  }

  /* 이름·직급 */
  .greeting-main {
    font-size: 18px;
    font-weight: 600;
  }
  /* “님 안녕하세요.” */
  .greeting-sub {
    font-size: 16px;
    font-weight: 400;
  }

  /* status 부분 래핑 */
  .status-wrapper {
    display: inline-flex;
    align-items: baseline;
  }

  /* 동적 status(출근 전 / 근무 중 / 근무 종료) */
  .status-main {
    font-size: 18px;
    font-weight: 600;
  }

  /* “입니다.” */
  .status-sub {
    font-size: 16px;
    font-weight: 400;
    margin-left: 4px;
  }

  .time-info {
    font-size: 12px;
    margin-bottom: 16px;
    color: #666;
    text-align: right;
  }

  .circle-box {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .circle {
    position: relative;
    width: 210px;
    height: 210px;
  }

  svg {
    width: 100%;
    height: 100%;
    /* 시작 지점을 12시 방향으로 고정 */
    transform: rotate(0deg);
  }

  .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 3;
  }

  .circle-progress {
    fill: none;
    stroke: #C2EEFF;
    stroke-width: 3;
    transition: stroke-dasharray 0.5s ease;
  }

  .percent-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .percent-text strong {
    font-size: 22px;
    font-weight: bold;
    color: #000;
  }

  .percent-text .label {
    font-size: 12px;
    color: #666;
    margin: 4px 0 2px;
  }

  .percent-text .time {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
  }

  .check-btn {
    width: 220px;
    height: 45px;
    border: 1px solid transparent;
    border-radius: 10px;
    font-weight: bold;
    font-size: 18px;
    color: white;
    padding-bottom: 4px;
    margin: 0 auto;
    margin-top: 50px;
    display: block;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  .check-btn:hover {
    background-color: white;
      color: #00A8E8;
      border: 1px solid #00A8E8;
      box-shadow: inset 1px 1px 10px rgba(0, 0, 0, 0.25);
  }

  .btn-blue {
    background-color: #00A8E8;
  }

  .btn-gray {
    background-color: #00A8E8;
  }
</style>